"""
Database setup script for IDP plugin
Creates tables and initializes database
"""

import os
import sys
from pathlib import Path

# Add parent directory to path so we can import idp_plugin
# This allows running from both project root and idp_plugin folder
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import all models to register them
from idp_plugin.models.base import Base
from idp_plugin.models.documents import Document
from idp_plugin.models.ocr_outputs import OCROutput
from idp_plugin.models.extractions import Extraction
from idp_plugin.models.field_confidence import FieldConfidence
from idp_plugin.models.audit_logs import AuditLog
from idp_plugin.models.rag_knowledge_vectors import RAGKnowledgeVector
from idp_plugin.models.rag_schema_vectors import RAGSchemaVector

from idp_plugin.core.config import IDPConfig


def setup_database():
    """Create all database tables"""
    print("Setting up IDP database...")
    
    # Get database URL
    database_url = IDPConfig.DATABASE_URL
    print(f"Database URL: {database_url}")
    
    # Check if PostgreSQL database exists (for PostgreSQL only)
    if "postgresql" in database_url.lower():
        print("\n⚠ PostgreSQL detected. Make sure:")
        print("  1. PostgreSQL is running")
        print("  2. Database 'idp_db' exists (create it with: createdb idp_db)")
        print("  3. User credentials are correct")
        print("\n💡 Tip: For quick testing, use SQLite instead:")
        print("     Set IDP_DATABASE_URL=sqlite:///./idp_test.db in .env")
        print()
    
    # Create engine
    try:
        engine = create_engine(database_url, echo=False)
    except Exception as e:
        print(f"\n✗ Failed to create database engine: {e}")
        print("\n💡 Quick fix: Use SQLite for testing")
        print("   Update config.py or set environment variable:")
        print("   IDP_DATABASE_URL=sqlite:///./idp_test.db")
        raise
    
    # Test connection first
    print("\nTesting database connection...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
    except Exception as e:
        print(f"\n✗ Database connection failed: {e}")
        if "postgresql" in database_url.lower():
            print("\nPostgreSQL troubleshooting:")
            print("  1. Is PostgreSQL running? Check with: pg_isready")
            print("  2. Does database exist? Create with: createdb -U user idp_db")
            print("  3. Are credentials correct? Check config.py")
            print("\n💡 Quick alternative: Use SQLite")
            print("   Set IDP_DATABASE_URL=sqlite:///./idp_test.db")
        raise
    
    # Check if pgvector extension is needed
    if "postgresql" in database_url.lower():
        print("\nChecking for pgvector extension...")
        try:
            with engine.connect() as conn:
                # Check if extension exists
                result = conn.execute(text(
                    "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')"
                ))
                has_extension = result.scalar()
                
                if not has_extension:
                    print("Creating pgvector extension...")
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    conn.commit()
                    print("✓ pgvector extension created")
                else:
                    print("✓ pgvector extension already exists")
        except Exception as e:
            print(f"⚠ Warning: Could not check/create pgvector extension: {e}")
            print("  You may need to install pgvector manually")
    
    # Create all tables
    print("\nCreating tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created")
    
    # Create vector indexes (if using PostgreSQL with pgvector)
    if "postgresql" in database_url.lower():
        print("\nCreating vector indexes...")
        try:
            with engine.connect() as conn:
                # Index for knowledge vectors
                try:
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS idx_rag_knowledge_vectors_embedding 
                        ON idp_rag_knowledge_vectors 
                        USING ivfflat (embedding vector_cosine_ops)
                        WITH (lists = 100)
                    """))
                    print("✓ Knowledge vectors index created")
                except Exception as e:
                    print(f"⚠ Could not create knowledge vectors index: {e}")
                
                # Index for schema vectors
                try:
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS idx_rag_schema_vectors_embedding 
                        ON idp_rag_schema_vectors 
                        USING ivfflat (embedding vector_cosine_ops)
                        WITH (lists = 100)
                    """))
                    print("✓ Schema vectors index created")
                except Exception as e:
                    print(f"⚠ Could not create schema vectors index: {e}")
                
                conn.commit()
        except Exception as e:
            print(f"⚠ Warning: Could not create vector indexes: {e}")
            print("  You can create them manually later")
    
    print("\n✓ Database setup complete!")
    print("\nTables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")


if __name__ == "__main__":
    try:
        setup_database()
    except Exception as e:
        print(f"\n✗ Error setting up database: {e}")
        sys.exit(1)



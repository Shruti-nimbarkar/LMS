"""
Automated Database Setup Script
Creates database and runs schema + indexes
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from pathlib import Path
import sys

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '2003',  # Using credentials from build_capabilities.py
}

DATABASE_NAME = 'lab_reco_engine'  # New enhanced database name

# ============================================================================
# SETUP FUNCTIONS
# ============================================================================

def create_database(config, db_name):
    """Create database if it doesn't exist."""
    try:
        # Connect to postgres database
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database='postgres'  # Connect to default postgres DB
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cur.fetchone()
        
        if not exists:
            cur.execute(f'CREATE DATABASE "{db_name}"')
            print(f"✓ Database '{db_name}' created successfully")
        else:
            print(f"✓ Database '{db_name}' already exists")
        
        cur.close()
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        print(f"✗ Error connecting to PostgreSQL: {e}")
        print("  Please check:")
        print("  - PostgreSQL is running")
        print("  - Connection credentials are correct")
        print("  - You have permission to create databases")
        return False
    except Exception as e:
        print(f"✗ Error creating database: {e}")
        return False

def run_sql_file(conn, filepath):
    """Execute SQL file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            sql = f.read()
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()
            cur.close()
            print(f"✓ Executed {filepath.name}")
            return True
    except FileNotFoundError:
        print(f"✗ File not found: {filepath}")
        return False
    except psycopg2.Error as e:
        print(f"✗ Error executing {filepath.name}: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        conn.rollback()
        return False

def setup_schema(config, db_name):
    """Run schema and indexes."""
    try:
        # Connect to target database
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=db_name
        )
        
        # Get project root (parent of db directory)
        project_root = Path(__file__).parent.parent
        db_dir = project_root / 'db'
        
        # Run schema
        schema_file = db_dir / 'schema.sql'
        if not schema_file.exists():
            print(f"✗ Schema file not found: {schema_file}")
            return False
        
        print(f"\nRunning schema from: {schema_file}")
        if not run_sql_file(conn, schema_file):
            conn.close()
            return False
        
        # Run indexes
        indexes_file = db_dir / 'indexes.sql'
        if not indexes_file.exists():
            print(f"✗ Indexes file not found: {indexes_file}")
            return False
        
        print(f"\nRunning indexes from: {indexes_file}")
        if not run_sql_file(conn, indexes_file):
            conn.close()
            return False
        
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        print(f"✗ Error connecting to database: {e}")
        return False
    except Exception as e:
        print(f"✗ Error setting up schema: {e}")
        return False

def verify_setup(config, db_name):
    """Verify database setup."""
    try:
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=db_name
        )
        cur = conn.cursor()
        
        # Check tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cur.fetchall()]
        expected_tables = ['domains', 'disciplines', 'lab_capabilities', 
                          'lab_domain_confidence', 'labs', 'standards', 
                          'test_families', 'tests']
        
        print(f"\n✓ Found {len(tables)} tables: {', '.join(tables)}")
        if set(tables) == set(expected_tables):
            print("✓ All expected tables present")
        else:
            missing = set(expected_tables) - set(tables)
            extra = set(tables) - set(expected_tables)
            if missing:
                print(f"⚠ Missing tables: {missing}")
            if extra:
                print(f"⚠ Extra tables: {extra}")
        
        # Check indexes
        cur.execute("""
            SELECT COUNT(*) 
            FROM pg_indexes 
            WHERE schemaname = 'public'
        """)
        index_count = cur.fetchone()[0]
        print(f"✓ Found {index_count} indexes (expected ~28)")
        
        # Check constraints
        cur.execute("""
            SELECT COUNT(*) 
            FROM information_schema.table_constraints 
            WHERE table_schema = 'public'
        """)
        constraint_count = cur.fetchone()[0]
        print(f"✓ Found {constraint_count} constraints")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Error verifying setup: {e}")
        return False

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main setup function."""
    print("=" * 80)
    print("LAB RECOMMENDATION ENGINE - DATABASE SETUP")
    print("=" * 80)
    
    # Step 1: Create database
    print("\n[STEP 1] Creating database...")
    if not create_database(DB_CONFIG, DATABASE_NAME):
        print("\n✗ Database creation failed. Exiting.")
        sys.exit(1)
    
    # Step 2: Setup schema
    print("\n[STEP 2] Setting up schema and indexes...")
    if not setup_schema(DB_CONFIG, DATABASE_NAME):
        print("\n✗ Schema setup failed. Exiting.")
        sys.exit(1)
    
    # Step 3: Verify
    print("\n[STEP 3] Verifying setup...")
    if not verify_setup(DB_CONFIG, DATABASE_NAME):
        print("\n⚠ Verification found issues. Please review.")
        sys.exit(1)
    
    print("\n" + "=" * 80)
    print("✓ DATABASE SETUP COMPLETE!")
    print("=" * 80)
    print(f"\nDatabase '{DATABASE_NAME}' is ready for use.")
    print("\nNext steps:")
    print("1. Update your Python scripts with database connection config")
    print("2. Run data ingestion: python main.py")
    print("3. Verify data using verification queries")

if __name__ == '__main__':
    # Check if password is still default
    if DB_CONFIG['password'] == 'postgres':
        print("⚠ WARNING: Using default password 'postgres'")
        print("  Please update DB_CONFIG['password'] in this script")
        response = input("  Continue anyway? (y/n): ")
        if response.lower() != 'y':
            print("Exiting. Please update the password and try again.")
            sys.exit(0)
    
    main()


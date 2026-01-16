"""
RAG Knowledge Vector model for IDP plugin
Stores knowledge base embeddings (standards, test names, etc.)
"""

from sqlalchemy import Column, String, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid


class RAGKnowledgeVector(Base, TimestampMixin):
    """
    RAG Knowledge Vector table - stores knowledge base embeddings
    Contains: standards, test names, field synonyms, domain knowledge
    NO document-specific data allowed
    """
    __tablename__ = "idp_rag_knowledge_vectors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    
    # Content information
    content_type = Column(String(100), nullable=False, index=True)  # "standard", "test_name", "synonym", "domain_knowledge"
    content_text = Column(Text, nullable=False)  # The actual knowledge text
    
    # Vector embedding (1536 dimensions for OpenAI embeddings)
    embedding = Column(ARRAY(Float), nullable=False)  # Vector of 1536 floats
    
    # Metadata for traceability
    source = Column(String(200), nullable=True)  # Source of knowledge (e.g., "ISO_17025", "internal_standards")
    source_version = Column(String(50), nullable=True)  # Version of source
    category = Column(String(100), nullable=True, index=True)  # Category for filtering
    
    # Additional metadata
    knowledge_metadata = Column(JSONB, default=dict, name="metadata")  # Additional context (aliases, related terms, etc.)
    
    # Index for vector similarity search (created via migration)
    # CREATE INDEX ON idp_rag_knowledge_vectors USING ivfflat (embedding vector_cosine_ops);


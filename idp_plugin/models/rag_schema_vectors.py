"""
RAG Schema Vector model for IDP plugin
Stores schema descriptions and field definitions
"""

from sqlalchemy import Column, String, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid


class RAGSchemaVector(Base, TimestampMixin):
    """
    RAG Schema Vector table - stores schema descriptions and field definitions
    Contains: field descriptions, schema structure, validation rules
    NO document-specific data allowed
    """
    __tablename__ = "idp_rag_schema_vectors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    
    # Schema information
    document_type = Column(String(100), nullable=False, index=True)  # "trf_jrf", "rfq", "certificate", "calibration_report"
    field_path = Column(String(500), nullable=False)  # JSON path to field (e.g., "customer.name")
    field_name = Column(String(200), nullable=False)  # Human-readable field name
    
    # Schema description
    description = Column(Text, nullable=False)  # Field description, expected format, examples
    data_type = Column(String(50), nullable=True)  # "string", "number", "date", "array", etc.
    
    # Vector embedding (1536 dimensions for OpenAI embeddings)
    embedding = Column(ARRAY(Float), nullable=False)  # Vector of 1536 floats
    
    # Metadata for traceability
    schema_version = Column(String(50), nullable=True)  # Schema version
    is_required = Column(String(10), default="false", nullable=False)  # "true" or "false"
    validation_rules = Column(JSONB, nullable=True)  # Validation rules (regex, min/max, etc.)
    
    # Additional metadata
    schema_metadata = Column(JSONB, default=dict, name="metadata")  # Examples, synonyms, related fields, etc.
    
    # Index for vector similarity search (created via migration)
    # CREATE INDEX ON idp_rag_schema_vectors USING ivfflat (embedding vector_cosine_ops);



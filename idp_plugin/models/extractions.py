"""
Extraction model for IDP plugin
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid
from idp_plugin.models.documents import Document


class Extraction(Base, TimestampMixin):
    """
    Extraction table - stores LLM extraction results
    """
    __tablename__ = "idp_extractions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    document_id = Column(UUID(as_uuid=False), ForeignKey("idp_documents.id"), nullable=False, unique=True, index=True)
    
    # Extraction metadata
    document_type = Column(String(50), nullable=False)  # Document type used for extraction
    extraction_model = Column(String(50), default="gpt-4.1", nullable=False)
    extraction_version = Column(String(20), nullable=True)  # Schema version used
    
    # Extracted data (canonical JSON)
    extracted_data = Column(JSONB, nullable=False)  # Structured JSON matching canonical schema
    
    # Extraction metadata
    extraction_metadata = Column(JSONB, default=dict)  # Tokens used, temperature, etc.
    
    # Validation
    is_valid = Column(String(10), default="pending", nullable=False)  # "valid", "invalid", "pending"
    validation_errors = Column(JSONB, nullable=True)  # Schema validation errors
    
    # Relationship
    document = relationship("Document", backref="extraction", uselist=False)






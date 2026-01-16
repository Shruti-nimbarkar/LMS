"""
Field Confidence model for IDP plugin
"""

from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid
from idp_plugin.models.extractions import Extraction


class FieldConfidence(Base, TimestampMixin):
    """
    Field Confidence table - stores confidence scores per field
    """
    __tablename__ = "idp_field_confidence"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    extraction_id = Column(UUID(as_uuid=False), ForeignKey("idp_extractions.id"), nullable=False, index=True)
    
    # Field information
    field_path = Column(String(500), nullable=False)  # JSON path to field (e.g., "customer.name")
    field_name = Column(String(200), nullable=False)  # Human-readable field name
    
    # Confidence scores (0-1)
    ocr_confidence = Column(Float, nullable=True)  # OCR quality signal
    llm_confidence = Column(Float, nullable=True)  # GPT-4.1 extraction certainty
    rag_confidence = Column(Float, nullable=True)  # RAG similarity score
    
    # Combined confidence
    overall_confidence = Column(Float, nullable=False)  # Weighted combination
    
    # Confidence metadata
    confidence_metadata = Column(JSONB, default=dict)  # Detailed breakdown, reasoning
    
    # Relationship
    extraction = relationship("Extraction", backref="field_confidence_scores")






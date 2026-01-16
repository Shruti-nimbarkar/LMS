"""
OCR Output model for IDP plugin
"""

from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid
from idp_plugin.models.documents import Document


class OCROutput(Base, TimestampMixin):
    """
    OCR Output table - stores page-wise OCR results
    """
    __tablename__ = "idp_ocr_outputs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    document_id = Column(UUID(as_uuid=False), ForeignKey("idp_documents.id"), nullable=False, index=True)
    
    # Page information
    page_number = Column(Integer, nullable=False)
    total_pages = Column(Integer, nullable=False)
    
    # OCR results
    text = Column(Text, nullable=False)  # Extracted text
    ocr_engine = Column(String(50), nullable=False)  # "pdfplumber" or "paddleocr"
    
    # Quality metrics
    confidence_score = Column(Float, nullable=True)  # Overall confidence (0-1)
    word_count = Column(Integer, nullable=True)
    character_count = Column(Integer, nullable=True)
    
    # Raw OCR data (bounding boxes, etc.)
    raw_data = Column(JSONB, nullable=True)  # Engine-specific raw output
    
    # Relationship
    document = relationship("Document", backref="ocr_outputs")






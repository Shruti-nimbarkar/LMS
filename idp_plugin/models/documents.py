"""
Document model for IDP plugin
"""

from sqlalchemy import Column, String, Enum, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid
import enum


class DocumentType(str, enum.Enum):
    """Supported document types"""
    TRF_JRF = "trf_jrf"
    RFQ = "rfq"
    CERTIFICATE = "certificate"
    CALIBRATION_REPORT = "calibration_report"
    UNKNOWN = "unknown"


class DocumentStatus(str, enum.Enum):
    """Document processing status"""
    UPLOADED = "uploaded"
    OCR_PROCESSING = "ocr_processing"
    OCR_COMPLETED = "ocr_completed"
    OCR_FAILED = "ocr_failed"
    EXTRACTION_PROCESSING = "extraction_processing"
    EXTRACTION_COMPLETED = "extraction_completed"
    EXTRACTION_FAILED = "extraction_failed"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base, TimestampMixin):
    """
    Document table - stores uploaded documents
    """
    __tablename__ = "idp_documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)  # Storage path (local or S3)
    file_type = Column(String(50), nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # Size in bytes
    document_type = Column(Enum(DocumentType), default=DocumentType.UNKNOWN, nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False)
    
    # Metadata
    document_metadata = Column(JSONB, default=dict, name="metadata")  # Additional metadata (user_id, project_id, etc.)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Processing info
    page_count = Column(Integer, nullable=True)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)



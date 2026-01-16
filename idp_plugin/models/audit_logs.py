"""
Audit Log model for IDP plugin
"""

from sqlalchemy import Column, String, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from idp_plugin.models.base import Base, TimestampMixin, generate_uuid
from idp_plugin.models.documents import Document
from idp_plugin.models.extractions import Extraction
import enum


class AuditAction(str, enum.Enum):
    """Types of audit actions"""
    DOCUMENT_UPLOADED = "document_uploaded"
    OCR_STARTED = "ocr_started"
    OCR_COMPLETED = "ocr_completed"
    OCR_FAILED = "ocr_failed"
    EXTRACTION_STARTED = "extraction_started"
    EXTRACTION_COMPLETED = "extraction_completed"
    EXTRACTION_FAILED = "extraction_failed"
    FIELD_CORRECTED = "field_corrected"
    FIELD_MAPPED = "field_mapped"
    MAPPING_APPLIED = "mapping_applied"
    CONFIDENCE_CALCULATED = "confidence_calculated"
    USER_CORRECTION = "user_correction"
    SYSTEM_UPDATE = "system_update"


class AuditLog(Base, TimestampMixin):
    """
    Audit Log table - stores all operations for traceability
    """
    __tablename__ = "idp_audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid, nullable=False)
    
    # Entity references
    document_id = Column(UUID(as_uuid=False), ForeignKey("idp_documents.id"), nullable=True, index=True)
    extraction_id = Column(UUID(as_uuid=False), ForeignKey("idp_extractions.id"), nullable=True, index=True)
    
    # Action details
    action = Column(Enum(AuditAction), nullable=False, index=True)
    action_description = Column(Text, nullable=True)
    
    # User/System info
    performed_by = Column(String(200), nullable=True)  # User ID or "system"
    performed_by_type = Column(String(50), default="system", nullable=False)  # "user" or "system"
    
    # Change tracking
    field_path = Column(String(500), nullable=True)  # Field that was changed
    old_value = Column(JSONB, nullable=True)  # Previous value
    new_value = Column(JSONB, nullable=True)  # New value
    
    # Additional context
    audit_metadata = Column(JSONB, default=dict, name="metadata")  # Additional context (IP, user agent, etc.)
    
    # Relationships
    document = relationship("Document", backref="audit_logs")
    extraction = relationship("Extraction", backref="audit_logs")



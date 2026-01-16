"""
Audit service for IDP plugin
Centralized audit logging functionality
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from idp_plugin.models.audit_logs import AuditLog, AuditAction


class AuditService:
    """
    Centralized audit logging service
    Ensures all operations are logged for traceability
    """
    
    def __init__(self, db: Session):
        """
        Initialize audit service
        
        Args:
            db: Database session
        """
        self.db = db
    
    def log_action(
        self,
        action: AuditAction,
        document_id: Optional[str] = None,
        extraction_id: Optional[str] = None,
        performed_by: str = "system",
        performed_by_type: str = "system",
        field_path: Optional[str] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Log an action
        
        Args:
            action: Action type
            document_id: Document ID (optional)
            extraction_id: Extraction ID (optional)
            performed_by: User or system identifier
            performed_by_type: "user" or "system"
            field_path: Field path if field-specific action
            old_value: Previous value (for updates)
            new_value: New value (for updates)
            metadata: Additional metadata
        
        Returns:
            Created AuditLog object
        """
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            document_id=document_id,
            extraction_id=extraction_id,
            action=action,
            action_description=self._get_action_description(action),
            performed_by=performed_by,
            performed_by_type=performed_by_type,
            field_path=field_path,
            old_value=old_value,
            new_value=new_value,
            audit_metadata=metadata or {}
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def log_field_correction(
        self,
        extraction_id: str,
        field_path: str,
        old_value: Any,
        new_value: Any,
        user_id: str,
        reason: Optional[str] = None
    ) -> AuditLog:
        """
        Log a field correction by user
        
        Args:
            extraction_id: Extraction ID
            field_path: Field path
            old_value: Original value
            new_value: Corrected value
            user_id: User who made the correction
            reason: Reason for correction (optional)
        
        Returns:
            Created AuditLog object
        """
        return self.log_action(
            action=AuditAction.FIELD_CORRECTED,
            extraction_id=extraction_id,
            performed_by=user_id,
            performed_by_type="user",
            field_path=field_path,
            old_value=old_value,
            new_value=new_value,
            metadata={"reason": reason} if reason else {}
        )
    
    def log_user_correction(
        self,
        document_id: str,
        extraction_id: str,
        corrections: Dict[str, Dict[str, Any]],
        user_id: str
    ) -> List[AuditLog]:
        """
        Log multiple field corrections
        
        Args:
            document_id: Document ID
            extraction_id: Extraction ID
            corrections: Dictionary of {field_path: {"old": old_value, "new": new_value}}
            user_id: User who made corrections
        
        Returns:
            List of created AuditLog objects
        """
        logs = []
        
        for field_path, values in corrections.items():
            log = self.log_field_correction(
                extraction_id=extraction_id,
                field_path=field_path,
                old_value=values.get("old"),
                new_value=values.get("new"),
                user_id=user_id
            )
            logs.append(log)
        
        return logs
    
    def get_audit_trail(
        self,
        document_id: Optional[str] = None,
        extraction_id: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get audit trail for a document or extraction
        
        Args:
            document_id: Document ID (optional)
            extraction_id: Extraction ID (optional)
            limit: Maximum number of records to return
        
        Returns:
            List of AuditLog objects
        """
        query = self.db.query(AuditLog)
        
        if document_id:
            query = query.filter(AuditLog.document_id == document_id)
        
        if extraction_id:
            query = query.filter(AuditLog.extraction_id == extraction_id)
        
        return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    def _get_action_description(self, action: AuditAction) -> str:
        """
        Get human-readable description for action
        
        Args:
            action: Action type
        
        Returns:
            Description string
        """
        descriptions = {
            AuditAction.DOCUMENT_UPLOADED: "Document uploaded",
            AuditAction.OCR_STARTED: "OCR processing started",
            AuditAction.OCR_COMPLETED: "OCR processing completed",
            AuditAction.OCR_FAILED: "OCR processing failed",
            AuditAction.EXTRACTION_STARTED: "Extraction started",
            AuditAction.EXTRACTION_COMPLETED: "Extraction completed",
            AuditAction.EXTRACTION_FAILED: "Extraction failed",
            AuditAction.FIELD_CORRECTED: "Field value corrected",
            AuditAction.FIELD_MAPPED: "Field mapped to target schema",
            AuditAction.MAPPING_APPLIED: "Mapping applied to extraction",
            AuditAction.CONFIDENCE_CALCULATED: "Confidence scores calculated",
            AuditAction.USER_CORRECTION: "User made corrections",
            AuditAction.SYSTEM_UPDATE: "System update performed"
        }
        
        return descriptions.get(action, "Unknown action")



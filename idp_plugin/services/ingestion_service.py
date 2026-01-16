"""
Ingestion service for IDP plugin
Handles file uploads and document creation
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, Any
from idp_plugin.models.documents import Document, DocumentType, DocumentStatus
from idp_plugin.models.audit_logs import AuditLog, AuditAction
from idp_plugin.utils.storage import StorageService
from idp_plugin.utils.validators import validate_file_type, validate_file_size
from idp_plugin.core.exceptions import DocumentValidationError, StorageError
import uuid


class IngestionService:
    """
    Service for document ingestion
    """
    
    def __init__(self, db: Session, storage_service: Optional[StorageService] = None):
        """
        Initialize ingestion service
        
        Args:
            db: Database session
            storage_service: Storage service instance (optional, creates default if not provided)
        """
        self.db = db
        self.storage_service = storage_service or StorageService()
    
    def upload_document(
        self,
        file_content: bytes,
        filename: str,
        content_type: Optional[str] = None,
        document_type: Optional[DocumentType] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> Document:
        """
        Upload and store a document
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            content_type: MIME type (optional)
            document_type: Document type (optional, will be UNKNOWN if not provided)
            metadata: Additional metadata (optional)
            user_id: User ID who uploaded (optional)
            
        Returns:
            Created Document object
            
        Raises:
            DocumentValidationError: If validation fails
            StorageError: If storage operation fails
        """
        # Validate file
        file_size = len(file_content)
        validate_file_size(file_size)
        mime_type, extension = validate_file_type(filename, content_type)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{extension}"
        
        # Determine subdirectory (e.g., "2024/01" for current year/month)
        now = datetime.utcnow()
        subdirectory = f"{now.year}/{now.month:02d}"
        
        # Save file to storage
        try:
            file_path = self.storage_service.save_file(file_content, unique_filename, subdirectory)
        except Exception as e:
            raise StorageError(f"Failed to save file: {str(e)}")
        
        # Create document record
        document = Document(
            id=str(uuid.uuid4()),
            filename=unique_filename,
            original_filename=filename,
            file_path=file_path,
            file_type=mime_type,
            file_size=file_size,
            document_type=document_type or DocumentType.UNKNOWN,
            status=DocumentStatus.UPLOADED,
            document_metadata=metadata or {},
            processing_started_at=datetime.utcnow()
        )
        
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        
        # Create audit log
        self._create_audit_log(
            document_id=document.id,
            action=AuditAction.DOCUMENT_UPLOADED,
            performed_by=user_id or "system",
            performed_by_type="user" if user_id else "system",
            metadata={
                "filename": filename,
                "file_size": file_size,
                "file_type": mime_type,
                "document_type": document_type.value if document_type else None
            }
        )
        
        return document
    
    def _create_audit_log(
        self,
        document_id: str,
        action: AuditAction,
        performed_by: str,
        performed_by_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create an audit log entry"""
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            document_id=document_id,
            action=action,
            performed_by=performed_by,
            performed_by_type=performed_by_type,
            audit_metadata=metadata or {}
        )
        self.db.add(audit_log)
        self.db.commit()



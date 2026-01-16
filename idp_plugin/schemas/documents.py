"""
Pydantic schemas for document operations
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from idp_plugin.models.documents import DocumentType, DocumentStatus
import uuid


class DocumentUploadRequest(BaseModel):
    """Request schema for document upload"""
    document_type: Optional[DocumentType] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class DocumentResponse(BaseModel):
    """Response schema for document"""
    id: str
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    document_type: DocumentType
    status: DocumentStatus
    metadata: Dict[str, Any]
    page_count: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True






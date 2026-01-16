"""
Upload endpoint for IDP plugin
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from idp_plugin.core.database import get_db
from idp_plugin.services.ingestion_service import IngestionService
from idp_plugin.schemas.documents import DocumentResponse, DocumentUploadRequest
from idp_plugin.models.documents import DocumentType
from idp_plugin.core.exceptions import DocumentValidationError, StorageError
import json

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = None,
    metadata: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Upload a document for processing
    
    - **file**: Document file (PDF or image)
    - **document_type**: Optional document type (trf_jrf, rfq, certificate, calibration_report)
    - **metadata**: Optional JSON metadata string
    """
    try:
        # Parse document type
        doc_type = None
        if document_type:
            try:
                doc_type = DocumentType(document_type.lower())
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid document_type. Allowed values: {[dt.value for dt in DocumentType]}"
                )
        
        # Parse metadata
        metadata_dict = {}
        if metadata:
            try:
                metadata_dict = json.loads(metadata)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid metadata JSON"
                )
        
        # Read file content
        file_content = await file.read()
        
        # Create ingestion service and upload
        ingestion_service = IngestionService(db)
        document = ingestion_service.upload_document(
            file_content=file_content,
            filename=file.filename or "unknown",
            content_type=file.content_type,
            document_type=doc_type,
            metadata=metadata_dict,
            user_id=None  # TODO: Get from auth context
        )
        
        return document
    
    except DocumentValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except StorageError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )






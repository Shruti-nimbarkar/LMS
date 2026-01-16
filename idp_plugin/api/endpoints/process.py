"""
Process endpoint for IDP plugin
Handles document processing (OCR + Extraction)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from idp_plugin.core.database import get_db
from idp_plugin.models.documents import Document
from idp_plugin.services.ocr_service import OCRService
from idp_plugin.services.extraction_service import ExtractionService
from idp_plugin.core.exceptions import OCRProcessingError, ExtractionError

router = APIRouter()


@router.post("/process/{document_id}", status_code=status.HTTP_202_ACCEPTED)
async def process_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Process a document (OCR + Extraction)
    
    - **document_id**: Document ID to process
    """
    try:
        # Get document
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Perform OCR
        ocr_service = OCRService(db)
        ocr_results = ocr_service.process_document(document)
        
        # Perform extraction
        extraction_service = ExtractionService(db)
        extraction = extraction_service.extract_from_document(document)
        
        return {
            "document_id": document_id,
            "status": "processing_completed",
            "ocr_pages": len(ocr_results),
            "extraction_id": extraction.id,
            "extraction_valid": extraction.is_valid == "valid"
        }
    
    except OCRProcessingError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )
    except ExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )






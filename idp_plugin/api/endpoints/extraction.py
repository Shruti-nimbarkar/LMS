"""
Extraction endpoint for IDP plugin
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from idp_plugin.core.database import get_db
from idp_plugin.models.extractions import Extraction
from idp_plugin.schemas.extraction import ExtractionResponse

router = APIRouter()


@router.get("/{document_id}/extraction", response_model=ExtractionResponse)
async def get_extraction(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Get extraction results for a document
    
    - **document_id**: Document ID
    """
    extraction = db.query(Extraction).filter(
        Extraction.document_id == document_id
    ).first()
    
    if not extraction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extraction not found"
        )
    
    return extraction






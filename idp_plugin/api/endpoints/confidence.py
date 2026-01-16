"""
Confidence endpoint for IDP plugin
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from idp_plugin.core.database import get_db
from idp_plugin.models.extractions import Extraction
from idp_plugin.models.field_confidence import FieldConfidence
from idp_plugin.services.confidence_service import ConfidenceService
from idp_plugin.schemas.confidence import ConfidenceResponse, ConfidenceSummaryResponse

router = APIRouter()


@router.get("/{document_id}/confidence", response_model=ConfidenceSummaryResponse)
async def get_confidence(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Get confidence scores for a document extraction
    
    - **document_id**: Document ID
    """
    # Get extraction
    extraction = db.query(Extraction).filter(
        Extraction.document_id == document_id
    ).first()
    
    if not extraction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extraction not found"
        )
    
    # Calculate confidence if not already calculated
    confidence_service = ConfidenceService(db)
    confidence_records = db.query(FieldConfidence).filter(
        FieldConfidence.extraction_id == extraction.id
    ).all()
    
    if not confidence_records:
        # Calculate confidence
        confidence_records = confidence_service.calculate_confidence_for_extraction(extraction)
    
    # Get summary
    summary = confidence_service.get_confidence_summary(extraction)
    
    return summary






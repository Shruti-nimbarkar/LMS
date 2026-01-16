"""
Mapping endpoint for IDP plugin
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from idp_plugin.core.database import get_db
from idp_plugin.models.extractions import Extraction
from idp_plugin.services.mapping_service import MappingService
from idp_plugin.core.exceptions import MappingError

router = APIRouter()


@router.post("/{document_id}/map")
async def map_extraction(
    document_id: str,
    target: str = Query(..., description="Target schema (e.g., 'LMS')"),
    db: Session = Depends(get_db)
):
    """
    Map extraction to target schema
    
    - **document_id**: Document ID
    - **target**: Target schema identifier
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
    
    # Perform mapping
    try:
        mapping_service = MappingService(db)
        mapped_data = mapping_service.map_to_target(extraction, target)
        
        return {
            "document_id": document_id,
            "extraction_id": extraction.id,
            "target_schema": target,
            "mapped_data": mapped_data
        }
    
    except MappingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mapping failed: {str(e)}"
        )






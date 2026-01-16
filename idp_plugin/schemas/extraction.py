"""
Pydantic schemas for extraction operations
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class ExtractionResponse(BaseModel):
    """Response schema for extraction"""
    id: str
    document_id: str
    document_type: str
    extraction_model: str
    extracted_data: Dict[str, Any]
    is_valid: str
    validation_errors: Optional[Dict[str, Any]] = None
    extraction_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True






"""
Pydantic schemas for OCR operations
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class OCRResultResponse(BaseModel):
    """Response schema for OCR result"""
    id: str
    document_id: str
    page_number: int
    total_pages: int
    text: str
    ocr_engine: str
    confidence_score: Optional[float] = None
    word_count: Optional[int] = None
    character_count: Optional[int] = None
    raw_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True






"""
Pydantic schemas for confidence operations
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class FieldConfidenceResponse(BaseModel):
    """Response schema for field confidence"""
    field_path: str
    field_name: str
    ocr_confidence: Optional[float] = None
    llm_confidence: Optional[float] = None
    rag_confidence: Optional[float] = None
    overall_confidence: float
    confidence_metadata: Dict[str, Any]


class ConfidenceSummaryResponse(BaseModel):
    """Response schema for confidence summary"""
    extraction_id: str
    total_fields: int
    average_confidence: float
    min_confidence: float
    max_confidence: float
    confidence_distribution: Dict[str, int]
    fields_below_threshold: List[Dict[str, Any]]






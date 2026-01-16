from pydantic import BaseModel
from datetime import date
from typing import Optional

class CertificationCreate(BaseModel):
    certificateNumber: str
    standard: Optional[str] = None
    status: Optional[str] = "Pending"
    issueDate: Optional[date] = None
    expiryDate: Optional[date] = None

class CertificationResponse(CertificationCreate):
    id: int

    class Config:
        from_attributes = True

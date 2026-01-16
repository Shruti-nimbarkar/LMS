from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NCRCreate(BaseModel):
    ncrNumber: Optional[str] = None
    description: Optional[str] = None
    status: str
    raisedBy: Optional[str] = None

class NCROut(NCRCreate):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional


class TRFCreate(BaseModel):
    trfNumber: Optional[str] = None
    projectId: int
    projectName: str
    notes: Optional[str] = None


class TRFResponse(TRFCreate):
    id: int

    model_config = {
        "from_attributes": True
    }
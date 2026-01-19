from pydantic import BaseModel
from typing import Optional
from datetime import date

class TestResultCreate(BaseModel):
    testExecutionId: int
    passFail: bool
    testType: Optional[str] = None
    testDate: Optional[date] = None

class TestResultOut(TestResultCreate):
    id: int

    class Config:
        from_attributes = True

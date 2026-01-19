from pydantic import BaseModel
from typing import Optional
from datetime import date

class TestExecutionCreate(BaseModel):
    testPlanId: int
    status: Optional[str] = "completed"
    executionDate: Optional[date] = None
    executedByName: Optional[str] = None

class TestExecutionOut(TestExecutionCreate):
    id: int

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TestPlanCreate(BaseModel):
    name: str
    testType: str
    status: Optional[str] = "Draft"
    description: Optional[str] = None
    projectId: Optional[int] = None
    projectName: Optional[str] = None
    assignedEngineerName: Optional[str] = None

class TestPlanOut(TestPlanCreate):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True

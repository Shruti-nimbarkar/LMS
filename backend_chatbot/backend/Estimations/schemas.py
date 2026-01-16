from pydantic import BaseModel
from typing import List

class EstimationTestItemCreate(BaseModel):
    testTypeId: int
    numberOfDUT: int
    hours: float
    ratePerHour: float
    remarks: str | None = None

class EstimationCreate(BaseModel):
    rfqId: int
    tests: List[EstimationTestItemCreate]
    margin: float
    discount: float
    notes: str | None = None

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.test_results.models import TestResult
from backend.test_results.schemas import TestResultCreate, TestResultOut

router = APIRouter(prefix="/test-results", tags=["Test Results"])

# 🔹 GET ALL RESULTS
@router.get("/", response_model=List[TestResultOut])
def get_all_results(db: Session = Depends(get_db)):
    return db.query(TestResult).order_by(TestResult.id.desc()).all()

# 🔹 GET RESULTS BY EXECUTION
@router.get("/by-execution/{execution_id}", response_model=List[TestResultOut])
def get_by_execution(execution_id: int, db: Session = Depends(get_db)):
    return (
        db.query(TestResult)
        .filter(TestResult.testExecutionId == execution_id)
        .order_by(TestResult.id.desc())
        .all()
    )

# 🔹 CREATE RESULT
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_result(data: TestResultCreate, db: Session = Depends(get_db)):
    result = TestResult(
        testExecutionId=data.testExecutionId,
        passFail=data.passFail,
        testType=data.testType,
        testDate=data.testDate
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "success": True,
        "result": result
    }

# 🔹 GET RESULT BY ID
@router.get("/{result_id}", response_model=TestResultOut)
def get_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Test result not found")
    return result

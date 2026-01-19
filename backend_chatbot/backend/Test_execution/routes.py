from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.Test_execution.models import TestExecution
from backend.Test_execution.schemas import TestExecutionCreate, TestExecutionOut

router = APIRouter(prefix="/test-executions", tags=["Test Executions"])

# 🔹 GET ALL EXECUTIONS
@router.get("/", response_model=List[TestExecutionOut])
def get_all_executions(db: Session = Depends(get_db)):
    return db.query(TestExecution).order_by(TestExecution.id.desc()).all()

# 🔹 GET EXECUTIONS BY TEST PLAN
@router.get("/by-test-plan/{test_plan_id}", response_model=List[TestExecutionOut])
def get_by_test_plan(test_plan_id: int, db: Session = Depends(get_db)):
    return (
        db.query(TestExecution)
        .filter(TestExecution.testPlanId == test_plan_id)
        .order_by(TestExecution.id.desc())
        .all()
    )

# 🔹 CREATE EXECUTION
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_execution(data: TestExecutionCreate, db: Session = Depends(get_db)):
    execution = TestExecution(
        testPlanId=data.testPlanId,
        status=data.status,
        executionDate=data.executionDate,
        executedByName=data.executedByName
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    return {
        "success": True,
        "execution": execution
    }

# 🔹 GET EXECUTION BY ID
@router.get("/{execution_id}", response_model=TestExecutionOut)
def get_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = db.query(TestExecution).filter(TestExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Test execution not found")
    return execution

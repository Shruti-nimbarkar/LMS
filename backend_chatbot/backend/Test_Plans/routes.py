from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.Test_Plans.models import TestPlan
from backend.Test_Plans.schemas import TestPlanCreate, TestPlanOut

router = APIRouter(prefix="/test-plans", tags=["Test Plans"])

# 🔹 GET ALL TEST PLANS
@router.get("/", response_model=List[TestPlanOut])
def get_test_plans(db: Session = Depends(get_db)):
    return db.query(TestPlan).order_by(TestPlan.id.desc()).all()

# 🔹 CREATE TEST PLAN
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_test_plan(data: TestPlanCreate, db: Session = Depends(get_db)):
    test_plan = TestPlan(**data.dict())
    db.add(test_plan)
    db.commit()
    db.refresh(test_plan)

    return {
        "success": True,
        "testPlan": test_plan
    }

# 🔹 GET TEST PLAN BY ID
@router.get("/{test_plan_id}", response_model=TestPlanOut)
def get_test_plan(test_plan_id: int, db: Session = Depends(get_db)):
    test_plan = db.query(TestPlan).filter(TestPlan.id == test_plan_id).first()
    if not test_plan:
        raise HTTPException(status_code=404, detail="Test plan not found")
    return test_plan

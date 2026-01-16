from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.Estimations.models import Estimation, EstimationTestItem
from backend.Estimations.schemas import EstimationCreate
from backend.RFQs.models import RFQ
from backend.customer.models import Customer
import uuid

router = APIRouter(prefix="/estimations", tags=["Estimations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 GET ALL ESTIMATIONS
@router.get("/")
def get_estimations(db: Session = Depends(get_db)):
    estimations = db.query(Estimation).all()

    response = []

    for e in estimations:
        rfq = db.query(RFQ).filter(RFQ.id == e.rfqId).first()
        customer = db.query(Customer).filter(Customer.id == rfq.customerId).first() if rfq else None

        response.append({
            "id": e.id,
            "rfqId": e.rfqId,
            "estimationId": e.estimationId,
            "version": e.version,
            "rfqCustomerName": customer.companyName if customer else "",
            "rfqProduct": rfq.product if rfq else "",
            "totalCost": e.totalCost,
            "totalHours": e.totalHours,
            "status": e.status,
        })

    return response


# 🔹 CREATE ESTIMATION
@router.post("/")
def create_estimation(data: EstimationCreate, db: Session = Depends(get_db)):
    # 🔸 calculate totals
    total_hours = sum(t.hours * t.numberOfDUT for t in data.tests)
    subtotal = sum(t.hours * t.ratePerHour * t.numberOfDUT for t in data.tests)

    with_margin = subtotal * (1 + data.margin / 100)
    total_cost = with_margin * (1 - data.discount / 100)

    estimation = Estimation(
        rfqId=data.rfqId,
        estimationId=f"EST-{uuid.uuid4().hex[:6].upper()}",
        version=1,
        totalCost=total_cost,
        totalHours=total_hours,
        margin=data.margin,
        discount=data.discount,
        notes=data.notes,
        status="draft",
    )

    db.add(estimation)
    db.commit()
    db.refresh(estimation)

    # 🔸 save test items
    for item in data.tests:
        db.add(
            EstimationTestItem(
                estimationId=estimation.id,
                testTypeId=item.testTypeId,
                numberOfDUT=item.numberOfDUT,
                hours=item.hours,
                ratePerHour=item.ratePerHour,
                remarks=item.remarks,
            )
        )

    db.commit()

    return {"success": True, "estimationId": estimation.id}

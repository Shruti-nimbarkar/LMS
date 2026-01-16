from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.RFQs.models import RFQ
from backend.customer.models import Customer
from backend.RFQs.schemas import RFQCreate

router = APIRouter(prefix="/rfqs", tags=["RFQs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 GET ALL RFQs
@router.get("/")
def get_rfqs(db: Session = Depends(get_db)):
    rfqs = (
        db.query(
            RFQ.id,
            RFQ.customerId,
            Customer.companyName.label("customerName"),
            RFQ.product,
            RFQ.receivedDate,
            RFQ.status,
        )
        .join(Customer, RFQ.customerId == Customer.id)
        .all()
    )

    return [
        {
            "id": r.id,
            "customerId": r.customerId,
            "customerName": r.customerName,
            "product": r.product,
            "receivedDate": r.receivedDate,
            "status": r.status,
        }
        for r in rfqs
    ]


# 🔹 CREATE RFQ
@router.post("/")
def create_rfq(data: RFQCreate, db: Session = Depends(get_db)):
    new_rfq = RFQ(
        customerId=data.customerId,
        product=data.product,
        receivedDate=data.receivedDate,
        status="pending",
    )

    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)

    customer = db.query(Customer).filter(Customer.id == data.customerId).first()

    return {
        "rfq": {
            "id": new_rfq.id,
            "customerId": new_rfq.customerId,
            "customerName": customer.companyName if customer else "",
            "product": new_rfq.product,
            "receivedDate": new_rfq.receivedDate,
            "status": new_rfq.status,
        }
    }

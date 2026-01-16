from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.customer.models import Customer
from backend.customer.schemas import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    print("🔥 POST /customers HIT")
    print("🔥 DATA RECEIVED:", customer)

    new_customer = Customer(
        companyName=customer.companyName,
        email=customer.email
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    print("🔥 SAVED CUSTOMER ID:", new_customer.id)

    return {"customer": new_customer}


@router.get("/", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

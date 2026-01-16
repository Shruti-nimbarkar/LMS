from sqlalchemy.orm import Session
from backend.customer.models import Customer

def create_customer(
    db: Session,
    company_name: str,
    email: str,
    phone: str | None,
    contact_person: str | None,
    address: str | None,
):
    customer = Customer(
        company_name=company_name,
        email=email,
        phone=phone,
        contact_person=contact_person,
        address=address,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

def get_customers(db: Session):
    return db.query(Customer).all()


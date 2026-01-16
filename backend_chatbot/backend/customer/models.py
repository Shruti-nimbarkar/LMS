from sqlalchemy import Column, Integer, String
from backend.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    companyName = Column(String, nullable=False)
    email = Column(String, nullable=True)

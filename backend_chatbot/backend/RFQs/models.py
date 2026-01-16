from sqlalchemy import Column, Integer, String, Date, ForeignKey
from backend.database import Base

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    customerId = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product = Column(String, nullable=False)
    receivedDate = Column(String, nullable=False)
    status = Column(String, default="pending")

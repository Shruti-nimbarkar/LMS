from sqlalchemy import Column, Integer, String, Date
from backend.database import Base

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    certificateNumber = Column(String, unique=True, index=True)
    standard = Column(String)
    status = Column(String, default="Pending")
    issueDate = Column(Date, nullable=True)
    expiryDate = Column(Date, nullable=True)

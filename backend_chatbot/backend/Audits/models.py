from sqlalchemy import Column, Integer, String, Date
from backend.database import Base

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Scheduled")
    auditDate = Column(Date, nullable=True)
    auditorName = Column(String, nullable=True)

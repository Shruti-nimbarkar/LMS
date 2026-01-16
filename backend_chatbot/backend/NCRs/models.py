from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database import Base

class NCR(Base):
    __tablename__ = "ncrs"

    id = Column(Integer, primary_key=True, index=True)
    ncrNumber = Column(String, unique=True, index=True, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Open")
    raisedBy = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

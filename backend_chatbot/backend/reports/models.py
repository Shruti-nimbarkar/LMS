from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from backend.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
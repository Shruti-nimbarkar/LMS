from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class TestPlan(Base):
    __tablename__ = "test_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    testType = Column(String, nullable=False)
    status = Column(String, default="Draft")
    description = Column(String, nullable=True)

    projectId = Column(Integer, ForeignKey("projects.id"), nullable=True)
    projectName = Column(String, nullable=True)

    assignedEngineerName = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

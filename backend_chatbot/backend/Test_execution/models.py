from sqlalchemy import Column, Integer, String, Date, ForeignKey
from datetime import date
from backend.database import Base

class TestExecution(Base):
    __tablename__ = "test_executions"

    id = Column(Integer, primary_key=True, index=True)

    testPlanId = Column(Integer, ForeignKey("test_plans.id"), nullable=False)

    status = Column(String, default="completed")
    executionDate = Column(Date, default=date.today)
    executedByName = Column(String, nullable=True)

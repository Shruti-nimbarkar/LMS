from sqlalchemy import Column, Integer, Boolean, String, Date, ForeignKey
from datetime import date
from backend.database import Base

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)

    testExecutionId = Column(
        Integer,
        ForeignKey("test_executions.id"),
        nullable=False
    )

    passFail = Column(Boolean, nullable=False)
    testType = Column(String, nullable=True)
    testDate = Column(Date, default=date.today)

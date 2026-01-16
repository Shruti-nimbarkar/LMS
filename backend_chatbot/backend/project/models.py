from sqlalchemy import Column, Integer, String, ForeignKey
from backend.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)

    clientId = Column(Integer, ForeignKey("customers.id"), nullable=False)
    estimationId = Column(Integer, ForeignKey("estimations.id"), nullable=True)

    status = Column(String, default="active")

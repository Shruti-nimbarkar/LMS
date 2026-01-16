from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.project.models import Project
from backend.project.schemas import ProjectCreate
from backend.customer.models import Customer
from backend.Estimations.models import Estimation
import uuid

router = APIRouter(prefix="/projects", tags=["Projects"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 GET ALL PROJECTS
@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    response = []

    for p in projects:
        customer = db.query(Customer).filter(Customer.id == p.clientId).first()

        response.append({
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "clientId": p.clientId,
            "clientName": customer.companyName if customer else "",
            "status": p.status,
        })

    return response


# 🔹 CREATE PROJECT
@router.post("/")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    code = f"PROJ-{uuid.uuid4().hex[:6].upper()}"

    project = Project(
        name=data.name,
        clientId=data.clientId,
        estimationId=data.estimationId,
        code=code,
        status="active",
    )

    db.add(project)

    # 🔗 If created from estimation → mark estimation as accepted
    if data.estimationId:
        estimation = db.query(Estimation).filter(Estimation.id == data.estimationId).first()
        if estimation:
            estimation.status = "accepted"

    db.commit()
    db.refresh(project)

    customer = db.query(Customer).filter(Customer.id == data.clientId).first()

    return {
        "project": {
            "id": project.id,
            "code": project.code,
            "name": project.name,
            "clientId": project.clientId,
            "clientName": customer.companyName if customer else "",
            "status": project.status,
        }
    }

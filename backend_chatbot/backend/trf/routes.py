from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.trf.models import TRF
from backend.trf.schemas import TRFCreate, TRFResponse

router = APIRouter(
    prefix="/trfs",     # 🔥 MUST be /trfs
    tags=["TRFs"]
)

@router.post("/", response_model=TRFResponse)
def create_trf(trf: TRFCreate, db: Session = Depends(get_db)):
    new_trf = TRF(**trf.model_dump())
    db.add(new_trf)
    db.commit()
    db.refresh(new_trf)
    return new_trf

@router.get("/", response_model=list[TRFResponse])
def get_trfs(db: Session = Depends(get_db)):
    return db.query(TRF).all()
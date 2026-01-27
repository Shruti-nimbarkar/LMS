from sqlalchemy.orm import Session
from trf.models import TRF
from backend.trf.schemas import TRFCreate

def create_trf(db: Session, trf: TRFCreate):
    db_trf = TRF(**trf.dict())
    db.add(db_trf)
    db.commit()
    db.refresh(db_trf)
    return db_trf

def get_trfs(db: Session):
    return db.query(TRF).all()
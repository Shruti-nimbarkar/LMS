from sqlalchemy.orm import Session
from backend.samples.models import Sample
from backend.samples.schema import SampleCreate

def create_sample(db: Session, sample: SampleCreate):
    db_sample = Sample(**sample.dict())
    db.add(db_sample)
    db.commit()
    db.refresh(db_sample)
    return db_sample

def get_samples(db: Session, project_id: int | None = None):
    query = db.query(Sample)
    if project_id:
        query = query.filter(Sample.projectId == project_id)
    return query.all()

def get_sample_by_id(db: Session, sample_id: int):
    return db.query(Sample).filter(Sample.id == sample_id).first()
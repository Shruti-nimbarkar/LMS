from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str
    clientId: int
    estimationId: int | None = None

class ProjectOut(BaseModel):
    id: int
    code: str
    name: str
    clientId: int
    clientName: str
    status: str

    class Config:
        from_attributes = True

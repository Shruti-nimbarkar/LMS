from pydantic import BaseModel

class CustomerCreate(BaseModel):
    companyName: str
    email: str | None = None

class CustomerResponse(CustomerCreate):
    id: int

    class Config:
        orm_mode = True

# Step-by-Step Implementation Guide

This guide provides a quick reference for implementing the data persistence layer.

## 🚀 Quick Start (30 minutes)

### Step 1: Set Up NeonDB (5 minutes)
1. Go to https://neon.tech
2. Sign up / Log in
3. Create a new project
4. Copy the connection string
5. Save it for later

### Step 2: Create Backend Structure (10 minutes)
```bash
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Create directory structure
mkdir -p app/{models,schemas,api/routes,services,utils}
touch app/__init__.py app/main.py app/config.py app/database.py
touch requirements.txt .env
```

### Step 3: Install Dependencies (5 minutes)
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic pydantic-settings python-dotenv
```

### Step 4: Configure Environment (5 minutes)
1. Copy `.env.example` to `.env`
2. Paste your NeonDB connection string
3. Set other environment variables

### Step 5: Create Basic Backend Files (5 minutes)
Copy the code from `plan.md` for:
- `app/config.py`
- `app/database.py`
- `app/main.py` (basic FastAPI app)

---

## 📋 Detailed Implementation Order

### Phase 1: Foundation (Day 1)

#### 1.1 Backend Setup
- [ ] Create project structure
- [ ] Install dependencies
- [ ] Set up configuration
- [ ] Create database connection
- [ ] Test connection to NeonDB

#### 1.2 Basic Models
- [ ] Create User model
- [ ] Create base model with timestamps
- [ ] Test model creation

#### 1.3 Basic API
- [ ] Create FastAPI app
- [ ] Add CORS middleware
- [ ] Create health check endpoint
- [ ] Test API is running

---

### Phase 2: Core Modules (Days 2-3)

#### 2.1 Inventory Management
- [ ] Create Instrument model
- [ ] Create Calibration model
- [ ] Create Consumable model
- [ ] Create InventoryTransaction model
- [ ] Create Pydantic schemas
- [ ] Create service layer
- [ ] Create API endpoints
- [ ] Test CRUD operations

#### 2.2 Frontend Integration
- [ ] Update `instrumentsService` in `labManagementApi.js`
- [ ] Update `CreateInstrumentForm.jsx`
- [ ] Update `InventoryInstruments.jsx`
- [ ] Test form submission
- [ ] Test data retrieval

---

### Phase 3: QA Module (Days 4-5)

#### 3.1 QA Models
- [ ] Create SOP model
- [ ] Create QC Check model
- [ ] Create Audit model
- [ ] Create NC/CAPA model
- [ ] Create Document model

#### 3.2 QA APIs
- [ ] Create all QA endpoints
- [ ] Test all operations

#### 3.3 Frontend Integration
- [ ] Update all QA services
- [ ] Update all QA forms
- [ ] Test all QA pages

---

### Phase 4: Remaining Modules (Days 6-7)

#### 4.1 Projects & Tests
- [ ] Create Project models
- [ ] Create Test Plan models
- [ ] Create Test Execution models
- [ ] Create APIs
- [ ] Update frontend

#### 4.2 Customers & RFQs
- [ ] Create Customer models
- [ ] Create RFQ models
- [ ] Create APIs
- [ ] Update frontend

---

## 🔧 Common Tasks

### Creating a New Model

1. **Create Model** (`app/models/example.py`):
```python
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime

class Example(Base):
    __tablename__ = "examples"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

2. **Create Schema** (`app/schemas/example.py`):
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExampleCreate(BaseModel):
    name: str

class ExampleUpdate(BaseModel):
    id: int  # Required for update
    name: Optional[str] = None

class ExampleDelete(BaseModel):
    id: int  # Required for delete

class ExampleResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

3. **Create Service** (`app/services/example_service.py`):
```python
from sqlalchemy.orm import Session
from app.models.example import Example
from app.schemas.example import ExampleCreate, ExampleUpdate

class ExampleService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100):
        return self.db.query(Example).offset(skip).limit(limit).all()
    
    def get_by_id(self, example_id: int):
        return self.db.query(Example).filter(Example.id == example_id).first()
    
    def create(self, data: ExampleCreate):
        db_item = Example(**data.dict())
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item
    
    def update(self, example_id: int, data: ExampleUpdate):
        db_item = self.get_by_id(example_id)
        if not db_item:
            return None
        # Update only provided fields
        update_data = data.dict(exclude_unset=True, exclude={'id'})
        for key, value in update_data.items():
            setattr(db_item, key, value)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item
    
    def delete(self, example_id: int):
        db_item = self.get_by_id(example_id)
        if db_item:
            self.db.delete(db_item)
            self.db.commit()
```

4. **Create Route** (`app/api/routes/examples.py`):
```python
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.example import ExampleCreate, ExampleUpdate, ExampleDelete, ExampleResponse
from app.services.example_service import ExampleService

router = APIRouter(prefix="/examples", tags=["examples"])

# GET: Retrieve all examples
@router.get("/", response_model=list[ExampleResponse])
def get_examples(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = ExampleService(db)
    return service.get_all(skip=skip, limit=limit)

# GET: Retrieve example by ID
@router.get("/{example_id}", response_model=ExampleResponse)
def get_example(example_id: int, db: Session = Depends(get_db)):
    service = ExampleService(db)
    example = service.get_by_id(example_id)
    if not example:
        raise HTTPException(status_code=404, detail="Example not found")
    return example

# POST: Create new example
@router.post("/", response_model=ExampleResponse)
def create_example(data: ExampleCreate, db: Session = Depends(get_db)):
    service = ExampleService(db)
    return service.create(data)

# POST: Update example
@router.post("/update", response_model=ExampleResponse)
def update_example(data: ExampleUpdate = Body(...), db: Session = Depends(get_db)):
    if not data.id:
        raise HTTPException(status_code=400, detail="ID is required")
    service = ExampleService(db)
    return service.update(data.id, data)

# POST: Delete example
@router.post("/delete")
def delete_example(data: ExampleDelete = Body(...), db: Session = Depends(get_db)):
    if not data.id:
        raise HTTPException(status_code=400, detail="ID is required")
    service = ExampleService(db)
    service.delete(data.id)
    return {"message": "Example deleted successfully", "id": data.id}
```

5. **Add to Main App** (`app/main.py`):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import examples

app = FastAPI(title="LMS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only GET and POST
    allow_headers=["*"],
)

app.include_router(examples.router, prefix="/api/v1")
```

6. **Create Migration**:
```bash
alembic revision --autogenerate -m "Add examples table"
alembic upgrade head
```

---

## 🧪 Testing Checklist

For each module, test:

- [ ] **Create**: POST to `/` endpoint creates new record
- [ ] **Read**: GET request retrieves records (list and by ID)
- [ ] **Update**: POST to `/update` endpoint updates record
- [ ] **Delete**: POST to `/delete` endpoint removes record
- [ ] **Validation**: Invalid data returns errors
- [ ] **Relationships**: Foreign keys work correctly
- [ ] **Frontend**: Form submission works
- [ ] **Frontend**: Data displays correctly
- [ ] **Frontend**: Updates reflect immediately

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution**: 
- Check connection string format
- Verify SSL mode is set to `require`
- Check firewall settings

### Issue: Migration Errors
**Solution**:
- Drop and recreate database (development only)
- Check model definitions match schema
- Verify foreign key relationships

### Issue: CORS Errors
**Solution**:
- Add frontend URL to CORS origins
- Check API URL in frontend `.env`
- Verify backend is running

### Issue: Data Not Persisting
**Solution**:
- Check database connection
- Verify API endpoints are called
- Check browser console for errors
- Verify form data is being sent correctly

---

## 📝 Notes

- **Development**: Use `--reload` flag for auto-reload
- **Testing**: Use Postman or similar to test APIs
- **Database**: Use NeonDB dashboard to view data
- **Logs**: Check FastAPI logs for errors
- **Frontend**: Check browser console for errors

---

## ✅ Final Checklist

Before demo:

- [ ] All forms save to database
- [ ] All lists load from database
- [ ] Data persists after refresh
- [ ] Relationships work correctly
- [ ] No console errors
- [ ] API endpoints tested
- [ ] Error handling works
- [ ] Loading states work
- [ ] Success messages appear

---

**Need Help?** Refer to `plan.md` for detailed explanations.

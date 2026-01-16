# End-to-End Data Persistence Plan for LMS Demo
## NeonDB Integration & Data Flow Architecture

---

## 📋 Overview

This plan outlines the implementation of a complete data persistence layer using NeonDB (PostgreSQL) to store all form entries and enable data flow across the Lab Management System (LMS).

---

## 🎯 Objectives

1. **Store all form entries** in NeonDB (PostgreSQL)
2. **Enable data flow** across all LMS modules
3. **Maintain data consistency** and relationships
4. **Support real-time updates** across the application
5. **Provide audit trails** for compliance

---

## 🏗️ Architecture Overview

```
Frontend (React) 
    ↓ HTTP (GET/POST only)
Backend API (FastAPI)
    ↓ SQLAlchemy ORM
NeonDB (PostgreSQL)
```

**API Design Approach:**
- **GET**: Retrieve data (list all, get by ID)
- **POST**: All mutations (create, update, delete) using action parameters

---

## 📊 Database Schema Design

### Core Tables

#### 1. **Users & Authentication**
```sql
- users (id, email, name, role, created_at, updated_at)
- sessions (id, user_id, token, expires_at)
```

#### 2. **Projects & Test Management**
```sql
- projects (id, project_id, title, customer_id, status, created_at, updated_at)
- test_plans (id, project_id, plan_id, title, status, created_at, updated_at)
- test_executions (id, test_plan_id, execution_id, status, result, created_at, updated_at)
- samples (id, project_id, sample_id, description, status, created_at, updated_at)
```

#### 3. **Inventory Management**
```sql
- instruments (id, instrument_id, name, manufacturer, model, serial_number, 
               lab_location, department, status, purchase_date, warranty_expiry, 
               service_vendor, created_at, updated_at)
- calibrations (id, instrument_id, calibration_id, last_calibration_date, 
                next_due_date, frequency, method, certified_by, certificate_number, 
                status, created_at, updated_at)
- consumables (id, item_id, category, name, batch_number, quantity, unit, 
                expiry_date, storage_conditions, supplier, low_stock_threshold, 
                created_at, updated_at)
- inventory_transactions (id, transaction_id, item_id, item_type, transaction_type, 
                          quantity, used_by, purpose, date, linked_test_id, notes, 
                          created_at, updated_at)
```

#### 4. **Quality Assurance**
```sql
- sops (id, sop_id, title, category, version, effective_date, approved_by, 
       status, document_url, next_review_date, created_at, updated_at)
- sop_revisions (id, sop_id, version, date, changed_by, changes, created_at)
- sop_links (id, sop_id, link_type, linked_id, created_at)
- qc_checks (id, qc_id, test_name, parameter, target_value, acceptance_min, 
            acceptance_max, unit, frequency, last_check_date, last_result, 
            status, created_at, updated_at)
- qc_results (id, qc_check_id, value, date, status, deviation, created_at)
- audits (id, audit_id, audit_type, date, auditor_name, auditor_organization, 
         scope, status, compliance_score, report_url, next_audit_date, created_at, updated_at)
- audit_findings (id, audit_id, description, severity, status, created_at, updated_at)
- nc_capas (id, nc_id, description, impacted_area, severity, root_cause, 
           action_owner, due_date, status, corrective_action, preventive_action, 
           closure_date, linked_audit_id, linked_test_id, created_at, updated_at)
- documents (id, document_id, title, category, version, document_type, 
            effective_date, approved_by, status, access_level, locked, 
            document_url, download_count, last_accessed, created_at, updated_at)
- document_revisions (id, document_id, version, date, changed_by, created_at)
```

#### 5. **Customers & RFQs**
```sql
- customers (id, customer_id, name, email, phone, address, created_at, updated_at)
- rfqs (id, rfq_id, customer_id, title, description, status, created_at, updated_at)
- estimations (id, rfq_id, item, quantity, unit_price, total, created_at, updated_at)
```

#### 6. **Organization & Scope**
```sql
- organization_details (id, field_name, field_value, created_at, updated_at)
- scope_management (id, scope_type, scope_data, created_at, updated_at)
```

---

## 🔧 Backend Implementation Plan

### Phase 1: Backend Setup (Days 1-2)

#### 1.1 Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration & environment variables
│   ├── database.py          # Database connection & session management
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── inventory.py
│   │   ├── qa.py
│   │   └── ...
│   ├── schemas/             # Pydantic schemas for request/response
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── ...
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── projects.py
│   │   │   ├── inventory.py
│   │   │   ├── qa.py
│   │   │   └── ...
│   │   └── dependencies.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── inventory_service.py
│   │   └── ...
│   └── utils/               # Utilities
│       ├── __init__.py
│       └── helpers.py
├── requirements.txt
├── .env
└── alembic/                 # Database migrations
    ├── versions/
    └── env.py
```

#### 1.2 Dependencies (`requirements.txt`)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
python-multipart==0.0.6
```

#### 1.3 Configuration (`app/config.py`)
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # NeonDB Connection
    DATABASE_URL: str = "postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
```

#### 1.4 Database Connection (`app/database.py`)
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import Settings

settings = Settings()

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Phase 2: Database Models (Days 3-5)

#### 2.1 Create SQLAlchemy Models
- **User Model** (`app/models/user.py`)
- **Project Models** (`app/models/project.py`)
- **Inventory Models** (`app/models/inventory.py`)
- **QA Models** (`app/models/qa.py`)
- **Customer Models** (`app/models/customer.py`)

#### 2.2 Example Model Structure
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Instrument(Base):
    __tablename__ = "instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    model = Column(String)
    serial_number = Column(String)
    lab_location = Column(String)
    assigned_department = Column(String)
    status = Column(String)  # Active, Under Maintenance, Out of Service
    purchase_date = Column(DateTime)
    warranty_expiry = Column(DateTime)
    service_vendor = Column(String)
    service_vendor_contact = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calibrations = relationship("Calibration", back_populates="instrument")
```

### Phase 3: API Endpoints (Days 6-10)

#### 3.1 Create Pydantic Schemas
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InstrumentCreate(BaseModel):
    instrument_id: str
    name: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    lab_location: Optional[str] = None
    assigned_department: Optional[str] = None
    status: str = "Active"
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    service_vendor: Optional[str] = None
    notes: Optional[str] = None

class InstrumentUpdate(BaseModel):
    id: int  # Required for update
    instrument_id: Optional[str] = None
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    lab_location: Optional[str] = None
    assigned_department: Optional[str] = None
    status: Optional[str] = None
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    service_vendor: Optional[str] = None
    notes: Optional[str] = None

class InstrumentDelete(BaseModel):
    id: int  # Required for delete

class InstrumentResponse(BaseModel):
    id: int
    instrument_id: str
    name: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    lab_location: Optional[str] = None
    assigned_department: Optional[str] = None
    status: str
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    service_vendor: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

#### 3.2 Create API Routes (GET/POST Only)

**API Endpoint Pattern:**
- `GET /api/v1/instruments/` - Get all instruments
- `GET /api/v1/instruments/{id}` - Get instrument by ID
- `POST /api/v1/instruments/` - Create new instrument
- `POST /api/v1/instruments/update` - Update existing instrument
- `POST /api/v1/instruments/delete` - Delete instrument

```python
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.inventory import InstrumentCreate, InstrumentResponse, InstrumentUpdate, InstrumentDelete
from app.services.inventory_service import InventoryService
from typing import Optional

router = APIRouter(prefix="/instruments", tags=["instruments"])

# GET: Retrieve all instruments
@router.get("/", response_model=list[InstrumentResponse])
def get_instruments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    return service.get_instruments(skip=skip, limit=limit)

# GET: Retrieve instrument by ID
@router.get("/{instrument_id}", response_model=InstrumentResponse)
def get_instrument(
    instrument_id: int, 
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    instrument = service.get_instrument(instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return instrument

# POST: Create new instrument
@router.post("/", response_model=InstrumentResponse)
def create_instrument(
    instrument: InstrumentCreate,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    return service.create_instrument(instrument)

# POST: Update existing instrument
@router.post("/update", response_model=InstrumentResponse)
def update_instrument(
    data: InstrumentUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update instrument. Request body should include:
    {
        "id": 1,
        "instrument_id": "INST-001",
        "name": "Updated Name",
        ...
    }
    """
    service = InventoryService(db)
    if not data.id:
        raise HTTPException(status_code=400, detail="ID is required for update")
    return service.update_instrument(data.id, data)

# POST: Delete instrument
@router.post("/delete")
def delete_instrument(
    data: InstrumentDelete = Body(...),
    db: Session = Depends(get_db)
):
    """
    Delete instrument. Request body should include:
    {
        "id": 1
    }
    """
    service = InventoryService(db)
    if not data.id:
        raise HTTPException(status_code=400, detail="ID is required for delete")
    service.delete_instrument(data.id)
    return {"message": "Instrument deleted successfully", "id": data.id}
```

### Phase 4: Service Layer (Days 11-12)

#### 4.1 Business Logic Services
```python
from sqlalchemy.orm import Session
from app.models.inventory import Instrument
from app.schemas.inventory import InstrumentCreate

class InventoryService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_instrument(self, instrument_data: InstrumentCreate):
        db_instrument = Instrument(**instrument_data.dict())
        self.db.add(db_instrument)
        self.db.commit()
        self.db.refresh(db_instrument)
        return db_instrument
    
    def get_instruments(self, skip: int = 0, limit: int = 100):
        return self.db.query(Instrument).offset(skip).limit(limit).all()
    
    def get_instrument(self, instrument_id: int):
        return self.db.query(Instrument).filter(Instrument.id == instrument_id).first()
    
    def update_instrument(self, instrument_id: int, instrument_data: InstrumentCreate):
        db_instrument = self.get_instrument(instrument_id)
        if not db_instrument:
            return None
        
        for key, value in instrument_data.dict().items():
            setattr(db_instrument, key, value)
        
        self.db.commit()
        self.db.refresh(db_instrument)
        return db_instrument
    
    def delete_instrument(self, instrument_id: int):
        db_instrument = self.get_instrument(instrument_id)
        if db_instrument:
            self.db.delete(db_instrument)
            self.db.commit()
```

### Phase 5: Database Migrations (Day 13)

#### 5.1 Initialize Alembic
```bash
alembic init alembic
```

#### 5.2 Create Migration Scripts
```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create all tables
    op.create_table('instruments', ...)
    op.create_table('calibrations', ...)
    # ... other tables

def downgrade():
    # Drop all tables
    op.drop_table('instruments')
    # ... other tables
```

#### 5.3 Run Migrations
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

---

## 🎨 Frontend Integration Plan

### Phase 6: Update Frontend Services (Days 14-16)

#### 6.1 Update API Service (`src/services/labManagementApi.js`)

**Replace mock services with real API calls:**

```javascript
// Before (Mock)
export const instrumentsService = {
  getAll: async () => {
    await mockDelay()
    return [...mockData]
  }
}

// After (Real API - GET/POST Only)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const instrumentsService = {
  // GET: Retrieve all instruments
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/instruments/`)
    return response.data
  },
  
  // GET: Retrieve instrument by ID
  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/instruments/${id}`)
    return response.data
  },
  
  // POST: Create new instrument
  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/instruments/`, data)
    return response.data
  },
  
  // POST: Update existing instrument
  update: async (id, data) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/instruments/update`, {
      id: id,
      ...data
    })
    return response.data
  },
  
  // POST: Delete instrument
  delete: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/instruments/delete`, {
      id: id
    })
    return response.data
  }
}
```

#### 6.2 Update Form Components

**Modify form submission handlers to use GET/POST:**

```javascript
// In CreateInstrumentForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    setLoading(true)
    const submitData = {
      instrument_id: formData.instrumentId,
      name: formData.name,
      manufacturer: formData.manufacturer,
      model: formData.model,
      serial_number: formData.serialNumber,
      lab_location: formData.labLocation,
      assigned_department: formData.assignedDepartment,
      status: formData.status,
      purchase_date: formData.purchaseDate || null,
      warranty_expiry: formData.warrantyExpiry || null,
      service_vendor: formData.serviceVendor || null,
      notes: formData.notes || null
    }
    
    if (instrument) {
      // POST to /update endpoint
      await instrumentsService.update(instrument.id, submitData)
      toast.success('Instrument updated successfully!')
    } else {
      // POST to / endpoint
      await instrumentsService.create(submitData)
      toast.success('Instrument created successfully!')
    }
    onSuccess()
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Failed to save instrument')
  } finally {
    setLoading(false)
  }
}
```

#### 6.3 Add Error Handling

```javascript
// Create axios interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🔄 Data Flow Architecture

### 7.1 Real-time Updates Strategy

#### Option A: Polling (Simple)
```javascript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadData()
  }, 30000)
  return () => clearInterval(interval)
}, [])
```

#### Option B: WebSockets (Advanced)
```python
# Backend: FastAPI WebSocket
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Broadcast updates to connected clients
```

### 7.2 State Management

**Use React Context for global state:**
```javascript
// src/contexts/DataContext.jsx
export const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [instruments, setInstruments] = useState([])
  const [projects, setProjects] = useState([])
  // ... other state
  
  const refreshInstruments = async () => {
    const data = await instrumentsService.getAll()
    setInstruments(data)
  }
  
  return (
    <DataContext.Provider value={{
      instruments,
      projects,
      refreshInstruments,
      // ... other values
    }}>
      {children}
    </DataContext.Provider>
  )
}
```

---

## 📝 Implementation Checklist

### Backend Setup
- [ ] Create FastAPI project structure
- [ ] Set up NeonDB connection
- [ ] Configure environment variables
- [ ] Install dependencies
- [ ] Create database models (all tables)
- [ ] Set up Alembic migrations
- [ ] Create Pydantic schemas (Create, Update, Delete, Response)
- [ ] Implement service layer
- [ ] Create API endpoints using GET/POST only:
  - [ ] GET endpoints for retrieving data
  - [ ] POST endpoints for create/update/delete
- [ ] Add authentication middleware
- [ ] Add error handling
- [ ] Add CORS configuration
- [ ] Test all GET endpoints
- [ ] Test all POST endpoints (create, update, delete)

### Frontend Integration
- [ ] Update `labManagementApi.js` with GET/POST API calls
- [ ] Replace PUT/DELETE with POST endpoints
- [ ] Update all form components to use POST for create/update
- [ ] Update delete handlers to use POST
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update list pages to fetch from API (GET)
- [ ] Add data refresh mechanisms
- [ ] Test all operations (GET for read, POST for write)
- [ ] Add optimistic updates

### Database
- [ ] Create NeonDB database
- [ ] Get connection string
- [ ] Run initial migrations
- [ ] Seed initial data (optional)
- [ ] Set up database backups

### Testing
- [ ] Test all API endpoints
- [ ] Test form submissions
- [ ] Test data retrieval
- [ ] Test data updates
- [ ] Test data deletion
- [ ] Test error scenarios
- [ ] Test data relationships

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your NeonDB connection string

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Install dependencies (if needed)
npm install

# Set environment variable
# Create .env file with:
VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

### 3. NeonDB Setup
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to backend `.env` file

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Authentication**: Implement JWT tokens
3. **Input Validation**: Use Pydantic schemas
4. **SQL Injection**: Use SQLAlchemy ORM (parameterized queries)
5. **CORS**: Configure allowed origins
6. **Rate Limiting**: Add rate limiting middleware
7. **Data Encryption**: Use HTTPS in production

---

## 📊 Monitoring & Logging

1. **API Logging**: Use FastAPI logging
2. **Database Logging**: Enable query logging in development
3. **Error Tracking**: Integrate Sentry or similar
4. **Performance Monitoring**: Track API response times

---

## 🎯 Priority Order for Implementation

1. **Week 1**: Backend setup + Core models (Users, Projects, Instruments)
2. **Week 2**: Inventory Management APIs (GET/POST) + Frontend integration
3. **Week 3**: QA Module APIs (GET/POST) + Frontend integration
4. **Week 4**: Remaining modules + Testing + Polish

## 📌 API Design Summary

### Endpoint Pattern for All Resources

**Example: Instruments Module**

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| GET | `/api/v1/instruments/` | Get all instruments | None (query params: skip, limit) |
| GET | `/api/v1/instruments/{id}` | Get instrument by ID | None |
| POST | `/api/v1/instruments/` | Create new instrument | `InstrumentCreate` schema |
| POST | `/api/v1/instruments/update` | Update instrument | `InstrumentUpdate` schema (includes id) |
| POST | `/api/v1/instruments/delete` | Delete instrument | `{"id": 1}` |

**This pattern applies to all modules:**
- Projects: `/api/v1/projects/`, `/api/v1/projects/update`, `/api/v1/projects/delete`
- Calibrations: `/api/v1/calibrations/`, `/api/v1/calibrations/update`, `/api/v1/calibrations/delete`
- SOPs: `/api/v1/sops/`, `/api/v1/sops/update`, `/api/v1/sops/delete`
- And so on for all resources...

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [NeonDB Documentation](https://neon.tech/docs)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

## ✅ Success Criteria

- [ ] All form submissions save to NeonDB
- [ ] Data persists across page refreshes
- [ ] Data flows correctly between modules
- [ ] CRUD operations work for all entities
- [ ] Relationships between entities are maintained
- [ ] Application is ready for demo

---

**Last Updated**: 2024-01-XX
**Version**: 1.0

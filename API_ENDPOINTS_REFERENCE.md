# API Endpoints Reference - GET/POST Only

This document provides a quick reference for all API endpoints using only GET and POST methods.

## 📌 Endpoint Pattern

All resources follow this pattern:
- **GET** `/api/v1/{resource}/` - List all items
- **GET** `/api/v1/{resource}/{id}` - Get item by ID
- **POST** `/api/v1/{resource}/` - Create new item
- **POST** `/api/v1/{resource}/update` - Update existing item
- **POST** `/api/v1/{resource}/delete` - Delete item

---

## 🔧 Inventory Management

### Instruments
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/instruments/` | Get all instruments | None (query: `?skip=0&limit=100`) |
| GET | `/api/v1/instruments/{id}` | Get instrument by ID | None |
| POST | `/api/v1/instruments/` | Create instrument | `InstrumentCreate` |
| POST | `/api/v1/instruments/update` | Update instrument | `InstrumentUpdate` (includes `id`) |
| POST | `/api/v1/instruments/delete` | Delete instrument | `{"id": 1}` |

### Calibrations
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/calibrations/` | Get all calibrations | None |
| GET | `/api/v1/calibrations/{id}` | Get calibration by ID | None |
| POST | `/api/v1/calibrations/` | Create calibration | `CalibrationCreate` |
| POST | `/api/v1/calibrations/update` | Update calibration | `CalibrationUpdate` (includes `id`) |
| POST | `/api/v1/calibrations/delete` | Delete calibration | `{"id": 1}` |

### Consumables
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/consumables/` | Get all consumables | None |
| GET | `/api/v1/consumables/{id}` | Get consumable by ID | None |
| POST | `/api/v1/consumables/` | Create consumable | `ConsumableCreate` |
| POST | `/api/v1/consumables/update` | Update consumable | `ConsumableUpdate` (includes `id`) |
| POST | `/api/v1/consumables/delete` | Delete consumable | `{"id": 1}` |

### Inventory Transactions
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/inventory-transactions/` | Get all transactions | None (query: `?item_id=1`) |
| GET | `/api/v1/inventory-transactions/{id}` | Get transaction by ID | None |
| POST | `/api/v1/inventory-transactions/` | Create transaction | `TransactionCreate` |
| POST | `/api/v1/inventory-transactions/update` | Update transaction | `TransactionUpdate` (includes `id`) |
| POST | `/api/v1/inventory-transactions/delete` | Delete transaction | `{"id": 1}` |

---

## ✅ Quality Assurance

### SOPs
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/sops/` | Get all SOPs | None |
| GET | `/api/v1/sops/{id}` | Get SOP by ID | None |
| POST | `/api/v1/sops/` | Create SOP | `SOPCreate` |
| POST | `/api/v1/sops/update` | Update SOP | `SOPUpdate` (includes `id`) |
| POST | `/api/v1/sops/delete` | Delete SOP | `{"id": 1}` |

### QC Checks
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/qc-checks/` | Get all QC checks | None |
| GET | `/api/v1/qc-checks/{id}` | Get QC check by ID | None |
| POST | `/api/v1/qc-checks/` | Create QC check | `QCCheckCreate` |
| POST | `/api/v1/qc-checks/update` | Update QC check | `QCCheckUpdate` (includes `id`) |
| POST | `/api/v1/qc-checks/delete` | Delete QC check | `{"id": 1}` |
| POST | `/api/v1/qc-checks/record-result` | Record QC result | `QCResultCreate` (includes `qc_check_id`) |

### Audits
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/audits/` | Get all audits | None |
| GET | `/api/v1/audits/{id}` | Get audit by ID | None |
| POST | `/api/v1/audits/` | Create audit | `AuditCreate` |
| POST | `/api/v1/audits/update` | Update audit | `AuditUpdate` (includes `id`) |
| POST | `/api/v1/audits/delete` | Delete audit | `{"id": 1}` |

### NC/CAPA
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/nc-capa/` | Get all NC/CAPA | None |
| GET | `/api/v1/nc-capa/{id}` | Get NC/CAPA by ID | None |
| POST | `/api/v1/nc-capa/` | Create NC/CAPA | `NCCAPACreate` |
| POST | `/api/v1/nc-capa/update` | Update NC/CAPA | `NCCAPAUpdate` (includes `id`) |
| POST | `/api/v1/nc-capa/delete` | Delete NC/CAPA | `{"id": 1}` |
| POST | `/api/v1/nc-capa/close` | Close NC/CAPA | `{"id": 1, "closure_date": "2024-01-20"}` |

### Documents
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/documents/` | Get all documents | None |
| GET | `/api/v1/documents/{id}` | Get document by ID | None |
| POST | `/api/v1/documents/` | Create document | `DocumentCreate` |
| POST | `/api/v1/documents/update` | Update document | `DocumentUpdate` (includes `id`) |
| POST | `/api/v1/documents/delete` | Delete document | `{"id": 1}` |
| POST | `/api/v1/documents/lock` | Lock document | `{"id": 1}` |
| POST | `/api/v1/documents/unlock` | Unlock document | `{"id": 1}` |

---

## 📊 Projects & Tests

### Projects
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/projects/` | Get all projects | None |
| GET | `/api/v1/projects/{id}` | Get project by ID | None |
| POST | `/api/v1/projects/` | Create project | `ProjectCreate` |
| POST | `/api/v1/projects/update` | Update project | `ProjectUpdate` (includes `id`) |
| POST | `/api/v1/projects/delete` | Delete project | `{"id": 1}` |

### Test Plans
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/test-plans/` | Get all test plans | None (query: `?project_id=1`) |
| GET | `/api/v1/test-plans/{id}` | Get test plan by ID | None |
| POST | `/api/v1/test-plans/` | Create test plan | `TestPlanCreate` |
| POST | `/api/v1/test-plans/update` | Update test plan | `TestPlanUpdate` (includes `id`) |
| POST | `/api/v1/test-plans/delete` | Delete test plan | `{"id": 1}` |

### Test Executions
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/test-executions/` | Get all executions | None (query: `?test_plan_id=1`) |
| GET | `/api/v1/test-executions/{id}` | Get execution by ID | None |
| POST | `/api/v1/test-executions/` | Create execution | `TestExecutionCreate` |
| POST | `/api/v1/test-executions/update` | Update execution | `TestExecutionUpdate` (includes `id`) |
| POST | `/api/v1/test-executions/delete` | Delete execution | `{"id": 1}` |

---

## 👥 Customers & RFQs

### Customers
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/customers/` | Get all customers | None |
| GET | `/api/v1/customers/{id}` | Get customer by ID | None |
| POST | `/api/v1/customers/` | Create customer | `CustomerCreate` |
| POST | `/api/v1/customers/update` | Update customer | `CustomerUpdate` (includes `id`) |
| POST | `/api/v1/customers/delete` | Delete customer | `{"id": 1}` |

### RFQs
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/v1/rfqs/` | Get all RFQs | None |
| GET | `/api/v1/rfqs/{id}` | Get RFQ by ID | None |
| POST | `/api/v1/rfqs/` | Create RFQ | `RFQCreate` |
| POST | `/api/v1/rfqs/update` | Update RFQ | `RFQUpdate` (includes `id`) |
| POST | `/api/v1/rfqs/delete` | Delete RFQ | `{"id": 1}` |

---

## 📝 Frontend Usage Examples

### JavaScript/React Examples

```javascript
// GET: Retrieve all instruments
const instruments = await axios.get(`${API_URL}/api/v1/instruments/`)

// GET: Retrieve instrument by ID
const instrument = await axios.get(`${API_URL}/api/v1/instruments/1`)

// POST: Create new instrument
const newInstrument = await axios.post(`${API_URL}/api/v1/instruments/`, {
  instrument_id: "INST-001",
  name: "Spectrum Analyzer",
  manufacturer: "Keysight",
  // ... other fields
})

// POST: Update instrument
const updated = await axios.post(`${API_URL}/api/v1/instruments/update`, {
  id: 1,
  name: "Updated Name",
  status: "Under Maintenance",
  // ... other fields to update
})

// POST: Delete instrument
const deleted = await axios.post(`${API_URL}/api/v1/instruments/delete`, {
  id: 1
})
```

---

## 🔐 Request/Response Format

### Success Response
```json
{
  "id": 1,
  "instrument_id": "INST-001",
  "name": "Spectrum Analyzer",
  "status": "Active",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

### Error Response
```json
{
  "detail": "Instrument not found"
}
```

### List Response
```json
[
  {
    "id": 1,
    "instrument_id": "INST-001",
    "name": "Spectrum Analyzer",
    ...
  },
  {
    "id": 2,
    "instrument_id": "INST-002",
    "name": "EMI Receiver",
    ...
  }
]
```

---

## 📌 Notes

1. **All mutations use POST**: Create, Update, and Delete operations all use POST method
2. **ID in request body**: Update and Delete operations require `id` in the request body
3. **Query parameters**: GET endpoints support query parameters for filtering (e.g., `?skip=0&limit=100`)
4. **CORS**: Backend must allow GET and POST methods from frontend origin
5. **Content-Type**: All POST requests should use `application/json` content type

---

**Last Updated**: 2024-01-XX

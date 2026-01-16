# Lab Recommendation Engine API Documentation

## Base URL

```
http://localhost:5000/api
```

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check API and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "active_labs": 815
}
```

---

### 2. Search Labs

**GET** `/api/labs/search`

Search for labs by test name, standard, or domain.

**Query Parameters:**
- `test_name` (optional): Test name to search for
- `standard` (optional): Standard code to search for
- `domain` (optional): Domain name (Electrical, Safety, EMC, etc.)
- `limit` (optional): Maximum results (default: 50)

**Example:**
```
GET /api/labs/search?test_name=voltage&domain=Electrical&limit=20
```

**Response:**
```json
{
  "count": 15,
  "results": [
    {
      "lab_id": 85,
      "lab_name": "BLUE STAR R&D RELIABILITY LAB",
      "test_name": "Voltage Test",
      "standard_code": "IEC 60068",
      "full_code": "IEC 60068-2-1",
      "standard_body": "IEC",
      "domain_name": "Electrical"
    }
  ]
}
```

---

### 3. Get Lab Recommendations

**POST** `/api/labs/recommend`

Get ranked lab recommendations based on multiple criteria.

**Request Body:**
```json
{
  "test_name": "Voltage Test",
  "standard": "IEC 60068",
  "domain": "Electrical",
  "limit": 20
}
```

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "lab_id": 85,
      "lab_name": "BLUE STAR R&D RELIABILITY LAB",
      "matching_tests": 5,
      "matching_standards": 3,
      "matching_domains": 2,
      "total_matches": 8,
      "sample_tests": ["Voltage Test", "Current Test", ...],
      "sample_standards": ["IEC 60068", "IS 302", ...],
      "relevance_score": 65
    }
  ]
}
```

**Scoring:**
- `relevance_score` = (matching_tests × 10) + (matching_standards × 5) + (matching_domains × 1)
- Higher score = better match

---

### 4. Get Lab Details

**GET** `/api/labs/<lab_id>`

Get detailed information about a specific lab.

**Example:**
```
GET /api/labs/85
```

**Response:**
```json
{
  "lab": {
    "lab_id": 85,
    "lab_name": "BLUE STAR R&D RELIABILITY LAB",
    "created_at": "2025-12-23T12:10:42.798641+05:30",
    "updated_at": "2025-12-23T12:10:42.798641+05:30"
  },
  "capabilities": [
    {
      "test_name": "Voltage Test",
      "standard_code": "IEC 60068",
      "full_code": "IEC 60068-2-1",
      "standard_body": "IEC",
      "domain_name": "Electrical"
    }
  ],
  "domain_summary": [
    {
      "domain_name": "Electrical",
      "capability_count": 8
    }
  ],
  "total_capabilities": 21
}
```

---

### 5. Get Domains

**GET** `/api/domains`

Get list of all available domains with statistics.

**Response:**
```json
{
  "count": 8,
  "domains": [
    {
      "domain_id": 1,
      "domain_name": "Electrical",
      "total_capabilities": 110346,
      "lab_count": 650
    }
  ]
}
```

---

### 6. Search Tests

**GET** `/api/tests/search`

Search for tests by name.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Maximum results (default: 20)

**Example:**
```
GET /api/tests/search?q=voltage&limit=10
```

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "test_id": 1234,
      "test_name": "Voltage Test",
      "lab_count": 150
    }
  ]
}
```

---

### 7. Search Standards

**GET** `/api/standards/search`

Search for standards by code.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Maximum results (default: 20)

**Example:**
```
GET /api/standards/search?q=IEC 60068&limit=10
```

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "standard_id": 5678,
      "standard_code": "IEC 60068",
      "full_code": "IEC 60068-2-1",
      "standard_body": "IEC",
      "lab_count": 200
    }
  ]
}
```

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "error": "At least one search parameter is required"
}
```

**404 Not Found:**
```json
{
  "error": "Lab not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database connection failed"
}
```

---

## Usage Examples

### Example 1: Find labs for a specific test

```bash
curl "http://localhost:5000/api/labs/search?test_name=voltage%20test&limit=10"
```

### Example 2: Find labs by standard

```bash
curl "http://localhost:5000/api/labs/search?standard=IEC%2060068"
```

### Example 3: Get recommendations

```bash
curl -X POST http://localhost:5000/api/labs/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "test_name": "emission",
    "standard": "CISPR",
    "domain": "EMC",
    "limit": 10
  }'
```

### Example 4: Get lab details

```bash
curl "http://localhost:5000/api/labs/85"
```

---

## Running the API

1. Install dependencies:
```bash
pip install -r api/requirements.txt
```

2. Start the server:
```bash
python api/recommendation_api.py
```

3. API will be available at: `http://localhost:5000`

---

## Notes

- All searches are case-insensitive
- All text searches use `LIKE` with wildcards (`%query%`)
- Results are ordered by relevance/score
- Only active labs (deleted_at IS NULL) are returned


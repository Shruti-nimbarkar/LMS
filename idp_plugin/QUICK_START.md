# IDP Plugin - Quick Start & Testing Guide

## Prerequisites

1. **Python 3.9+** installed
2. **PostgreSQL** installed and running (or use SQLite for testing)
3. **OpenAI API Key** (for LLM extraction)

## Step 1: Install Dependencies

```bash
# Navigate to project root
cd LMS

# Install Python dependencies
pip install -r idp_plugin/requirements.txt
```

**Note**: PaddleOCR installation may take a few minutes as it downloads models.

## Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
# Database (use SQLite for quick testing, or PostgreSQL for production)
IDP_DATABASE_URL=sqlite:///./idp_test.db
# Or for PostgreSQL:
# IDP_DATABASE_URL=postgresql://user:password@localhost/idp_db

# OpenAI API Key (REQUIRED for extraction)
OPENAI_API_KEY=sk-your-api-key-here

# Models (optional - defaults shown)
EXTRACTION_MODEL=gpt-4o  # or gpt-4-turbo, gpt-4, etc.
REASONING_MODEL=gpt-4o-mini  # or gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small

# Storage path
IDP_STORAGE_PATH=./idp_storage
```

## Step 3: Setup Database

**Important**: Run setup from the **project root** (LMS folder), not from inside idp_plugin folder.

### Option A: SQLite (Quick Testing)

```bash
# Make sure you're in the project root (LMS folder)
cd C:\Users\shrey\OneDrive\Desktop\Projects\Combined\LMS

# Run setup script
python idp_plugin/setup_database.py
```

### Option B: PostgreSQL (Production)

```bash
# Create database
createdb idp_db

# Make sure you're in the project root
cd C:\Users\shrey\OneDrive\Desktop\Projects\Combined\LMS

# Run setup script
python idp_plugin/setup_database.py
```

**Alternative**: If you're already in the idp_plugin folder, you can also run:
```bash
# From idp_plugin folder
python setup_database.py
```
(The script now handles both locations automatically)

The setup script will:
- Create all required tables
- Enable pgvector extension (PostgreSQL only)
- Create vector indexes

## Step 4: Start the Test Server

**Make sure you're in the project root (LMS folder):**

```bash
# From project root
cd C:\Users\shrey\OneDrive\Desktop\Projects\Combined\LMS

# Run the standalone test server
python idp_plugin/test_server.py
```

Or using uvicorn directly:

```bash
# From project root
uvicorn idp_plugin.test_server:app --reload --port 8000
```

**Alternative**: If you're in the idp_plugin folder:
```bash
# From idp_plugin folder
python test_server.py
```

The server will start at: **http://localhost:8000**

- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Step 5: Test the API

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test 2: Upload a Document

```bash
curl -X POST "http://localhost:8000/idp/upload" \
  -F "file=@test_document.pdf" \
  -F "document_type=trf_jrf" \
  -F "metadata={\"test\": true}"
```

**Note**: Create a test PDF file or use any PDF document.

Expected response:
```json
{
  "id": "uuid-here",
  "filename": "unique-filename.pdf",
  "original_filename": "test_document.pdf",
  "status": "uploaded",
  "document_type": "trf_jrf",
  ...
}
```

**Save the `document_id` from the response!**

### Test 3: Process Document (OCR + Extraction)

```bash
# Replace {document_id} with the ID from step 2
curl -X POST "http://localhost:8000/idp/process/{document_id}"
```

This will:
1. Run OCR on the document
2. Extract structured data using LLM

**Note**: This may take 30-60 seconds depending on document size.

### Test 4: Get Extraction Results

```bash
curl "http://localhost:8000/idp/{document_id}/extraction"
```

Expected response:
```json
{
  "id": "extraction-uuid",
  "document_id": "document-uuid",
  "extracted_data": {
    "form_number": "...",
    "customer": {
      "name": "...",
      ...
    },
    ...
  },
  "is_valid": "valid",
  ...
}
```

### Test 5: Get Confidence Scores

```bash
curl "http://localhost:8000/idp/{document_id}/confidence"
```

### Test 6: Map to LMS Schema

```bash
curl -X POST "http://localhost:8000/idp/{document_id}/map?target=LMS"
```

## Using Python Scripts for Testing

### Test Script Example

Create `test_idp.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000/idp"

# 1. Upload document
with open("test_document.pdf", "rb") as f:
    files = {"file": f}
    data = {
        "document_type": "trf_jrf",
        "metadata": json.dumps({"test": True})
    }
    response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    doc = response.json()
    document_id = doc["id"]
    print(f"✓ Document uploaded: {document_id}")

# 2. Process document
response = requests.post(f"{BASE_URL}/process/{document_id}")
print(f"✓ Processing started: {response.json()}")

# Wait for processing (in production, use async or polling)
import time
time.sleep(60)  # Wait 60 seconds

# 3. Get extraction
response = requests.get(f"{BASE_URL}/{document_id}/extraction")
extraction = response.json()
print(f"✓ Extraction: {json.dumps(extraction['extracted_data'], indent=2)}")

# 4. Get confidence
response = requests.get(f"{BASE_URL}/{document_id}/confidence")
confidence = response.json()
print(f"✓ Confidence: {confidence['average_confidence']:.2%}")

# 5. Map to LMS
response = requests.post(f"{BASE_URL}/{document_id}/map?target=LMS")
mapped = response.json()
print(f"✓ Mapped data: {json.dumps(mapped['mapped_data'], indent=2)}")
```

Run:
```bash
python test_idp.py
```

## Using Swagger UI (Interactive Testing)

1. Start the server
2. Open http://localhost:8000/docs
3. Use the interactive API documentation to test endpoints

## Troubleshooting

### "Module not found" errors

```bash
# Make sure you're in the project root and install dependencies
pip install -r idp_plugin/requirements.txt
```

### Database connection errors

**SQLite**: Make sure the directory exists and is writable.

**PostgreSQL**: 
- Check PostgreSQL is running: `pg_isready`
- Verify connection string in `.env`
- Check database exists: `psql -l | grep idp_db`

### OpenAI API errors

- Verify API key is set: `echo $OPENAI_API_KEY`
- Check API key is valid
- Ensure you have credits/quota

### OCR errors

**PaddleOCR not working**:
```bash
# Reinstall PaddleOCR
pip uninstall paddleocr
pip install paddleocr
```

**PDF errors**:
- Ensure pdfplumber is installed: `pip install pdfplumber`
- Check PDF is not corrupted

### Import errors

Make sure you're running from the project root:
```bash
cd LMS
python idp_plugin/test_server.py
```

## Next Steps

1. **Load RAG Knowledge Base** (optional):
   ```python
   from idp_plugin.services.rag_ingestion_service import RAGIngestionService
   from idp_plugin.core.database import SessionLocal
   
   db = SessionLocal()
   service = RAGIngestionService(db)
   # Load your knowledge base
   ```

2. **Integrate with LMS Backend**:
   See `INTEGRATION_GUIDE.md` for details

3. **Production Deployment**:
   See `PRODUCTION_CHECKLIST.md` for production readiness

## Quick Test Checklist

- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Database setup complete
- [ ] Test server running
- [ ] Health check passes
- [ ] Document upload works
- [ ] Processing completes
- [ ] Extraction returns data
- [ ] Confidence scores calculated
- [ ] Mapping works

## Support

- Check logs in console for detailed error messages
- Review `PRODUCTION_CHECKLIST.md` for common issues
- Verify all environment variables are set correctly



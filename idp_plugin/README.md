# IDP Plugin - Intelligent Document Processing Module

## Overview

The IDP (Intelligent Document Processing) plugin is a modular, isolated component designed to be plugged into the Lab Management System (LMS) without modifying core LMS logic. It provides intelligent document processing capabilities for various lab document types.

## Plugin Responsibility

The IDP plugin is responsible for:

1. **Document Ingestion**: Accepting and storing document uploads
2. **OCR Processing**: Extracting text from PDFs and images using PaddleOCR and pdfplumber
3. **Structured Extraction**: Using GPT-4.1 to extract structured data from documents according to canonical schemas
4. **RAG-Enhanced Reasoning**: Using GPT-4.1-mini with RAG context to normalize, validate, and suggest mappings
5. **Confidence Scoring**: Calculating field-level confidence scores based on OCR quality, LLM certainty, and RAG similarity
6. **Mapping**: Converting canonical JSON to LMS-specific form schemas
7. **Audit Logging**: Maintaining full traceability of all operations

## Architecture Principles

- **Modularity**: Fully isolated from core LMS logic
- **API-Based Communication**: All interactions with LMS via REST APIs
- **Deterministic Extraction**: No hallucinations - only explicit values from documents
- **Full Auditability**: Every operation is logged for traceability
- **Clean Architecture**: Separation of concerns with clear boundaries

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy
- **OCR**: PaddleOCR + pdfplumber
- **Extraction LLM**: GPT-4.1
- **RAG Reasoning LLM**: GPT-4.1-mini
- **Vector DB**: Postgres + pgvector
- **RAG Scope**: Knowledge + Schema ONLY (no document data)

## Module Structure

```
idp_plugin/
├── __init__.py
├── README.md
├── models/              # SQLAlchemy models
│   ├── __init__.py
│   ├── base.py
│   ├── documents.py
│   ├── ocr_outputs.py
│   ├── extractions.py
│   ├── field_confidence.py
│   ├── audit_logs.py
│   ├── rag_knowledge_vectors.py
│   └── rag_schema_vectors.py
├── schemas/             # Pydantic schemas
│   ├── __init__.py
│   ├── documents.py
│   ├── ocr.py
│   ├── extraction.py
│   └── mapping.py
├── services/            # Business logic
│   ├── __init__.py
│   ├── ingestion_service.py
│   ├── ocr_service.py
│   ├── extraction_service.py
│   ├── rag_ingestion_service.py
│   ├── rag_retrieval_service.py
│   ├── reasoning_service.py
│   ├── confidence_service.py
│   └── mapping_service.py
├── api/                 # FastAPI endpoints
│   ├── __init__.py
│   └── endpoints/
│       ├── __init__.py
│       ├── upload.py
│       ├── process.py
│       ├── extraction.py
│       ├── confidence.py
│       └── mapping.py
├── config/              # Configuration
│   ├── __init__.py
│   ├── schemas/         # JSON schemas for document types
│   │   ├── trf_jrf.json
│   │   ├── rfq.json
│   │   ├── certificate.json
│   │   └── calibration_report.json
│   └── prompts/         # LLM prompts
│       ├── trf_jrf_prompt.txt
│       ├── rfq_prompt.txt
│       ├── certificate_prompt.txt
│       └── calibration_report_prompt.txt
├── utils/               # Utilities
│   ├── __init__.py
│   ├── storage.py       # File storage abstraction
│   └── validators.py    # Validation utilities
└── core/                # Core functionality
    ├── __init__.py
    ├── database.py      # Database setup
    └── exceptions.py    # Custom exceptions
```

## Integration with LMS

The plugin exposes REST APIs that the LMS can call:

- `POST /idp/upload` - Upload a document
- `POST /idp/process` - Process a document (OCR + Extraction)
- `GET /idp/{document_id}/extraction` - Get extraction results
- `GET /idp/{document_id}/confidence` - Get confidence scores
- `POST /idp/{document_id}/map?target=LMS` - Map to LMS schema

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (see `.env.example`)

3. Initialize database:
```bash
alembic upgrade head
```

4. Load RAG knowledge base:
```bash
python -m idp_plugin.services.rag_ingestion_service
```

## Usage

### In LMS Backend

```python
from fastapi import FastAPI
from idp_plugin.api.endpoints import upload, process, extraction, confidence, mapping

app = FastAPI()

# Include IDP plugin routes
app.include_router(upload.router, prefix="/idp", tags=["IDP"])
app.include_router(process.router, prefix="/idp", tags=["IDP"])
app.include_router(extraction.router, prefix="/idp", tags=["IDP"])
app.include_router(confidence.router, prefix="/idp", tags=["IDP"])
app.include_router(mapping.router, prefix="/idp", tags=["IDP"])
```

## Document Types Supported

1. **TRF/JRF** (Test Request Form / Job Request Form)
2. **RFQ** (Request for Quotation)
3. **Certificate** (Test Certificates)
4. **Calibration Report** (Equipment Calibration Reports)

## Key Features

- ✅ Deterministic extraction (no hallucinations)
- ✅ Full audit trail
- ✅ Field-level confidence scoring
- ✅ RAG-enhanced normalization
- ✅ Config-driven mapping
- ✅ Isolated from core LMS logic
- ✅ Production-ready error handling

## License

Internal use only - Lab Management System






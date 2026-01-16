# IDP Plugin - Integration Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install -r idp_plugin/requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```bash
# Database
IDP_DATABASE_URL=postgresql://user:password@localhost/idp_db

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
EXTRACTION_MODEL=gpt-4.1
REASONING_MODEL=gpt-4.1-mini
EMBEDDING_MODEL=text-embedding-3-small

# Storage
IDP_STORAGE_PATH=./idp_storage
```

### 3. Setup Database

```bash
# Create database
createdb idp_db

# Enable pgvector extension
psql idp_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations (create Alembic migrations first)
alembic upgrade head
```

### 4. Load RAG Knowledge Base

```python
from idp_plugin.services.rag_ingestion_service import RAGIngestionService
from idp_plugin.core.database import SessionLocal

db = SessionLocal()
service = RAGIngestionService(db)

# Load knowledge base from JSON file
service.load_from_json_file("knowledge_base.json", content_type="knowledge")

# Load schema descriptions
service.load_from_json_file("schema_descriptions.json", content_type="schema")
```

### 5. Integrate with LMS Backend

In your FastAPI main application:

```python
from fastapi import FastAPI
from idp_plugin.api.router import idp_router

app = FastAPI()

# Include IDP plugin routes
app.include_router(idp_router, prefix="/idp", tags=["IDP"])
```

## API Usage

### 1. Upload Document

```bash
curl -X POST "http://localhost:8000/idp/upload" \
  -F "file=@document.pdf" \
  -F "document_type=trf_jrf" \
  -F "metadata={\"project_id\": \"123\"}"
```

Response:
```json
{
  "id": "uuid",
  "filename": "unique_filename.pdf",
  "original_filename": "document.pdf",
  "status": "uploaded",
  ...
}
```

### 2. Process Document

```bash
curl -X POST "http://localhost:8000/idp/process/{document_id}"
```

This performs OCR and extraction.

### 3. Get Extraction

```bash
curl "http://localhost:8000/idp/{document_id}/extraction"
```

Response:
```json
{
  "id": "uuid",
  "document_id": "uuid",
  "extracted_data": {
    "form_number": "TRF-001",
    "customer": {
      "name": "Acme Corp",
      ...
    },
    ...
  },
  "is_valid": "valid",
  ...
}
```

### 4. Get Confidence Scores

```bash
curl "http://localhost:8000/idp/{document_id}/confidence"
```

### 5. Map to LMS Schema

```bash
curl -X POST "http://localhost:8000/idp/{document_id}/map?target=LMS"
```

## Architecture

### Plugin Isolation

The IDP plugin is fully isolated from LMS core logic:
- Separate database tables (prefixed with `idp_`)
- Independent services
- API-only communication

### Data Flow

1. **Upload**: Document → Storage → `idp_documents` table
2. **OCR**: Document → OCR Service → `idp_ocr_outputs` table
3. **Extraction**: OCR Text → LLM → `idp_extractions` table
4. **Confidence**: Extraction → Confidence Service → `idp_field_confidence` table
5. **Mapping**: Extraction → Mapping Service → LMS-formatted JSON

### RAG Flow

1. **Ingestion**: Knowledge/Schema → Embeddings → `idp_rag_*_vectors` tables
2. **Retrieval**: Query → Embedding → Vector Search → Top-K results
3. **Reasoning**: Extracted Value + RAG Context → LLM → Suggestions

## Customization

### Adding New Document Types

1. Create JSON schema in `config/schemas/`
2. Create prompt in `config/prompts/`
3. Update `DocumentType` enum in `models/documents.py`
4. Add mapping config in `config/mappings/`

### Custom Mapping Rules

Edit mapping JSON files in `config/mappings/`:

```json
{
  "field_mappings": {
    "target_field": {
      "source_path": "source.field.path",
      "transformation": {
        "type": "format_date"
      },
      "default": null
    }
  }
}
```

## Troubleshooting

### OCR Not Working

- Check PaddleOCR installation: `pip install paddleocr`
- Verify file format is supported
- Check OCR service logs

### Extraction Failing

- Verify OpenAI API key is set
- Check extraction model name is correct
- Review extraction prompts for clarity
- Check JSON schema validation errors

### RAG Retrieval Slow

- Create vector indexes: `CREATE INDEX ON idp_rag_knowledge_vectors USING ivfflat (embedding vector_cosine_ops);`
- Reduce `RAG_TOP_K` in config
- Optimize embedding model

## Support

For issues or questions, refer to:
- `README.md` - Overview and architecture
- `PRODUCTION_CHECKLIST.md` - Production readiness
- Code comments - Inline documentation






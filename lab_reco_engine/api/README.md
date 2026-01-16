# Lab Recommendation Engine API

REST API for the Lab Recommendation Engine.

## Installation

```bash
pip install -r api/requirements.txt
```

## Running the API

```bash
python api/recommendation_api.py
```

The API will start on `http://localhost:5000`

## Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Search labs
curl "http://localhost:5000/api/labs/search?test_name=voltage&limit=10"
```

## Configuration

Update database credentials in `recommendation_api.py`:

```python
DB_CONFIG = {
    'dbname': 'lab_reco_engine',
    'user': 'postgres',
    'password': 'your_password',  # Update this
    'host': 'localhost',
    'port': 5432
}
```

## Documentation

See `docs/API_DOCUMENTATION.md` for complete API reference.


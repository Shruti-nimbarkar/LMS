# Lab Recommendation Engine

Production-ready lab recommendation system for matching testing laboratories with test requirements.

## Quick Start

### 1. Setup Database

```bash
# Automated setup (recommended)
python db/setup_database.py

# Or manually in pgAdmin:
# 1. Create database: lab_reco_engine
# 2. Run: db/schema.sql
# 3. Run: db/indexes.sql
```

### 2. Configure Database Connection

Update `scripts/build_capabilities.py` with your PostgreSQL credentials:
```python
def get_db_connection():
    return psycopg2.connect(
        dbname="lab_reco_engine",  # or your database name
        user="postgres",
        password="your_password",
        host="localhost",
        port=5432
    )
```

### 3. Run Data Pipeline

```bash
python main.py
```

This will:
- Process all CSV files from `data/raw_csvs/`
- Normalize and clean data
- Build lab capabilities
- Populate database

## Project Structure

```
lab_reco_engine/
├── db/
│   ├── schema.sql               # Production database schema
│   ├── indexes.sql              # Performance indexes
│   └── setup_database.py        # Automated database setup
├── config/
│   ├── domain_rules.yaml         # Domain classification rules
│   ├── standard_aliases.yaml    # Standard name aliases
│   └── test_synonyms.yaml       # Test name synonyms
├── scripts/
│   ├── profile_labs.py          # Lab profiling
│   ├── normalize_rows.py        # Data normalization
│   ├── build_capabilities.py    # Build lab capabilities
│   ├── entity_resolution.py     # Entity resolution
│   └── domain_inference.py      # Domain inference
├── data/
│   └── raw_csvs/                # 817 lab CSV files
└── main.py                       # Main pipeline entry point
```

## Requirements

- Python 3.8+
- PostgreSQL 12+
- Required packages: pandas, psycopg2, pyyaml

## Database Schema

The enhanced schema includes:
- 8 core tables (domains, disciplines, tests, standards, labs, etc.)
- Full referential integrity
- Case-insensitive uniqueness
- Audit columns (created_at, updated_at)
- ~28 optimized indexes

## Configuration Files

- `domain_rules.yaml`: Maps tests/standards to domains
- `standard_aliases.yaml`: Standard name canonicalization
- `test_synonyms.yaml`: Test name synonyms

## Data Pipeline

The pipeline processes 817 lab CSV files and:
- Profiles lab data structure
- Normalizes column names and data
- Resolves entities (labs, tests, standards)
- Infers domains for all capabilities
- Populates database with full referential integrity

## Recommendation Engine

### 🎨 Streamlit UI (Recommended)

Start the web interface:
```bash
pip install -r ui/requirements.txt
streamlit run ui/app.py
```

Features:
- 🔍 Search labs by test/standard/domain
- ⭐ Get ranked recommendations
- 📊 View detailed lab information
- 🔎 Search tests and standards
- 📈 Database statistics dashboard

### SQL Queries

Ready-to-use SQL queries for finding labs:
- `db/recommendation_queries.sql` - 10 comprehensive query patterns
- Find labs by test name, standard, or domain
- Multi-criteria matching with scoring
- Ranked recommendations

### REST API

Start the API server:
```bash
pip install -r api/requirements.txt
python api/recommendation_api.py
```

API endpoints:
- `GET /api/health` - Health check
- `GET /api/labs/search` - Search labs
- `POST /api/labs/recommend` - Get ranked recommendations
- `GET /api/labs/<lab_id>` - Get lab details
- `GET /api/domains` - List all domains
- `GET /api/tests/search` - Search tests
- `GET /api/standards/search` - Search standards

### Documentation

- `docs/API_DOCUMENTATION.md` - Complete API reference
- `docs/QUERY_PATTERNS.md` - SQL query patterns guide
- `docs/USAGE_EXAMPLES.md` - Python, API, and SQL examples

## Project Structure

```
lab_reco_engine/
├── ui/
│   ├── app.py                    # Streamlit web interface
│   ├── requirements.txt          # UI dependencies
│   └── README.md                # UI quick start
├── db/
│   ├── schema.sql               # Production database schema
│   ├── indexes.sql              # Performance indexes
│   ├── setup_database.py        # Automated database setup
│   └── recommendation_queries.sql  # Recommendation queries
├── api/
│   ├── recommendation_api.py    # REST API server
│   ├── requirements.txt         # API dependencies
│   └── README.md                # API quick start
├── docs/
│   ├── API_DOCUMENTATION.md     # API reference
│   ├── QUERY_PATTERNS.md        # Query patterns guide
│   └── USAGE_EXAMPLES.md        # Usage examples
├── config/
│   ├── domain_rules.yaml         # Domain classification rules
│   ├── standard_aliases.yaml    # Standard name aliases
│   └── test_synonyms.yaml       # Test name synonyms
├── scripts/
│   ├── profile_labs.py          # Lab profiling
│   ├── normalize_rows.py        # Data normalization
│   ├── build_capabilities.py    # Build lab capabilities
│   ├── entity_resolution.py     # Entity resolution
│   └── domain_inference.py      # Domain inference
├── data/
│   └── raw_csvs/                # 817 lab CSV files
└── main.py                       # Main pipeline entry point
```

## Support

For issues or questions, check the database setup logs or PostgreSQL error messages.


# Lab Recommendation Engine - Streamlit UI

Modern web interface for the Lab Recommendation Engine.

## Installation

```bash
pip install -r ui/requirements.txt
```

## Running the UI

```bash
streamlit run ui/app.py
```

The UI will open in your browser at `http://localhost:8501`

## Features

### 🔍 Search Labs
- Search by test name, standard, or domain
- View matching capabilities
- Grouped by lab for easy browsing

### ⭐ Get Recommendations
- Ranked lab recommendations
- Relevance scoring
- Multi-criteria matching
- Sample tests and standards preview

### 📊 Lab Details
- Complete lab information
- All capabilities listed
- Domain distribution charts
- Download capabilities as CSV

### 🔎 Search Tests/Standards
- Search for available tests
- Search for available standards
- See how many labs offer each

### 📈 Statistics
- Database overview
- Domain distribution
- Top labs by capability count

## Configuration

Update database credentials in `ui/app.py`:

```python
@st.cache_resource
def get_db_connection():
    return psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="your_password",  # Update this
        host="localhost",
        port=5432
    )
```

## Screenshots

The UI includes:
- Clean, modern interface
- Real-time search
- Interactive charts
- Downloadable results
- Responsive design


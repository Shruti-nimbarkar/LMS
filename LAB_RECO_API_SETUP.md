# Lab Recommendation API Setup Guide

## ✅ Dependencies Installed

The following packages have been successfully installed:
- Flask==3.0.0
- flask-cors==4.0.0
- psycopg2-binary==2.9.11

## Starting the API Server

### Option 1: Run in Current Terminal
```powershell
cd lab_reco_engine\api
python recommendation_api.py
```

### Option 2: Run in Background (Windows)
```powershell
cd lab_reco_engine\api
Start-Process python -ArgumentList "recommendation_api.py" -WindowStyle Minimized
```

## Verify API is Running

Once started, you should see output like:
```
============================================================
LAB RECOMMENDATION ENGINE API
============================================================

Starting API server...
API will be available at: http://localhost:5000

Available endpoints:
  GET  /api/health - Health check
  GET  /api/labs/search?test_name=...&standard=...&domain=...
  POST /api/labs/recommend - Get ranked recommendations
  GET  /api/labs/<lab_id> - Get lab details
  GET  /api/domains - List all domains
  GET  /api/tests/search?q=... - Search tests
  GET  /api/standards/search?q=... - Search standards

============================================================
 * Running on http://0.0.0.0:5000
```

## Test the API

### Health Check
```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "active_labs": 815
}
```

### Test Search
```powershell
curl "http://localhost:5000/api/labs/search?test_name=voltage&limit=5"
```

## Database Configuration

**Important**: Make sure your PostgreSQL database is:
1. ✅ Running
2. ✅ Database `lab_reco_engine` exists
3. ✅ Database credentials are correct in `recommendation_api.py`

### Update Database Credentials

If needed, edit `lab_reco_engine/api/recommendation_api.py`:

```python
DB_CONFIG = {
    'dbname': 'lab_reco_engine',
    'user': 'postgres',
    'password': 'your_password',  # Update this
    'host': 'localhost',
    'port': 5432
}
```

## Troubleshooting

### Error: ModuleNotFoundError: No module named 'flask'
✅ **Fixed** - Dependencies have been installed

### Error: Connection refused / Cannot connect to database
- Check if PostgreSQL is running
- Verify database credentials
- Ensure database `lab_reco_engine` exists
- Check if database has data (run `main.py` if needed)

### Error: Port 5000 already in use
- Kill the process using port 5000, or
- Modify the port in `recommendation_api.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)  # Change port
  ```
- Update frontend `.env`:
  ```
  VITE_LAB_RECO_API_URL=http://localhost:5001/api
  ```

## Next Steps

1. ✅ Dependencies installed
2. ⏳ Start the API server (see above)
3. ⏳ Verify API is running (health check)
4. ⏳ Test from frontend (navigate to Lab Recommendations page)

## Integration with LMS

Once the API is running:
- Frontend will automatically connect to `http://localhost:5000/api`
- Or set `VITE_LAB_RECO_API_URL` in `.env` for custom URL
- Navigate to "Lab Recommendations" in LMS sidebar



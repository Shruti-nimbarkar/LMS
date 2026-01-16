# IDP Plugin - Quick Setup Guide

## Option 1: SQLite (Recommended for Testing)

**Easiest way to get started - no PostgreSQL setup needed!**

### Step 1: Update Config

Edit `idp_plugin/core/config.py`:

```python
DATABASE_URL: str = os.getenv("IDP_DATABASE_URL", "sqlite:///./idp_test.db")
```

Or create a `.env` file in the project root:

```bash
IDP_DATABASE_URL=sqlite:///./idp_test.db
```

### Step 2: Run Setup

```powershell
python idp_plugin\setup_database.py
```

That's it! SQLite will create the database file automatically.

---

## Option 2: PostgreSQL (For Production)

### Step 1: Make sure PostgreSQL is running

```powershell
# Check if PostgreSQL is running
pg_isready
```

### Step 2: Create the database

```powershell
# Create database (replace 'user' with your PostgreSQL username)
createdb -U user idp_db

# Or using psql
psql -U user -c "CREATE DATABASE idp_db;"
```

### Step 3: Update Config

Edit `idp_plugin/core/config.py`:

```python
DATABASE_URL: str = os.getenv("IDP_DATABASE_URL", "postgresql://user:2003@localhost:5432/idp_db")
```

**Or use environment variable:**

Create `.env` file:
```bash
IDP_DATABASE_URL=postgresql://user:2003@localhost:5432/idp_db
```

### Step 4: Install pgvector extension (optional, for RAG)

```sql
-- Connect to idp_db
psql -U user -d idp_db

-- Install extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 5: Run Setup

```powershell
python idp_plugin\setup_database.py
```

---

## Troubleshooting PostgreSQL Connection

### Error: "password authentication failed"

**Solutions:**

1. **Check PostgreSQL is running:**
   ```powershell
   pg_isready
   ```

2. **Verify credentials:**
   - Username: `user`
   - Password: `2003`
   - Database: `idp_db`
   - Port: `5432`

3. **Test connection manually:**
   ```powershell
   psql -U user -d idp_db -h localhost -p 5432
   ```

4. **Create database if it doesn't exist:**
   ```powershell
   createdb -U user idp_db
   ```

5. **Check PostgreSQL authentication settings:**
   - Edit `pg_hba.conf` if needed
   - Make sure local connections are allowed

### Error: "database does not exist"

Create the database:
```powershell
createdb -U user idp_db
```

### Still having issues?

**Use SQLite instead** - it works perfectly for testing and doesn't require any setup:

```python
# In config.py
DATABASE_URL: str = os.getenv("IDP_DATABASE_URL", "sqlite:///./idp_test.db")
```

---

## Next Steps

After database setup:

1. **Start the test server:**
   ```powershell
   python idp_plugin\test_server.py
   ```

2. **Test the API:**
   - Open http://localhost:8000/docs
   - Or run: `python idp_plugin\test_idp_simple.py`





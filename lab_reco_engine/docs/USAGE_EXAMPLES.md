# Usage Examples

Practical examples for using the Lab Recommendation Engine.

---

## Python Examples

### Example 1: Find Labs by Test Name

```python
import psycopg2
from psycopg2.extras import RealDictCursor

def find_labs_by_test(test_name):
    conn = psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="2003",
        host="localhost",
        port=5432
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT DISTINCT
            l.lab_id,
            l.lab_name,
            t.test_name,
            s.standard_code,
            d.domain_name
        FROM labs l
        JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
        JOIN tests t ON t.test_id = lc.test_id
        JOIN standards s ON s.standard_id = lc.standard_id
        JOIN domains d ON d.domain_id = lc.domain_id
        WHERE LOWER(t.test_name) LIKE LOWER(%s)
          AND l.deleted_at IS NULL
        ORDER BY l.lab_name
        LIMIT 20
    """, (f'%{test_name}%',))
    
    results = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(row) for row in results]

# Usage
labs = find_labs_by_test("voltage test")
for lab in labs:
    print(f"{lab['lab_name']} - {lab['test_name']} ({lab['standard_code']})")
```

---

### Example 2: Get Ranked Recommendations

```python
def get_recommendations(test_name=None, standard=None, domain=None, limit=20):
    conn = psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="2003",
        host="localhost",
        port=5432
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    conditions = ["l.deleted_at IS NULL"]
    params = []
    
    if test_name:
        conditions.append("LOWER(t.test_name) LIKE LOWER(%s)")
        params.append(f'%{test_name}%')
    
    if standard:
        conditions.append("LOWER(s.standard_code) LIKE LOWER(%s)")
        params.append(f'%{standard}%')
    
    if domain:
        conditions.append("d.domain_name = %s")
        params.append(domain)
    
    query = f"""
        WITH lab_scores AS (
            SELECT 
                l.lab_id,
                l.lab_name,
                COUNT(DISTINCT lc.test_id) AS matching_tests,
                COUNT(DISTINCT lc.standard_id) AS matching_standards,
                COUNT(*) AS total_matches
            FROM labs l
            JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
            JOIN tests t ON t.test_id = lc.test_id
            JOIN standards s ON s.standard_id = lc.standard_id
            JOIN domains d ON d.domain_id = lc.domain_id
            WHERE {' AND '.join(conditions)}
            GROUP BY l.lab_id, l.lab_name
        )
        SELECT 
            lab_id,
            lab_name,
            matching_tests,
            matching_standards,
            total_matches,
            (matching_tests * 10 + matching_standards * 5) AS score
        FROM lab_scores
        ORDER BY score DESC
        LIMIT %s
    """
    params.append(limit)
    
    cur.execute(query, params)
    results = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return [dict(row) for row in results]

# Usage
recommendations = get_recommendations(
    test_name="emission",
    standard="CISPR",
    domain="EMC",
    limit=10
)

for rec in recommendations:
    print(f"{rec['lab_name']}: Score {rec['score']} "
          f"({rec['matching_tests']} tests, {rec['matching_standards']} standards)")
```

---

### Example 3: Get Lab Details

```python
def get_lab_details(lab_id):
    conn = psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="2003",
        host="localhost",
        port=5432
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get lab info
    cur.execute("""
        SELECT lab_id, lab_name, created_at
        FROM labs
        WHERE lab_id = %s AND deleted_at IS NULL
    """, (lab_id,))
    lab = cur.fetchone()
    
    if not lab:
        return None
    
    # Get capabilities
    cur.execute("""
        SELECT 
            t.test_name,
            s.standard_code,
            d.domain_name
        FROM lab_capabilities lc
        JOIN tests t ON t.test_id = lc.test_id
        JOIN standards s ON s.standard_id = lc.standard_id
        JOIN domains d ON d.domain_id = lc.domain_id
        WHERE lc.lab_id = %s
        ORDER BY d.domain_name, t.test_name
    """, (lab_id,))
    capabilities = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'lab': dict(lab),
        'capabilities': [dict(c) for c in capabilities],
        'total': len(capabilities)
    }

# Usage
details = get_lab_details(85)
print(f"Lab: {details['lab']['lab_name']}")
print(f"Total capabilities: {details['total']}")
for cap in details['capabilities'][:5]:
    print(f"  - {cap['test_name']} ({cap['standard_code']}) - {cap['domain_name']}")
```

---

## API Examples

### Example 1: Search Labs via API

```bash
# Search by test name
curl "http://localhost:5000/api/labs/search?test_name=voltage&limit=10"

# Search by standard
curl "http://localhost:5000/api/labs/search?standard=IEC%2060068"

# Search by domain
curl "http://localhost:5000/api/labs/search?domain=Electrical&limit=20"

# Multi-criteria search
curl "http://localhost:5000/api/labs/search?test_name=emission&standard=CISPR&domain=EMC"
```

### Example 2: Get Recommendations via API

```bash
curl -X POST http://localhost:5000/api/labs/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "test_name": "voltage test",
    "standard": "IEC 60068",
    "domain": "Electrical",
    "limit": 10
  }'
```

### Example 3: Get Lab Details via API

```bash
curl "http://localhost:5000/api/labs/85"
```

### Example 4: Search Tests and Standards

```bash
# Search tests
curl "http://localhost:5000/api/tests/search?q=voltage&limit=10"

# Search standards
curl "http://localhost:5000/api/standards/search?q=IEC%2060068&limit=10"
```

---

## JavaScript/Web Examples

### Example: Search Labs from Web Interface

```javascript
// Search labs
async function searchLabs(testName, standard, domain) {
    const params = new URLSearchParams();
    if (testName) params.append('test_name', testName);
    if (standard) params.append('standard', standard);
    if (domain) params.append('domain', domain);
    params.append('limit', 20);
    
    const response = await fetch(`http://localhost:5000/api/labs/search?${params}`);
    const data = await response.json();
    
    return data.results;
}

// Get recommendations
async function getRecommendations(criteria) {
    const response = await fetch('http://localhost:5000/api/labs/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(criteria)
    });
    const data = await response.json();
    
    return data.results;
}

// Usage
const labs = await searchLabs('voltage', 'IEC 60068', 'Electrical');
console.log(`Found ${labs.length} labs`);

const recommendations = await getRecommendations({
    test_name: 'emission',
    standard: 'CISPR',
    domain: 'EMC',
    limit: 10
});
```

---

## SQL Examples (pgAdmin)

### Example 1: Quick Lab Search

```sql
-- Find labs for "Voltage Test"
SELECT DISTINCT lab_name, test_name, standard_code, domain_name
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE LOWER(t.test_name) LIKE LOWER('%voltage%')
  AND l.deleted_at IS NULL
LIMIT 20;
```

### Example 2: Domain Statistics

```sql
-- Get domain distribution
SELECT 
    domain_name,
    COUNT(*) AS capabilities,
    COUNT(DISTINCT lab_id) AS labs
FROM lab_capabilities lc
JOIN domains d ON d.domain_id = lc.domain_id
JOIN labs l ON l.lab_id = lc.lab_id
WHERE l.deleted_at IS NULL
GROUP BY domain_name
ORDER BY capabilities DESC;
```

---

## Common Use Cases

### Use Case 1: "I need a lab that can test my product for IEC 60068"

```sql
SELECT DISTINCT
    l.lab_name,
    COUNT(DISTINCT lc.test_id) AS available_tests
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN standards s ON s.standard_id = lc.standard_id
WHERE LOWER(s.standard_code) LIKE LOWER('%IEC 60068%')
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
ORDER BY available_tests DESC;
```

### Use Case 2: "Find the best lab for EMC testing"

```sql
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(*) AS emc_capabilities,
    COUNT(DISTINCT lc.test_id) AS unique_tests,
    COUNT(DISTINCT lc.standard_id) AS unique_standards
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE d.domain_name = 'EMC'
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
ORDER BY emc_capabilities DESC
LIMIT 10;
```

### Use Case 3: "Find labs that can do both Electrical and EMC testing"

```sql
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(DISTINCT CASE WHEN d.domain_name = 'Electrical' THEN lc.domain_id END) AS electrical,
    COUNT(DISTINCT CASE WHEN d.domain_name = 'EMC' THEN lc.domain_id END) AS emc,
    COUNT(*) AS total_capabilities
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.deleted_at IS NULL
  AND d.domain_name IN ('Electrical', 'EMC')
GROUP BY l.lab_id, l.lab_name
HAVING COUNT(DISTINCT CASE WHEN d.domain_name = 'Electrical' THEN lc.domain_id END) > 0
   AND COUNT(DISTINCT CASE WHEN d.domain_name = 'EMC' THEN lc.domain_id END) > 0
ORDER BY total_capabilities DESC;
```

---

For more query patterns, see `docs/QUERY_PATTERNS.md`  
For API documentation, see `docs/API_DOCUMENTATION.md`


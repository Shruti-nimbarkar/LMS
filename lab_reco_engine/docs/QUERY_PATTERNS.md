# Query Patterns Guide

Common SQL query patterns for the Lab Recommendation Engine.

---

## 1. Basic Lab Search by Test

```sql
-- Find labs that can perform a specific test
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
WHERE LOWER(t.test_name) LIKE LOWER('%your_test_name%')
  AND l.deleted_at IS NULL
ORDER BY l.lab_name;
```

---

## 2. Basic Lab Search by Standard

```sql
-- Find labs that can perform tests for a specific standard
SELECT DISTINCT
    l.lab_id,
    l.lab_name,
    s.standard_code,
    s.full_code,
    COUNT(DISTINCT lc.test_id) AS test_count
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN standards s ON s.standard_id = lc.standard_id
WHERE LOWER(s.standard_code) LIKE LOWER('%your_standard%')
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name, s.standard_id, s.standard_code, s.full_code
ORDER BY test_count DESC;
```

---

## 3. Basic Lab Search by Domain

```sql
-- Find labs with capabilities in a specific domain
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(*) AS capability_count,
    COUNT(DISTINCT lc.test_id) AS test_count
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE d.domain_name = 'Electrical'  -- Change domain
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
ORDER BY capability_count DESC;
```

---

## 4. Multi-Criteria Search

```sql
-- Find labs matching multiple criteria
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
WHERE l.deleted_at IS NULL
  AND LOWER(t.test_name) LIKE LOWER('%test_keyword%')
  AND LOWER(s.standard_code) LIKE LOWER('%standard_keyword%')
  AND d.domain_name IN ('Electrical', 'EMC')  -- Multiple domains
ORDER BY l.lab_name;
```

---

## 5. Ranked Recommendations with Scoring

```sql
-- Get labs ranked by match quality
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
    WHERE l.deleted_at IS NULL
      AND LOWER(t.test_name) LIKE LOWER('%your_test%')
      AND LOWER(s.standard_code) LIKE LOWER('%your_standard%')
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
LIMIT 20;
```

---

## 6. Find Labs with Specific Test + Standard Combination

```sql
-- Exact match for test and standard
SELECT 
    l.lab_id,
    l.lab_name,
    t.test_name,
    s.standard_code,
    s.full_code,
    d.domain_name
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE LOWER(t.test_name) LIKE LOWER('%exact_test_name%')
  AND LOWER(s.standard_code) LIKE LOWER('%exact_standard%')
  AND l.deleted_at IS NULL
ORDER BY l.lab_name;
```

---

## 7. Find Comprehensive Labs (Multiple Domains)

```sql
-- Labs that can perform tests across multiple domains
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(DISTINCT lc.domain_id) AS domain_count,
    array_agg(DISTINCT d.domain_name) AS domains,
    COUNT(*) AS total_capabilities
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
HAVING COUNT(DISTINCT lc.domain_id) >= 3
ORDER BY domain_count DESC, total_capabilities DESC;
```

---

## 8. Fuzzy Matching with Scoring

```sql
-- Find labs with best partial matches
SELECT DISTINCT
    l.lab_id,
    l.lab_name,
    t.test_name,
    s.standard_code,
    -- Calculate match scores
    CASE 
        WHEN LOWER(t.test_name) = LOWER('exact_match') THEN 10
        WHEN LOWER(t.test_name) LIKE LOWER('exact_match%') THEN 8
        WHEN LOWER(t.test_name) LIKE LOWER('%exact_match%') THEN 6
        WHEN LOWER(t.test_name) LIKE LOWER('%partial%') THEN 4
        ELSE 2
    END AS test_score,
    CASE 
        WHEN LOWER(s.standard_code) = LOWER('IEC 60068') THEN 10
        WHEN LOWER(s.standard_code) LIKE LOWER('IEC 60068%') THEN 8
        WHEN LOWER(s.standard_code) LIKE LOWER('%IEC 60068%') THEN 6
        ELSE 3
    END AS standard_score
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
WHERE l.deleted_at IS NULL
  AND (
    LOWER(t.test_name) LIKE LOWER('%search_term%')
    OR LOWER(s.standard_code) LIKE LOWER('%search_term%')
  )
ORDER BY (test_score + standard_score) DESC;
```

---

## 9. Domain Distribution for a Lab

```sql
-- Get domain breakdown for a specific lab
SELECT 
    d.domain_name,
    COUNT(*) AS capability_count,
    COUNT(DISTINCT lc.test_id) AS test_count,
    COUNT(DISTINCT lc.standard_id) AS standard_count
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.lab_id = 85  -- Replace with your lab_id
GROUP BY d.domain_id, d.domain_name
ORDER BY capability_count DESC;
```

---

## 10. Top Labs by Capability Count

```sql
-- Find labs with most capabilities
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(*) AS total_capabilities,
    COUNT(DISTINCT lc.test_id) AS unique_tests,
    COUNT(DISTINCT lc.standard_id) AS unique_standards,
    COUNT(DISTINCT lc.domain_id) AS unique_domains
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
WHERE l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
ORDER BY total_capabilities DESC
LIMIT 20;
```

---

## Best Practices

1. **Always filter by `deleted_at IS NULL`** to exclude deleted labs
2. **Use `LOWER()` for case-insensitive matching**
3. **Use `LIKE` with `%` for partial matches**
4. **Limit results** with `LIMIT` for performance
5. **Use `DISTINCT`** when joining multiple tables to avoid duplicates
6. **Index usage**: All foreign keys are indexed, so JOINs are fast
7. **Scoring**: Use weighted scores for ranking (tests × 10, standards × 5, domains × 1)

---

## Performance Tips

- Simple lookups: < 10 ms
- Complex joins: < 200 ms
- Large aggregations: < 500 ms
- Use `LIMIT` for large result sets
- Indexes are optimized for common query patterns

---

For more examples, see `db/recommendation_queries.sql`


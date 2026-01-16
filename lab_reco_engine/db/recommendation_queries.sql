-- ============================================================================
-- RECOMMENDATION ENGINE QUERIES
-- ============================================================================
-- Core queries for finding labs based on test requirements
-- ============================================================================

-- ============================================================================
-- 1. FIND LABS BY TEST NAME (Basic)
-- ============================================================================

-- Find labs that can perform a specific test
-- Usage: Replace 'Voltage Test' with your test name
SELECT DISTINCT
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
WHERE LOWER(t.test_name) LIKE LOWER('%Voltage Test%')
  AND l.deleted_at IS NULL
ORDER BY l.lab_name, t.test_name
LIMIT 50;

-- ============================================================================
-- 2. FIND LABS BY STANDARD (Basic)
-- ============================================================================

-- Find labs that can perform tests for a specific standard
-- Usage: Replace 'IEC 60068' with your standard
SELECT DISTINCT
    l.lab_id,
    l.lab_name,
    s.standard_code,
    s.full_code,
    s.standard_body,
    COUNT(DISTINCT lc.test_id) AS test_count,
    array_agg(DISTINCT t.test_name) AS available_tests
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN tests t ON t.test_id = lc.test_id
WHERE LOWER(s.standard_code) LIKE LOWER('%IEC 60068%')
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name, s.standard_id, s.standard_code, s.full_code, s.standard_body
ORDER BY test_count DESC, l.lab_name
LIMIT 50;

-- ============================================================================
-- 3. FIND LABS BY DOMAIN (Basic)
-- ============================================================================

-- Find labs with capabilities in a specific domain
-- Usage: Replace 'Electrical' with your domain
SELECT 
    l.lab_id,
    l.lab_name,
    d.domain_name,
    COUNT(DISTINCT lc.test_id) AS test_count,
    COUNT(DISTINCT lc.standard_id) AS standard_count,
    COUNT(*) AS total_capabilities
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE d.domain_name = 'Electrical'  -- Change domain as needed
  AND l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name, d.domain_id, d.domain_name
ORDER BY total_capabilities DESC, l.lab_name
LIMIT 50;

-- ============================================================================
-- 4. MULTI-CRITERIA MATCHING (Advanced)
-- ============================================================================

-- Find labs matching multiple criteria (test + standard + domain)
-- Usage: Customize the WHERE conditions
SELECT DISTINCT
    l.lab_id,
    l.lab_name,
    t.test_name,
    s.standard_code,
    s.full_code,
    d.domain_name,
    -- Calculate match score
    CASE 
        WHEN LOWER(t.test_name) LIKE LOWER('%voltage%') AND 
             LOWER(s.standard_code) LIKE LOWER('%iec%') AND
             d.domain_name = 'Electrical' THEN 10
        WHEN LOWER(t.test_name) LIKE LOWER('%voltage%') OR
             LOWER(s.standard_code) LIKE LOWER('%iec%') THEN 7
        ELSE 5
    END AS match_score
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.deleted_at IS NULL
  AND (
    LOWER(t.test_name) LIKE LOWER('%voltage%')
    OR LOWER(s.standard_code) LIKE LOWER('%iec%')
  )
  AND d.domain_name IN ('Electrical', 'EMC')
ORDER BY match_score DESC, l.lab_name, t.test_name
LIMIT 50;

-- ============================================================================
-- 5. RANKED LAB RECOMMENDATIONS (With Scoring)
-- ============================================================================

-- Find best matching labs with comprehensive scoring
-- Usage: Replace search criteria in WHERE clause
WITH lab_scores AS (
    SELECT 
        l.lab_id,
        l.lab_name,
        COUNT(DISTINCT lc.test_id) AS matching_tests,
        COUNT(DISTINCT lc.standard_id) AS matching_standards,
        COUNT(DISTINCT lc.domain_id) AS matching_domains,
        COUNT(*) AS total_matches,
        -- Domain coverage score
        COUNT(DISTINCT CASE WHEN d.domain_name = 'Electrical' THEN lc.domain_id END) AS electrical_score,
        COUNT(DISTINCT CASE WHEN d.domain_name = 'EMC' THEN lc.domain_id END) AS emc_score,
        COUNT(DISTINCT CASE WHEN d.domain_name = 'Safety' THEN lc.domain_id END) AS safety_score
    FROM labs l
    JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
    JOIN tests t ON t.test_id = lc.test_id
    JOIN standards s ON s.standard_id = lc.standard_id
    JOIN domains d ON d.domain_id = lc.domain_id
    WHERE l.deleted_at IS NULL
      AND (
        -- Test name matching
        LOWER(t.test_name) LIKE LOWER('%voltage%')
        OR LOWER(t.test_name) LIKE LOWER('%current%')
        OR LOWER(t.test_name) LIKE LOWER('%emission%')
      )
      AND (
        -- Standard matching
        LOWER(s.standard_code) LIKE LOWER('%iec%')
        OR LOWER(s.standard_code) LIKE LOWER('%is%')
      )
    GROUP BY l.lab_id, l.lab_name
)
SELECT 
    lab_id,
    lab_name,
    matching_tests,
    matching_standards,
    matching_domains,
    total_matches,
    -- Calculate overall score
    (matching_tests * 3 + matching_standards * 2 + matching_domains * 1 + 
     electrical_score * 2 + emc_score * 1 + safety_score * 1) AS overall_score
FROM lab_scores
WHERE total_matches > 0
ORDER BY overall_score DESC, matching_tests DESC, matching_standards DESC
LIMIT 20;

-- ============================================================================
-- 6. FIND LABS FOR SPECIFIC TEST + STANDARD COMBINATION
-- ============================================================================

-- Find labs that can perform a specific test under a specific standard
-- Usage: Replace test and standard names
SELECT 
    l.lab_id,
    l.lab_name,
    t.test_name,
    s.standard_code,
    s.full_code,
    s.standard_body,
    d.domain_name
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE LOWER(t.test_name) LIKE LOWER('%Conducted Emission%')
  AND LOWER(s.standard_code) LIKE LOWER('%CISPR 14%')
  AND l.deleted_at IS NULL
ORDER BY l.lab_name;

-- ============================================================================
-- 7. FIND LABS WITH MULTIPLE DOMAIN CAPABILITIES
-- ============================================================================

-- Find labs that can perform tests across multiple domains (comprehensive labs)
SELECT 
    l.lab_id,
    l.lab_name,
    COUNT(DISTINCT lc.domain_id) AS domain_count,
    array_agg(DISTINCT d.domain_name ORDER BY d.domain_name) AS domains,
    COUNT(DISTINCT lc.test_id) AS total_tests,
    COUNT(DISTINCT lc.standard_id) AS total_standards,
    COUNT(*) AS total_capabilities
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.deleted_at IS NULL
GROUP BY l.lab_id, l.lab_name
HAVING COUNT(DISTINCT lc.domain_id) >= 3  -- At least 3 domains
ORDER BY domain_count DESC, total_capabilities DESC
LIMIT 30;

-- ============================================================================
-- 8. FIND BEST MATCHING LABS (Fuzzy Matching)
-- ============================================================================

-- Find labs with best match for partial test/standard names
-- Handles variations and partial matches
SELECT DISTINCT
    l.lab_id,
    l.lab_name,
    t.test_name,
    s.standard_code,
    s.full_code,
    d.domain_name,
    -- Calculate similarity score
    CASE 
        WHEN LOWER(t.test_name) = LOWER('Voltage Test') THEN 10
        WHEN LOWER(t.test_name) LIKE LOWER('Voltage Test%') THEN 8
        WHEN LOWER(t.test_name) LIKE LOWER('%Voltage Test%') THEN 6
        WHEN LOWER(t.test_name) LIKE LOWER('%voltage%') THEN 4
        ELSE 2
    END AS test_match_score,
    CASE 
        WHEN LOWER(s.standard_code) = LOWER('IEC 60068') THEN 10
        WHEN LOWER(s.standard_code) LIKE LOWER('IEC 60068%') THEN 8
        WHEN LOWER(s.standard_code) LIKE LOWER('%IEC 60068%') THEN 6
        WHEN LOWER(s.standard_code) LIKE LOWER('%iec%') THEN 3
        ELSE 1
    END AS standard_match_score
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
JOIN standards s ON s.standard_id = lc.standard_id
JOIN domains d ON d.domain_id = lc.domain_id
WHERE l.deleted_at IS NULL
  AND (
    LOWER(t.test_name) LIKE LOWER('%voltage%')
    OR LOWER(s.standard_code) LIKE LOWER('%iec 60068%')
  )
ORDER BY (test_match_score + standard_match_score) DESC, l.lab_name
LIMIT 30;

-- ============================================================================
-- 9. FIND LABS BY TEST FAMILY (If test families are populated)
-- ============================================================================

-- Find labs with capabilities in a test family
-- Note: This requires test_families to be populated
SELECT 
    l.lab_id,
    l.lab_name,
    tf.family_name,
    COUNT(DISTINCT lc.test_id) AS test_count,
    COUNT(DISTINCT lc.standard_id) AS standard_count
FROM labs l
JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
JOIN tests t ON t.test_id = lc.test_id
LEFT JOIN test_families tf ON tf.family_id = t.family_id
WHERE l.deleted_at IS NULL
  AND tf.family_id IS NOT NULL
GROUP BY l.lab_id, l.lab_name, tf.family_id, tf.family_name
ORDER BY test_count DESC, l.lab_name
LIMIT 30;

-- ============================================================================
-- 10. COMPREHENSIVE LAB SEARCH (All Criteria)
-- ============================================================================

-- Most comprehensive search - matches all criteria with scoring
WITH search_criteria AS (
    SELECT 
        'voltage' AS test_keyword,
        'iec' AS standard_keyword,
        'Electrical' AS domain_name
),
lab_matches AS (
    SELECT 
        l.lab_id,
        l.lab_name,
        COUNT(DISTINCT lc.test_id) AS matching_tests,
        COUNT(DISTINCT lc.standard_id) AS matching_standards,
        COUNT(*) AS matching_capabilities,
        array_agg(DISTINCT t.test_name) AS test_names,
        array_agg(DISTINCT s.standard_code) AS standard_codes,
        MAX(d.domain_name) AS primary_domain
    FROM labs l
    JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
    JOIN tests t ON t.test_id = lc.test_id
    JOIN standards s ON s.standard_id = lc.standard_id
    JOIN domains d ON d.domain_id = lc.domain_id
    CROSS JOIN search_criteria sc
    WHERE l.deleted_at IS NULL
      AND LOWER(t.test_name) LIKE LOWER('%' || sc.test_keyword || '%')
      AND LOWER(s.standard_code) LIKE LOWER('%' || sc.standard_keyword || '%')
      AND d.domain_name = sc.domain_name
    GROUP BY l.lab_id, l.lab_name
)
SELECT 
    lab_id,
    lab_name,
    matching_tests,
    matching_standards,
    matching_capabilities,
    primary_domain,
    test_names[1:5] AS sample_tests,  -- First 5 tests
    standard_codes[1:5] AS sample_standards,  -- First 5 standards
    -- Overall relevance score
    (matching_tests * 10 + matching_standards * 5 + matching_capabilities * 2) AS relevance_score
FROM lab_matches
ORDER BY relevance_score DESC, matching_tests DESC, matching_standards DESC
LIMIT 20;

-- ============================================================================
-- END OF RECOMMENDATION QUERIES
-- ============================================================================


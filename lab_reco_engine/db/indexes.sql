-- ============================================================================
-- INDEX STRATEGY FOR LAB RECOMMENDATION ENGINE
-- ============================================================================
-- This index file provides:
-- - Indexes on all foreign keys for join performance
-- - Composite indexes for common query patterns
-- - Recommendation engine query optimization
-- - Analytics and aggregation support
-- - No redundant indexes
-- ============================================================================

-- ============================================================================
-- FOREIGN KEY INDEXES (Critical for JOIN performance)
-- ============================================================================

-- Disciplines -> Domains
CREATE INDEX IF NOT EXISTS idx_disciplines_domain_id
ON disciplines(domain_id);

-- Test Families -> Disciplines
CREATE INDEX IF NOT EXISTS idx_test_families_discipline_id
ON test_families(discipline_id);

-- Tests -> Test Families
CREATE INDEX IF NOT EXISTS idx_tests_family_id
ON tests(family_id);

-- Lab Capabilities -> All Foreign Keys
CREATE INDEX IF NOT EXISTS idx_labcap_lab_id
ON lab_capabilities(lab_id);

CREATE INDEX IF NOT EXISTS idx_labcap_domain_id
ON lab_capabilities(domain_id);

CREATE INDEX IF NOT EXISTS idx_labcap_discipline_id
ON lab_capabilities(discipline_id)
WHERE discipline_id IS NOT NULL;  -- Partial index (nulls are common)

CREATE INDEX IF NOT EXISTS idx_labcap_family_id
ON lab_capabilities(family_id)
WHERE family_id IS NOT NULL;  -- Partial index (nulls are common)

CREATE INDEX IF NOT EXISTS idx_labcap_test_id
ON lab_capabilities(test_id);

CREATE INDEX IF NOT EXISTS idx_labcap_standard_id
ON lab_capabilities(standard_id);

-- Lab Domain Confidence -> Foreign Keys
CREATE INDEX IF NOT EXISTS idx_lab_domain_confidence_lab_id
ON lab_domain_confidence(lab_id);

CREATE INDEX IF NOT EXISTS idx_lab_domain_confidence_domain_id
ON lab_domain_confidence(domain_id);

-- ============================================================================
-- UNIQUE INDEXES (Case-insensitive uniqueness)
-- ============================================================================

-- Domains: Case-insensitive unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uq_domains_name_lower
ON domains(LOWER(domain_name));

-- Disciplines: Composite unique (domain + discipline name, case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_disciplines_domain_name
ON disciplines(domain_id, LOWER(discipline_name));

-- Test Families: Composite unique (discipline + family name, case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_test_families_discipline_name
ON test_families(discipline_id, LOWER(family_name));

-- Tests: Composite unique (family + test name, case-insensitive, handles NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_tests_family_name
ON tests(COALESCE(family_id, -1), LOWER(test_name));

-- Standards: Case-insensitive unique on full_code
CREATE UNIQUE INDEX IF NOT EXISTS uq_standards_full_code_lower
ON standards(LOWER(full_code));

-- Labs: Case-insensitive unique on lab_name
CREATE UNIQUE INDEX IF NOT EXISTS uq_labs_name_lower
ON labs(LOWER(lab_name));

-- ============================================================================
-- TEXT SEARCH INDEXES (Case-insensitive lookups)
-- ============================================================================

-- Labs: Name lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_labs_name_lower
ON labs(LOWER(lab_name));

-- Tests: Name lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_tests_name_lower
ON tests(LOWER(test_name));

-- Standards: Code and full_code lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_standards_code_lower
ON standards(LOWER(standard_code));

CREATE INDEX IF NOT EXISTS idx_standards_full_code_lower
ON standards(LOWER(full_code));

-- Domains: Name lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_domains_name_lower
ON domains(LOWER(domain_name));

-- Disciplines: Name lookup (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_disciplines_name_lower
ON disciplines(LOWER(discipline_name));

-- ============================================================================
-- COMPOSITE INDEXES FOR RECOMMENDATION QUERIES
-- ============================================================================

-- Pattern 1: Find labs by test + standard (most common recommendation query)
CREATE INDEX IF NOT EXISTS idx_labcap_test_standard
ON lab_capabilities(test_id, standard_id)
INCLUDE (lab_id, domain_id);  -- Covering index for faster queries

-- Pattern 2: Find labs by domain + test
CREATE INDEX IF NOT EXISTS idx_labcap_domain_test
ON lab_capabilities(domain_id, test_id)
INCLUDE (lab_id, standard_id);

-- Pattern 3: Find all capabilities for a lab (lab profile)
CREATE INDEX IF NOT EXISTS idx_labcap_lab_domain
ON lab_capabilities(lab_id, domain_id)
INCLUDE (test_id, standard_id);

-- Pattern 4: Find labs by standard (less common but needed)
CREATE INDEX IF NOT EXISTS idx_labcap_standard_test
ON lab_capabilities(standard_id, test_id)
INCLUDE (lab_id, domain_id);

-- ============================================================================
-- ANALYTICS & AGGREGATION INDEXES
-- ============================================================================

-- Lab capabilities count by domain (for analytics)
CREATE INDEX IF NOT EXISTS idx_labcap_domain_lab
ON lab_capabilities(domain_id, lab_id);

-- Test frequency analysis
CREATE INDEX IF NOT EXISTS idx_labcap_test_domain
ON lab_capabilities(test_id, domain_id);

-- Standard usage analysis
CREATE INDEX IF NOT EXISTS idx_labcap_standard_domain
ON lab_capabilities(standard_id, domain_id);

-- ============================================================================
-- SOFT DELETE SUPPORT
-- ============================================================================

-- Index for active labs only (excludes soft-deleted)
CREATE INDEX IF NOT EXISTS idx_labs_active
ON labs(lab_id)
WHERE deleted_at IS NULL;

-- Note: Index with subquery for active labs in lab_capabilities is not supported
-- Use a view or filter in queries instead:
-- CREATE VIEW lab_capabilities_active AS
-- SELECT lc.* FROM lab_capabilities lc
-- JOIN labs l ON l.lab_id = lc.lab_id
-- WHERE l.deleted_at IS NULL;

-- ============================================================================
-- FULL TEXT SEARCH (Optional but recommended for search features)
-- ============================================================================

-- GIN indexes for full-text search on test names and standards
-- Uncomment if you need advanced text search capabilities

-- CREATE INDEX IF NOT EXISTS idx_tests_name_gin
-- ON tests USING gin(to_tsvector('english', test_name));

-- CREATE INDEX IF NOT EXISTS idx_standards_full_code_gin
-- ON standards USING gin(to_tsvector('english', full_code));

-- CREATE INDEX IF NOT EXISTS idx_labs_name_gin
-- ON labs USING gin(to_tsvector('english', lab_name));

-- ============================================================================
-- UNIQUE INDEXES NOTE
-- ============================================================================

-- Unique indexes are created above in the "UNIQUE INDEXES" section.
-- These enforce case-insensitive uniqueness constraints that cannot be
-- defined directly in table constraints (PostgreSQL limitation).

-- ============================================================================
-- MAINTENANCE INDEXES (For data quality checks)
-- ============================================================================

-- Index for finding orphaned test families (no tests)
-- Useful for cleanup queries
CREATE INDEX IF NOT EXISTS idx_tests_family_id_not_null
ON tests(family_id)
WHERE family_id IS NOT NULL;

-- Index for finding tests without families
CREATE INDEX IF NOT EXISTS idx_tests_no_family
ON tests(test_id)
WHERE family_id IS NULL;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Use these queries to monitor index usage:
-- 
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan ASC;
--
-- This helps identify unused indexes that can be dropped.


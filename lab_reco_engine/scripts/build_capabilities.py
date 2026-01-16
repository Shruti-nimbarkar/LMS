def get_db_connection():
    """Get database connection with shared credentials."""
    import psycopg2
    return psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="2003",
        host="localhost",
        port=5432
    )


def run_cleanup():
    """Run cleanup SQL to fix NULL standard_code issues."""
    print("Running database cleanup (fixing NULL standard_code)")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # STEP 1: Create UNSPECIFIED standard if it doesn't exist
        print("  Step 1: Creating UNSPECIFIED standard...")
        # Check if it exists first (case-insensitive)
        cur.execute("""
            SELECT standard_id FROM standards 
            WHERE LOWER(full_code) = LOWER('UNSPECIFIED')
            LIMIT 1
        """)
        existing = cur.fetchone()
        if not existing:
            cur.execute("""
                INSERT INTO standards (
                    standard_body,
                    standard_code,
                    full_code,
                    year
                )
                VALUES (
                    'GENERIC',
                    'UNSPECIFIED',
                    'UNSPECIFIED',
                    NULL
                )
            """)
        
        # STEP 2: Handle NULL-code standards
        # Get UNSPECIFIED standard_id
        cur.execute("SELECT standard_id FROM standards WHERE standard_code = 'UNSPECIFIED'")
        unspecified_id = cur.fetchone()[0]
        
        # Step 2a: Delete capabilities that would create duplicates after reassignment
        print("  Step 2a: Removing duplicate capabilities that would conflict...")
        cur.execute("""
            DELETE FROM lab_capabilities lc1
            WHERE EXISTS (
                SELECT 1
                FROM lab_capabilities lc2
                JOIN standards s1 ON s1.standard_id = lc1.standard_id
                WHERE s1.standard_code IS NULL
                AND lc2.standard_id = %s
                AND lc1.lab_id = lc2.lab_id
                AND lc1.test_id = lc2.test_id
                AND lc1.standard_id != lc2.standard_id
            )
        """, (unspecified_id,))
        deleted_duplicates = cur.rowcount
        print(f"    Deleted {deleted_duplicates} duplicate capabilities")
        
        # Step 2b: For remaining NULL standards, delete duplicates (keep only one per lab+test)
        print("  Step 2b: Removing duplicate NULL standards (keeping one per lab+test)...")
        cur.execute("""
            DELETE FROM lab_capabilities lc1
            WHERE lc1.standard_id IN (
                SELECT s.standard_id FROM standards s WHERE s.standard_code IS NULL
            )
            AND lc1.ctid NOT IN (
                SELECT MIN(lc2.ctid)
                FROM lab_capabilities lc2
                JOIN standards s ON s.standard_id = lc2.standard_id
                WHERE s.standard_code IS NULL
                GROUP BY lc2.lab_id, lc2.test_id
            )
        """)
        deleted_null_duplicates = cur.rowcount
        print(f"    Deleted {deleted_null_duplicates} duplicate NULL standard entries")
        
        # Step 2c: Now reassign remaining NULL standards to UNSPECIFIED
        print("  Step 2c: Reassigning NULL standard_code to UNSPECIFIED...")
        cur.execute("""
            UPDATE lab_capabilities lc
            SET standard_id = %s
            FROM standards s
            WHERE lc.standard_id = s.standard_id
            AND s.standard_code IS NULL
        """, (unspecified_id,))
        reassigned = cur.rowcount
        print(f"    Reassigned {reassigned} capabilities")
        
        # STEP 3: DELETE ALL NULL-CODE STANDARDS (after reassignment)
        print("  Step 3: Deleting NULL standard_code rows...")
        cur.execute("""
            DELETE FROM standards
            WHERE standard_code IS NULL
        """)
        deleted = cur.rowcount
        print(f"    Deleted {deleted} NULL standard rows")
        
        conn.commit()
        print("[OK] Cleanup completed successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Cleanup failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()


def run_validation():
    """Run validation queries to verify data integrity."""
    print("Running validation checks")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 4a. Check for NULL standard_code in standards table
        cur.execute("SELECT COUNT(*) FROM standards WHERE standard_code IS NULL")
        null_standards = cur.fetchone()[0]
        print(f"  NULL standard_code in standards table: {null_standards} (expected: 0)")
        
        # 4b. Check for capabilities pointing to NULL standard_code
        cur.execute("""
            SELECT COUNT(*) 
            FROM lab_capabilities lc 
            JOIN standards s ON s.standard_id = lc.standard_id 
            WHERE s.standard_code IS NULL
        """)
        null_capabilities = cur.fetchone()[0]
        print(f"  Capabilities with NULL standard_code: {null_capabilities} (expected: 0)")
        
        # 4c. Check for ACTUAL duplicates (same lab has same test+standard twice)
        cur.execute("""
            SELECT 
                l.lab_name,
                t.test_name,
                s.standard_code,
                COUNT(*) AS duplicate_count
            FROM lab_capabilities lc
            JOIN labs l ON l.lab_id = lc.lab_id
            JOIN tests t ON t.test_id = lc.test_id
            JOIN standards s ON s.standard_id = lc.standard_id
            GROUP BY l.lab_id, l.lab_name, t.test_id, t.test_name, s.standard_id, s.standard_code
            HAVING COUNT(*) > 1
            LIMIT 10
        """)
        actual_duplicates = cur.fetchall()
        print(f"  Actual duplicates (same lab, same test+standard): {len(actual_duplicates)} (expected: 0)")
        if actual_duplicates:
            print("    Sample duplicates:")
            for dup in actual_duplicates[:5]:
                print(f"      - {dup[0]}: {dup[1]} + {dup[2]} (count: {dup[3]})")
        
        # 4d. Comprehensive NULL check
        cur.execute("""
            SELECT 
                COUNT(DISTINCT s.standard_id) AS null_standard_count,
                COUNT(*) AS affected_capabilities
            FROM standards s
            LEFT JOIN lab_capabilities lc ON lc.standard_id = s.standard_id
            WHERE s.standard_code IS NULL
        """)
        null_stats = cur.fetchone()
        print(f"  NULL standards: {null_stats[0]}, Affected capabilities: {null_stats[1]} (expected: 0, 0)")
        
        # Summary
        all_clean = (null_standards == 0 and null_capabilities == 0 and len(actual_duplicates) == 0)
        if all_clean:
            print("[OK] All validation checks passed!")
        else:
            print("[WARNING] Some validation checks failed - review output above")
            
    except Exception as e:
        print(f"[ERROR] Validation failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()


def run_capabilities():
    print("Running capability building stage")

    import pandas as pd
    from pathlib import Path

    from .domain_inference import infer_domain
    from .entity_resolution import get_or_create, get_or_create_standard

    conn = get_db_connection()
    cur = conn.cursor()

    cleaned_dir = Path("data/cleaned")

    for file in cleaned_dir.glob("*.csv"):
        print(f"Processing: {file.name}")
        df = pd.read_csv(file)

        REQUIRED = {"test_name", "test_standard", "lab_name"}
        if not REQUIRED.issubset(df.columns):
            print(f"[ERROR] Missing columns in {file.name}, skipping")
            continue

        lab_name = df["lab_name"].iloc[0].strip()
        lab_id = get_or_create(cur, "labs", "lab_name", lab_name)

        inserted = 0

        for _, row in df.iterrows():
            test = str(row["test_name"]).strip()
            standard = str(row["test_standard"]).strip()

            if not test or test.lower() == "nan":
                continue
            if not standard or standard.lower() == "nan":
                continue

            domain, confidence = infer_domain(test, standard)

            domain_id = get_or_create(cur, "domains", "domain_name", domain)
            test_id = get_or_create(cur, "tests", "test_name", test)
            standard_id = get_or_create_standard(cur, standard)

            # FINAL SAFE INSERT
            # Note: discipline_id and family_id are optional, will be NULL initially
            cur.execute(
                """
                INSERT INTO lab_capabilities
                (lab_id, domain_id, discipline_id, family_id, test_id, standard_id)
                VALUES (%s, %s, NULL, NULL, %s, %s)
                ON CONFLICT (lab_id, test_id, standard_id)
                DO NOTHING
                """,
                (lab_id, domain_id, test_id, standard_id)
            )

            inserted += 1

        conn.commit()
        print(f"[OK] {inserted} rows processed for {lab_name}")

    cur.close()
    conn.close()
    print("[OK] Capability build completed")

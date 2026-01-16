from scripts.profile_labs import run_profile_labs
from scripts.normalize_rows import run_normalization
from scripts.build_capabilities import run_capabilities, run_cleanup, run_validation


def main():
    print("Pipeline started")
    
    # Check if database has existing data
    from scripts.build_capabilities import get_db_connection
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM standards")
    has_data = cur.fetchone()[0] > 0
    cur.close()
    conn.close()
    
    # Run cleanup only if there's existing data
    if has_data:
    print("\n" + "="*60)
    print("PHASE 1: Database Cleanup")
    print("="*60)
    run_cleanup()
    
    # Run validation to verify cleanup
    print("\n" + "="*60)
    print("PHASE 2: Validation")
    print("="*60)
    run_validation()
    else:
        print("\n" + "="*60)
        print("PHASE 1: Fresh Database - Skipping Cleanup")
        print("="*60)
        print("No existing data found. Starting fresh ingestion...")
    
    # Run normal pipeline
    print("\n" + "="*60)
    print("PHASE 3: Data Pipeline")
    print("="*60)
    run_profile_labs()
    run_normalization()
    run_capabilities()
    
    # Final validation
    print("\n" + "="*60)
    print("PHASE 4: Final Validation")
    print("="*60)
    run_validation()
    
    print("\nPipeline completed successfully")


if __name__ == "__main__":
    main()

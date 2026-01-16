"""
Main pipeline runner for Lab Recommendation Engine
Runs:
1. Lab profiling
2. Data normalization
3. Capability building
"""

from scripts.profile_labs import run_profile_labs
from scripts.normalize_rows import run_normalization
from scripts.build_capabilities import run_capabilities


def main():
    print("🚀 Pipeline started")

    print("▶ Step 1: Profiling labs")
    run_profile_labs()

    print("▶ Step 2: Normalizing raw data")
    run_normalization()

    print("▶ Step 3: Building lab capabilities")
    run_capabilities()

    print("✅ Pipeline completed successfully")


if __name__ == "__main__":
    main()

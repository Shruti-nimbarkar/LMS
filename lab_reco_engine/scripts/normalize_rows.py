import pandas as pd
from pathlib import Path

# -------------------------------------------------
# COLUMN ALIAS MAP (CANONICALIZATION)
# -------------------------------------------------
COLUMN_ALIASES = {
    "s_no": [
        "s.no", "s_no", "sr_no", "sl_no", "serial_no"
    ],

    "discipline_group": [
        "discipline / group",
        "discipline_group",
        "discipline",
        "group",
        "facility",
        "testing facility"
    ],

    "materials_products_tested": [
        "materials or products tested",
        "materials tested",
        "products tested",
        "material / product",
        "materials_products_tested"
    ],

    "test_name": [
        "component, parameter or characteristic tested / specific test performed / tests or type of testsperformed",
        "component parameter or characteristic tested",
        "specific test performed",
        "tests or type of testsperformed",
        "test performed",
        "type of test",
        "test name"
    ],

    "test_standard": [
        "test method specification against which tests areperformed and / or thetechniques / equipmentused",
        "test method specification",
        "test standard",
        "standard",
        "specification",
        "test method"
    ]
}


# -------------------------------------------------
# NORMALIZE HEADERS USING THE MAP
# -------------------------------------------------
def normalize_columns(df):
    """Normalize column names to canonical schema using alias map."""
    new_columns = {}

    for col in df.columns:
        col_clean = (
            str(col)
            .strip()
            .lower()
            .replace("/", " ")
            .replace("-", " ")
            .replace("&", "and")
        )

        matched = False

        for canonical, variants in COLUMN_ALIASES.items():
            for v in variants:
                if v in col_clean:
                    new_columns[col] = canonical
                    matched = True
                    break
            if matched:
                break

        if not matched:
            new_columns[col] = col_clean.replace(" ", "_")

    return df.rename(columns=new_columns)


def run_normalization():
    print("Running normalization stage")

    RAW_DIR = Path("data/raw_csvs")
    OUTPUT_DIR = Path("data/cleaned")
    OUTPUT_DIR.mkdir(exist_ok=True)

    for file in RAW_DIR.glob("*.csv"):
        print("READING:", file.name)

        # 1️⃣ Read WITHOUT headers
        df = pd.read_csv(file, header=None)

        # 2️⃣ Use row 1 as header
        df.columns = df.iloc[1]

        # 3️⃣ Drop first two rows (junk + header row)
        df = df.iloc[2:].reset_index(drop=True)

        # 4️⃣ Normalize column names to canonical schema
        df = normalize_columns(df)

        # 5️⃣ Add lab_name
        df["lab_name"] = file.stem

        # 6️⃣ Write CLEAN CSV (with REAL headers)
        output_file = OUTPUT_DIR / file.name
        df.to_csv(output_file, index=False, header=True, encoding="utf-8")

        print("[OK] Written cleaned file:", output_file.name)

    print("[OK] Normalization completed")

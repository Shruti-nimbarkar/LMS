def run_profile_labs():
    print("Running lab profiling stage")

    import pandas as pd
    from pathlib import Path

    folder = Path("data/raw_csvs")
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    logs = []

    for file in folder.iterdir():
        if file.suffix.lower() != ".csv":
            continue

        try:
            df = pd.read_csv(file)
            logs.append({
                "file": file.name,
                "rows": len(df),
                "columns": list(df.columns)
            })
        except Exception as e:
            logs.append({
                "file": file.name,
                "rows": 0,
                "columns": [],
                "error": str(e)
            })

    pd.DataFrame(logs).to_csv(logs_dir / "lab_profile.csv", index=False)
    print("[OK] Lab profiling completed")

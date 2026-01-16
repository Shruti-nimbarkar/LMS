import re


def parse_standard(full_code):
    """
    Parse standard string to extract body, code, and year.
    Returns: (standard_body, standard_code, year, full_code)
    """
    if not full_code or str(full_code).strip().lower() in ['nan', 'none', '']:
        return ('GENERIC', 'UNSPECIFIED', None, 'UNSPECIFIED')
    
    full_code = str(full_code).strip()
    
    # Patterns to match standard codes (IEC, IS, ISO, CISPR)
    patterns = [
        (r'(IEC)\s*(\d+[-\s]?\d*[-\s]?\d*[-\s]?\d*)', 'IEC'),
        (r'(IS)\s*(\d+[-\s]?\d*[-\s]?\d*[-\s]?\d*)', 'IS'),
        (r'(ISO)\s*(\d+[-\s]?\d*[-\s]?\d*[-\s]?\d*)', 'ISO'),
        (r'(CISPR)[-\s]?(\d+[-\s]?\d*[-\s]?\d*[-\s]?\d*)', 'CISPR'),
    ]
    
    standard_upper = full_code.upper()
    
    for pattern, body in patterns:
        match = re.search(pattern, standard_upper)
        if match:
            code = re.sub(r'\s+', '-', match.group(2).strip())
            standard_code = f"{body} {code}".strip()
            
            # Try to extract year (4-digit number at end)
            year_match = re.search(r'(\d{4})', full_code)
            year = year_match.group(1) if year_match else None
            
            return (body, standard_code, year, full_code)
    
    # If no pattern matches, use full_code as standard_code
    # Normalize spaces and special chars
    standard_code = re.sub(r'\s+', ' ', full_code).strip()
    if len(standard_code) > 100:  # Truncate if too long
        standard_code = standard_code[:100]
    
    # Try to extract body from common prefixes
    body = 'GENERIC'
    if standard_code.upper().startswith(('IEC', 'IS ', 'ISO', 'CISPR')):
        parts = standard_code.split()
        if parts:
            body = parts[0]
    
    # Extract year
    year_match = re.search(r'(\d{4})', full_code)
    year = year_match.group(1) if year_match else None
    
    return (body, standard_code, year, full_code)


def get_or_create(cur, table, column, value):
    """
    Safe UPSERT helper.
    Works with case-insensitive unique indexes.
    Uses LOWER() for case-insensitive lookups.
    """
    id_col = f"{table[:-1]}_id"

    # Map tables/columns that use case-insensitive unique indexes
    case_insensitive_tables = {
        ('domains', 'domain_name'),
        ('labs', 'lab_name'),
        ('tests', 'test_name'),  # Note: tests uses composite with family_id
    }
    
    # Check if this table uses case-insensitive uniqueness
    if (table, column) in case_insensitive_tables:
        # First, try to find existing record (case-insensitive)
        cur.execute(
            f"SELECT {id_col} FROM {table} WHERE LOWER({column}) = LOWER(%s) LIMIT 1",
            (value,)
        )
        existing = cur.fetchone()
        if existing:
            return existing[0]
        
        # Not found, insert new record
        # For tests, family_id will be NULL initially (handled by COALESCE in unique constraint)
        if table == 'tests':
            cur.execute(
                f"""
                INSERT INTO {table} ({column}, family_id)
                VALUES (%s, NULL)
                ON CONFLICT DO NOTHING
                RETURNING {id_col}
                """,
                (value,)
            )
            result = cur.fetchone()
            if result:
                return result[0]
            # If conflict occurred, fetch the existing one
            cur.execute(
                f"SELECT {id_col} FROM {table} WHERE LOWER({column}) = LOWER(%s) AND family_id IS NULL LIMIT 1",
                (value,)
            )
            return cur.fetchone()[0]
        else:
            # For domains and labs, insert (we already checked it doesn't exist)
            # The unique index will prevent duplicates
            try:
                cur.execute(
                    f"""
                    INSERT INTO {table} ({column})
                    VALUES (%s)
                    RETURNING {id_col}
                    """,
                    (value,)
                )
                return cur.fetchone()[0]
            except Exception:
                # If somehow a duplicate was inserted (race condition), fetch existing
                cur.execute(
                    f"SELECT {id_col} FROM {table} WHERE LOWER({column}) = LOWER(%s) LIMIT 1",
                    (value,)
                )
                return cur.fetchone()[0]
    else:
        # Standard unique constraint (for other tables)
        cur.execute(
            f"""
            INSERT INTO {table} ({column})
            VALUES (%s)
            ON CONFLICT ({column})
            DO UPDATE SET {column} = EXCLUDED.{column}
            RETURNING {id_col}
            """,
            (value,)
        )
        return cur.fetchone()[0]


def get_or_create_standard(cur, full_code):
    """
    Safe UPSERT for standards table.
    Properly populates standard_body, standard_code, year, and full_code.
    Always updates standard_code even if it exists (fixes NULL values).
    Uses case-insensitive unique index (checks with LOWER() first).
    """
    standard_body, standard_code, year, full_code_clean = parse_standard(full_code)
    
    # First check if exists (case-insensitive)
    cur.execute(
        """
        SELECT standard_id, standard_body, standard_code, year
        FROM standards 
        WHERE LOWER(full_code) = LOWER(%s)
        LIMIT 1
        """,
        (full_code_clean,)
    )
    existing = cur.fetchone()
    
    if existing:
        # Update if needed (especially if standard_code was NULL)
        standard_id, existing_body, existing_code, existing_year = existing
        if existing_code != standard_code or existing_body != standard_body:
            cur.execute(
                """
                UPDATE standards 
                SET standard_body = %s,
                    standard_code = %s,
                    year = COALESCE(standards.year, %s)
                WHERE standard_id = %s
                RETURNING standard_id
                """,
                (standard_body, standard_code, year, standard_id)
            )
        return standard_id
    else:
        # Insert new
        cur.execute(
            """
            INSERT INTO standards (standard_body, standard_code, year, full_code)
            VALUES (%s, %s, %s, %s)
            RETURNING standard_id
            """,
            (standard_body, standard_code, year, full_code_clean)
        )
        return cur.fetchone()[0]

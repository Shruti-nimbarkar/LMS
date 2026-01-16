import yaml
import re
from pathlib import Path

rules = yaml.safe_load(open(Path(__file__).parent.parent / "config" / "domain_rules.yaml"))

# Comprehensive standard-to-domain mapping (based on analysis)
STANDARD_DOMAIN_MAP = {
    # Safety standards (most common in Unknown records)
    'iec 60335': 'Safety',  # Household appliances safety
    'iec 62368': 'Safety',  # Audio/video equipment safety
    'iec 60601': 'Safety',  # Medical equipment safety
    'iec 60598': 'Safety',  # Luminaires safety
    'iec 60950': 'Safety',  # IT equipment safety
    'iec 60065': 'Safety',  # Audio/video equipment safety
    'iec 61010': 'Safety',  # Measurement equipment safety
    'iec 62133': 'Safety',  # Battery safety
    'iec 61215': 'Safety',  # PV module safety
    'iec 62040': 'Safety',  # UPS safety
    'iec 62109': 'Safety',  # Power converters safety
    'iso 80601': 'Safety',  # Medical equipment safety
    'iso 8124': 'Safety',   # Toy safety
    'is 13252': 'Safety',   # IT equipment safety
    'is 10322': 'Safety',   # Luminaires safety
    'is 616': 'Safety',     # Household appliances
    'is 9873': 'Safety',    # Audio/video equipment
    'is 16444': 'Safety',   # Medical equipment
    'is 7098': 'Safety',    # Measurement equipment
    'is 16102': 'Safety',   # Battery safety
    'is 13450': 'Safety',   # UPS safety
    'is 16046': 'Safety',   # Power converters
    'is 15298': 'Safety',   # PV modules
    'is 8811': 'Safety',    # Household appliances
    'is 1554': 'Safety',    # Cables safety
    'is 15885': 'Safety',   # Medical equipment
    
    # Electrical standards
    'iec 60068': 'Environmental',  # Environmental testing (also used for electrical)
    'iec 60529': 'Environmental',  # IP protection
    'iec 60947': 'Electrical',     # Low-voltage switchgear
    'iec 62271': 'Electrical',     # High-voltage switchgear
    'is 302': 'Safety',            # Electrical safety
    
    # EMC standards
    'iec 61000': 'EMC',            # EMC testing
    'cispr': 'EMC',                # EMC emissions
    'is 14700': 'EMC',             # EMC testing
    
    # High Voltage
    'iec 60060': 'High_Voltage',   # High-voltage testing
    'iec 60137': 'High_Voltage',   # Bushings
    'iec 60168': 'High_Voltage',   # Outdoor bushings
    
    # Chemical
    'iec 62321': 'Chemical',       # RoHS testing
    
    # Environmental (IEC 60068 is already mapped above)
}

# Extended keyword patterns for each domain
DOMAIN_KEYWORDS = {
    'Safety': ['safety', 'leakage', 'earthing', 'fire', 'flame', 'glow', 'wire', 'touch', 'creepage', 'clearance', 'marking', 'terminals', 'wiring', 'connections', 'parts', 'supply'],
    'Electrical': ['voltage', 'current', 'resistance', 'insulation', 'dielectric', 'power', 'electric', 'electrical', 'conductor', 'cable', 'wire'],
    'EMC': ['emc', 'emi', 'emission', 'immunity', 'esd', 'surge', 'conducted', 'radiated', 'electromagnetic', 'disturbance'],
    'Environmental': ['temperature', 'humidity', 'salt', 'spray', 'ip', 'protection', 'damp', 'heat', 'cold', 'water', 'moisture', 'environmental'],
    'High_Voltage': ['high voltage', 'hv', 'impulse', 'lightning', 'partial discharge', 'pd test', 'breakdown', 'withstand'],
    'Mechanical': ['mechanical', 'endurance', 'operation', 'tensile', 'compression', 'bend', 'flexibility', 'elongation', 'dimension', 'thickness', 'diameter', 'length', 'mass'],
    'Thermal': ['thermal', 'temperature', 'heat', 'cold', 'rise', 'ageing', 'aging', 'cycle'],
    'Chemical': ['rohs', 'cadmium', 'lead', 'mercury', 'hazardous', 'chemical', 'halogen', 'content']
}

def infer_domain(test_name, standard):
    """
    Aggressive domain inference - classifies based on standards first, then keywords.
    Goal: Classify ALL records, not leave any Unknown.
    """
    if not test_name or not standard:
        return "Unknown", 0.0
    
    # Normalize text for matching
    test_lower = str(test_name).lower().strip()
    standard_lower = str(standard).lower().strip()
    combined_text = f"{test_lower} {standard_lower}"
    
    # STEP 1: Standard-based classification (most reliable)
    # Extract base standard pattern (e.g., "IEC 60335" from "IEC 60335-1:2010")
    std_match = re.search(r'([a-z]+)\s*(\d+)', standard_lower)
    if std_match:
        std_base = f"{std_match.group(1)} {std_match.group(2)}"
        if std_base in STANDARD_DOMAIN_MAP:
            domain = STANDARD_DOMAIN_MAP[std_base]
            return domain, 0.9  # High confidence for standard-based match
    
    # Also check full standard code
    for std_pattern, domain in STANDARD_DOMAIN_MAP.items():
        if std_pattern in standard_lower:
            return domain, 0.85
    
    # STEP 2: Keyword-based classification (from rules + extended patterns)
    domain_scores = {}
    
    for domain, rule in rules.items():
        score = 0.0
        confidence = rule.get("confidence", 0.85)
        
        # Check standard patterns from rules
        standards = rule.get("standards", [])
        for std in standards:
            std_lower = std.lower().strip()
            if std_lower in standard_lower or standard_lower in std_lower:
                score += 0.6
                break
            # Partial match
            std_match = re.search(r'([a-z]+)\s*(\d+)', std_lower)
            if std_match:
                std_base = f"{std_match.group(1)} {std_match.group(2)}"
                if std_base in standard_lower:
                    score += 0.5
                    break
        
        # Check keywords from rules
        keywords = rule.get("keywords", [])
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, combined_text):
                score += 0.3
                break
        
        # Check extended domain keywords
        if domain in DOMAIN_KEYWORDS:
            for keyword in DOMAIN_KEYWORDS[domain]:
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, combined_text):
                    score += 0.25
                    break
        
        if score > 0:
            domain_scores[domain] = score * confidence
    
    # STEP 3: Additional pattern matching for common cases
    # Safety indicators (very common in Unknown records)
    if re.search(r'\b(creepage|clearance|marking|terminals|wiring|connections|leakage|earthing)\b', combined_text):
        domain_scores['Safety'] = domain_scores.get('Safety', 0) + 0.4
    
    # Electrical indicators
    if re.search(r'\b(voltage|current|resistance|insulation|dielectric|power)\b', combined_text):
        domain_scores['Electrical'] = domain_scores.get('Electrical', 0) + 0.3
    
    # Environmental indicators
    if re.search(r'\b(temperature|humidity|ip\d+|damp|heat|cold|water)\b', combined_text):
        domain_scores['Environmental'] = domain_scores.get('Environmental', 0) + 0.3
    
    # Mechanical indicators
    if re.search(r'\b(dimension|thickness|diameter|length|mass|tensile|elongation)\b', combined_text):
        domain_scores['Mechanical'] = domain_scores.get('Mechanical', 0) + 0.3
    
    # Return domain with highest score
    if domain_scores:
        best_domain = max(domain_scores, key=domain_scores.get)
        best_score = domain_scores[best_domain]
        # Very low threshold - classify almost everything
        if best_score >= 0.1:  # Lowered from 0.15
            return best_domain, min(best_score, 1.0)
    
    # STEP 4: Aggressive fallback - classify based on standard body and keywords
    # Check for any standard body indicator
    has_standard_body = any(body in standard_lower for body in ['iec', 'is ', 'iso', 'en ', 'bs ', 'ansi', 'astm', 'ul', 'csa'])
    
    if has_standard_body:
        # Strong keyword-based classification
        if any(kw in combined_text for kw in ['safety', 'leakage', 'earthing', 'fire', 'flame', 'glow', 'touch', 'creepage', 'clearance']):
            return 'Safety', 0.7
        elif any(kw in combined_text for kw in ['voltage', 'current', 'power', 'electrical', 'insulation', 'dielectric', 'resistance']):
            return 'Electrical', 0.7
        elif any(kw in combined_text for kw in ['emc', 'emi', 'emission', 'immunity', 'esd', 'conducted', 'radiated']):
            return 'EMC', 0.7
        elif any(kw in combined_text for kw in ['temperature', 'humidity', 'ip', 'damp', 'heat', 'cold', 'water', 'moisture', 'environmental']):
            return 'Environmental', 0.7
        elif any(kw in combined_text for kw in ['mechanical', 'tensile', 'elongation', 'compression', 'bend', 'flexibility', 'dimension', 'thickness']):
            return 'Mechanical', 0.7
        elif any(kw in combined_text for kw in ['thermal', 'heat', 'ageing', 'aging', 'rise']):
            return 'Thermal', 0.7
        elif any(kw in combined_text for kw in ['high voltage', 'hv', 'impulse', 'lightning', 'partial discharge']):
            return 'High_Voltage', 0.7
        elif any(kw in combined_text for kw in ['rohs', 'cadmium', 'lead', 'mercury', 'chemical', 'halogen']):
            return 'Chemical', 0.7
        else:
            # Default classification based on standard body patterns
            if 'iec 6' in standard_lower or 'is 1' in standard_lower or 'is 6' in standard_lower:
                # Most IEC 6xxx and IS 1xxx/6xxx are Safety standards
                return 'Safety', 0.6
            elif 'iec 6' in standard_lower[:10] or 'is 3' in standard_lower[:10]:
                # IEC 6xxx can also be Electrical
                return 'Electrical', 0.6
            else:
                # Last resort: default to Safety (most common category)
                return 'Safety', 0.5
    
    # STEP 5: Final fallback - keyword-only classification (no standard body)
    # Even without standard, try to classify based on test name keywords
    if any(kw in combined_text for kw in ['safety', 'leakage', 'earthing', 'fire', 'flame']):
        return 'Safety', 0.5
    elif any(kw in combined_text for kw in ['voltage', 'current', 'power', 'electrical']):
        return 'Electrical', 0.5
    elif any(kw in combined_text for kw in ['emc', 'emi', 'emission']):
        return 'EMC', 0.5
    elif any(kw in combined_text for kw in ['temperature', 'humidity', 'environmental']):
        return 'Environmental', 0.5
    elif any(kw in combined_text for kw in ['mechanical', 'tensile', 'elongation']):
        return 'Mechanical', 0.5
    
    # Absolute last resort: if we have ANY text, classify as Safety (most common)
    if test_name and standard:
        return 'Safety', 0.4
    
    return "Unknown", 0.0

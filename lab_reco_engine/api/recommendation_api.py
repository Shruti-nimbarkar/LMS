"""
REST API for Lab Recommendation Engine
Provides endpoints for finding labs based on test requirements
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

app = Flask(__name__)
CORS(app)  # Enable CORS for web interface

# Database configuration
DB_CONFIG = {
    'dbname': 'lab_reco_engine',
    'user': 'postgres',
    'password': '2003',
    'host': 'localhost',
    'port': 5432
}

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(**DB_CONFIG)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM labs WHERE deleted_at IS NULL")
        lab_count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'active_labs': lab_count
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/labs/search', methods=['GET'])
def search_labs():
    """
    Search for labs by test name, standard, or domain.
    
    Query Parameters:
    - test_name: Test name to search for (optional)
    - standard: Standard code to search for (optional)
    - domain: Domain name (optional)
    - limit: Maximum results (default: 50)
    """
    try:
        test_name = request.args.get('test_name', '').strip()
        standard = request.args.get('standard', '').strip()
        domain = request.args.get('domain', '').strip()
        limit = int(request.args.get('limit', 50))
        
        if not any([test_name, standard, domain]):
            return jsonify({
                'error': 'At least one search parameter (test_name, standard, or domain) is required'
            }), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build dynamic query
        conditions = ["l.deleted_at IS NULL"]
        params = []
        
        if test_name:
            conditions.append("LOWER(t.test_name) LIKE LOWER(%s)")
            params.append(f'%{test_name}%')
        
        if standard:
            conditions.append("LOWER(s.standard_code) LIKE LOWER(%s)")
            params.append(f'%{standard}%')
        
        if domain:
            conditions.append("d.domain_name = %s")
            params.append(domain)
        
        query = f"""
            SELECT DISTINCT
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
            WHERE {' AND '.join(conditions)}
            ORDER BY l.lab_name, t.test_name
            LIMIT %s
        """
        params.append(limit)
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'count': len(results),
            'results': [dict(row) for row in results]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs/recommend', methods=['POST'])
def recommend_labs():
    """
    Get ranked lab recommendations based on multiple criteria.
    
    Request Body (JSON):
    {
        "test_name": "Voltage Test",
        "standard": "IEC 60068",
        "domain": "Electrical",
        "limit": 20
    }
    """
    try:
        data = request.get_json() or {}
        
        test_name = data.get('test_name', '').strip()
        standard = data.get('standard', '').strip()
        domain = data.get('domain', '').strip()
        limit = int(data.get('limit', 20))
        
        if not any([test_name, standard, domain]):
            return jsonify({
                'error': 'At least one search parameter is required'
            }), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build conditions
        conditions = ["l.deleted_at IS NULL"]
        params = []
        
        if test_name:
            conditions.append("LOWER(t.test_name) LIKE LOWER(%s)")
            params.append(f'%{test_name}%')
        
        if standard:
            conditions.append("LOWER(s.standard_code) LIKE LOWER(%s)")
            params.append(f'%{standard}%')
        
        if domain:
            conditions.append("d.domain_name = %s")
            params.append(domain)
        
        # Calculate scores
        query = f"""
            WITH lab_scores AS (
                SELECT 
                    l.lab_id,
                    l.lab_name,
                    COUNT(DISTINCT lc.test_id) AS matching_tests,
                    COUNT(DISTINCT lc.standard_id) AS matching_standards,
                    COUNT(DISTINCT lc.domain_id) AS matching_domains,
                    COUNT(*) AS total_matches,
                    array_agg(DISTINCT t.test_name) AS test_names,
                    array_agg(DISTINCT s.standard_code) AS standard_codes
                FROM labs l
                JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
                JOIN tests t ON t.test_id = lc.test_id
                JOIN standards s ON s.standard_id = lc.standard_id
                JOIN domains d ON d.domain_id = lc.domain_id
                WHERE {' AND '.join(conditions)}
                GROUP BY l.lab_id, l.lab_name
            )
            SELECT 
                lab_id,
                lab_name,
                matching_tests,
                matching_standards,
                matching_domains,
                total_matches,
                test_names[1:5] AS sample_tests,
                standard_codes[1:5] AS sample_standards,
                (matching_tests * 10 + matching_standards * 5 + matching_domains * 1) AS relevance_score
            FROM lab_scores
            WHERE total_matches > 0
            ORDER BY relevance_score DESC, matching_tests DESC, matching_standards DESC
            LIMIT %s
        """
        params.append(limit)
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'count': len(results),
            'results': [dict(row) for row in results]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs/<int:lab_id>', methods=['GET'])
def get_lab_details(lab_id):
    """Get detailed information about a specific lab."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get lab info
        cur.execute("""
            SELECT lab_id, lab_name, created_at, updated_at
            FROM labs
            WHERE lab_id = %s AND deleted_at IS NULL
        """, (lab_id,))
        lab = cur.fetchone()
        
        if not lab:
            return jsonify({'error': 'Lab not found'}), 404
        
        # Get capabilities
        cur.execute("""
            SELECT 
                t.test_name,
                s.standard_code,
                s.full_code,
                s.standard_body,
                d.domain_name
            FROM lab_capabilities lc
            JOIN tests t ON t.test_id = lc.test_id
            JOIN standards s ON s.standard_id = lc.standard_id
            JOIN domains d ON d.domain_id = lc.domain_id
            WHERE lc.lab_id = %s
            ORDER BY d.domain_name, t.test_name
        """, (lab_id,))
        capabilities = cur.fetchall()
        
        # Get domain summary
        cur.execute("""
            SELECT 
                d.domain_name,
                COUNT(*) AS capability_count
            FROM lab_capabilities lc
            JOIN domains d ON d.domain_id = lc.domain_id
            WHERE lc.lab_id = %s
            GROUP BY d.domain_id, d.domain_name
            ORDER BY capability_count DESC
        """, (lab_id,))
        domain_summary = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'lab': dict(lab),
            'capabilities': [dict(c) for c in capabilities],
            'domain_summary': [dict(d) for d in domain_summary],
            'total_capabilities': len(capabilities)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/domains', methods=['GET'])
def get_domains():
    """Get list of all available domains."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                d.domain_id,
                d.domain_name,
                COUNT(*) AS total_capabilities,
                COUNT(DISTINCT lc.lab_id) AS lab_count
            FROM domains d
            LEFT JOIN lab_capabilities lc ON lc.domain_id = d.domain_id
            GROUP BY d.domain_id, d.domain_name
            ORDER BY total_capabilities DESC
        """)
        domains = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'count': len(domains),
            'domains': [dict(d) for d in domains]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tests/search', methods=['GET'])
def search_tests():
    """Search for tests by name."""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 20))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT DISTINCT
                t.test_id,
                t.test_name,
                COUNT(DISTINCT lc.lab_id) AS lab_count
            FROM tests t
            JOIN lab_capabilities lc ON lc.test_id = t.test_id
            JOIN labs l ON l.lab_id = lc.lab_id
            WHERE LOWER(t.test_name) LIKE LOWER(%s)
              AND l.deleted_at IS NULL
            GROUP BY t.test_id, t.test_name
            ORDER BY lab_count DESC, t.test_name
            LIMIT %s
        """, (f'%{query}%', limit))
        
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'count': len(results),
            'results': [dict(r) for r in results]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/standards/search', methods=['GET'])
def search_standards():
    """Search for standards by code."""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 20))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT DISTINCT
                s.standard_id,
                s.standard_code,
                s.full_code,
                s.standard_body,
                COUNT(DISTINCT lc.lab_id) AS lab_count
            FROM standards s
            JOIN lab_capabilities lc ON lc.standard_id = s.standard_id
            JOIN labs l ON l.lab_id = lc.lab_id
            WHERE LOWER(s.standard_code) LIKE LOWER(%s)
              AND l.deleted_at IS NULL
            GROUP BY s.standard_id, s.standard_code, s.full_code, s.standard_body
            ORDER BY lab_count DESC, s.standard_code
            LIMIT %s
        """, (f'%{query}%', limit))
        
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'count': len(results),
            'results': [dict(r) for r in results]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 80)
    print("LAB RECOMMENDATION ENGINE API")
    print("=" * 80)
    print("\nStarting API server...")
    print("API will be available at: http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/labs/search?test_name=...&standard=...&domain=...")
    print("  POST /api/labs/recommend - Get ranked recommendations")
    print("  GET  /api/labs/<lab_id> - Get lab details")
    print("  GET  /api/domains - List all domains")
    print("  GET  /api/tests/search?q=... - Search tests")
    print("  GET  /api/standards/search?q=... - Search standards")
    print("\n" + "=" * 80)
    app.run(debug=True, host='0.0.0.0', port=5000)


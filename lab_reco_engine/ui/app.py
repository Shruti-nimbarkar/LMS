"""
Streamlit UI for Lab Recommendation Engine
Modern web interface for finding and recommending testing laboratories
"""

import streamlit as st
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
from pathlib import Path
import pandas as pd

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Page configuration
st.set_page_config(
    page_title="Lab Recommendation Engine",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Database configuration
def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        dbname="lab_reco_engine",
        user="postgres",
        password="2003",
        host="localhost",
        port=5432
    )

def get_domains():
    """Get list of all domains."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT domain_name, COUNT(*) AS capability_count
            FROM domains d
            JOIN lab_capabilities lc ON lc.domain_id = d.domain_id
            GROUP BY d.domain_id, d.domain_name
            ORDER BY capability_count DESC
        """)
        domains = cur.fetchall()
        cur.close()
        conn.close()
        return [d['domain_name'] for d in domains]
    except Exception as e:
        st.error(f"Database error: {str(e)}")
        return []

def search_labs(test_name=None, standard=None, domain=None, limit=50):
    """Search for labs."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
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
        
        return [dict(row) for row in results]
    except Exception as e:
        st.error(f"Search error: {str(e)}")
        return []

def get_recommendations(test_name=None, standard=None, domain=None, limit=20):
    """Get ranked lab recommendations."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
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
        
        return [dict(row) for row in results]
    except Exception as e:
        st.error(f"Recommendation error: {str(e)}")
        return []

def search_labs_by_name(query=None, limit=100):
    """Search for labs by name."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if query:
            # Clean and prepare the query - trim whitespace
            query_clean = query.strip()
            if not query_clean:
                # If query is empty after trimming, return all labs
                query = None
            else:
                # Create search pattern with wildcards
                search_pattern = f'%{query_clean}%'
        
        if query:
            cur.execute("""
                SELECT 
                    l.lab_id,
                    l.lab_name,
                    COUNT(lc.lab_id) AS capability_count
                FROM labs l
                LEFT JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
                WHERE l.deleted_at IS NULL
                  AND LOWER(l.lab_name) LIKE LOWER(%s)
                GROUP BY l.lab_id, l.lab_name
                ORDER BY capability_count DESC, l.lab_name
                LIMIT %s
            """, (search_pattern, limit))
        else:
            cur.execute("""
                SELECT 
                    l.lab_id,
                    l.lab_name,
                    COUNT(lc.lab_id) AS capability_count
                FROM labs l
                LEFT JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
                WHERE l.deleted_at IS NULL
                GROUP BY l.lab_id, l.lab_name
                ORDER BY capability_count DESC, l.lab_name
                LIMIT %s
            """, (limit,))
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        return [dict(r) for r in results]
    except Exception as e:
        st.error(f"Error searching labs: {str(e)}")
        import traceback
        st.error(f"Details: {traceback.format_exc()}")
        return []

def get_lab_details(lab_id):
    """Get detailed information about a lab."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT lab_id, lab_name, created_at
            FROM labs
            WHERE lab_id = %s AND deleted_at IS NULL
        """, (lab_id,))
        lab = cur.fetchone()
        
        if not lab:
            return None
        
        cur.execute("""
            SELECT 
                t.test_name,
                s.standard_code,
                s.full_code,
                d.domain_name
            FROM lab_capabilities lc
            JOIN tests t ON t.test_id = lc.test_id
            JOIN standards s ON s.standard_id = lc.standard_id
            JOIN domains d ON d.domain_id = lc.domain_id
            WHERE lc.lab_id = %s
            ORDER BY d.domain_name, t.test_name
        """, (lab_id,))
        capabilities = cur.fetchall()
        
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
        
        return {
            'lab': dict(lab),
            'capabilities': [dict(c) for c in capabilities],
            'domain_summary': [dict(d) for d in domain_summary]
        }
    except Exception as e:
        st.error(f"Error fetching lab details: {str(e)}")
        return None

def search_tests(query, limit=20):
    """Search for tests."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                t.test_id,
                t.test_name,
                COUNT(DISTINCT lc.lab_id) AS lab_count,
                array_agg(DISTINCT l.lab_name ORDER BY l.lab_name) AS lab_names
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
        
        # Convert array to list and format lab names
        formatted_results = []
        for r in results:
            result_dict = dict(r)
            if result_dict['lab_names']:
                result_dict['lab_names'] = ', '.join(result_dict['lab_names'])
            else:
                result_dict['lab_names'] = 'No labs found'
            formatted_results.append(result_dict)
        
        return formatted_results
    except Exception as e:
        st.error(f"Test search error: {str(e)}")
        return []

def search_standards(query, limit=20):
    """Search for standards."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                s.standard_id,
                s.standard_code,
                s.full_code,
                s.standard_body,
                COUNT(DISTINCT lc.lab_id) AS lab_count,
                array_agg(DISTINCT l.lab_name ORDER BY l.lab_name) AS lab_names
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
        
        # Convert array to list and format lab names
        formatted_results = []
        for r in results:
            result_dict = dict(r)
            if result_dict['lab_names']:
                result_dict['lab_names'] = ', '.join(result_dict['lab_names'])
            else:
                result_dict['lab_names'] = 'No labs found'
            formatted_results.append(result_dict)
        
        return formatted_results
    except Exception as e:
        st.error(f"Standard search error: {str(e)}")
        return []

# Main App
def main():
    # Header
    st.title("🔬 Lab Recommendation Engine")
    st.markdown("Find the perfect testing laboratory for your requirements")
    
    # Sidebar navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio(
        "Choose a page",
        ["🔍 Search Labs", "⭐ Get Recommendations", "📊 Lab Details", "🔎 Search Tests/Standards", "📈 Statistics"]
    )
    
    # Database stats in sidebar
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM labs WHERE deleted_at IS NULL")
        lab_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM lab_capabilities")
        cap_count = cur.fetchone()[0]
        cur.close()
        conn.close()
        
        st.sidebar.markdown("---")
        st.sidebar.metric("Active Labs", f"{lab_count:,}")
        st.sidebar.metric("Total Capabilities", f"{cap_count:,}")
    except:
        pass
    
    # Page routing
    if page == "🔍 Search Labs":
        search_labs_page()
    elif page == "⭐ Get Recommendations":
        recommendations_page()
    elif page == "📊 Lab Details":
        lab_details_page()
    elif page == "🔎 Search Tests/Standards":
        search_tests_standards_page()
    elif page == "📈 Statistics":
        statistics_page()

def search_labs_page():
    """Search labs page."""
    st.header("🔍 Search Labs")
    st.markdown("Search for labs by test name, standard, or domain")
    
    col1, col2 = st.columns(2)
    
    with col1:
        test_name = st.text_input("Test Name", placeholder="e.g., Voltage Test, Emission Test")
        standard = st.text_input("Standard", placeholder="e.g., IEC 60068, CISPR 14-1")
    
    with col2:
        domains = get_domains()
        domain = st.selectbox("Domain", ["All"] + domains)
        limit = st.slider("Maximum Results", 10, 100, 50)
    
    if st.button("🔍 Search", type="primary"):
        if not any([test_name, standard, domain != "All"]):
            st.warning("Please enter at least one search criterion")
        else:
            with st.spinner("Searching labs..."):
                results = search_labs(
                    test_name=test_name if test_name else None,
                    standard=standard if standard else None,
                    domain=domain if domain != "All" else None,
                    limit=limit
                )
            
            if results:
                st.success(f"Found {len(results)} matching capabilities")
                
                # Group by lab
                labs_dict = {}
                for r in results:
                    lab_id = r['lab_id']
                    if lab_id not in labs_dict:
                        labs_dict[lab_id] = {
                            'lab_name': r['lab_name'],
                            'capabilities': []
                        }
                    labs_dict[lab_id]['capabilities'].append(r)
                
                # Display results
                for lab_id, lab_data in labs_dict.items():
                    with st.expander(f"🏢 {lab_data['lab_name']} ({len(lab_data['capabilities'])} capabilities)", expanded=False):
                        df = st.dataframe(
                            lab_data['capabilities'],
                            column_config={
                                "lab_id": st.column_config.NumberColumn("Lab ID", format="%d"),
                                "test_name": "Test Name",
                                "standard_code": "Standard Code",
                                "full_code": "Full Code",
                                "standard_body": "Standard Body",
                                "domain_name": "Domain"
                            },
                            hide_index=True,
                            use_container_width=True
                        )
            else:
                st.info("No labs found matching your criteria")

def recommendations_page():
    """Recommendations page."""
    st.header("⭐ Get Lab Recommendations")
    st.markdown("Get ranked recommendations based on your requirements")
    
    col1, col2 = st.columns(2)
    
    with col1:
        test_name = st.text_input("Test Name", key="rec_test", placeholder="e.g., Voltage Test")
        standard = st.text_input("Standard", key="rec_standard", placeholder="e.g., IEC 60068")
    
    with col2:
        domains = get_domains()
        domain = st.selectbox("Domain", ["All"] + domains, key="rec_domain")
        limit = st.slider("Number of Recommendations", 5, 50, 20, key="rec_limit")
    
    if st.button("⭐ Get Recommendations", type="primary"):
        if not any([test_name, standard, domain != "All"]):
            st.warning("Please enter at least one search criterion")
        else:
            with st.spinner("Finding best matching labs..."):
                results = get_recommendations(
                    test_name=test_name if test_name else None,
                    standard=standard if standard else None,
                    domain=domain if domain != "All" else None,
                    limit=limit
                )
            
            if results:
                st.success(f"Found {len(results)} recommended labs")
                
                # Display ranked results
                for idx, lab in enumerate(results, 1):
                    with st.container():
                        col1, col2, col3 = st.columns([3, 2, 1])
                        
                        with col1:
                            st.subheader(f"#{idx} {lab['lab_name']}")
                            st.caption(f"Lab ID: {lab['lab_id']}")
                        
                        with col2:
                            st.metric("Relevance Score", f"{lab['relevance_score']}")
                            st.caption(f"{lab['matching_tests']} tests • {lab['matching_standards']} standards • {lab['matching_domains']} domains")
                        
                        with col3:
                            if st.button("View Details", key=f"view_{lab['lab_id']}"):
                                st.session_state['selected_lab_id'] = lab['lab_id']
                                st.rerun()
                        
                        # Sample tests and standards
                        if lab['sample_tests']:
                            with st.expander("Sample Tests & Standards", expanded=False):
                                col_a, col_b = st.columns(2)
                                with col_a:
                                    st.write("**Tests:**")
                                    for test in lab['sample_tests'][:5]:
                                        st.write(f"- {test}")
                                with col_b:
                                    st.write("**Standards:**")
                                    for std in lab['sample_standards'][:5]:
                                        st.write(f"- {std}")
                        
                        st.divider()
            else:
                st.info("No recommendations found. Try different search criteria.")

def lab_details_page():
    """Lab details page."""
    st.header("📊 Lab Details")
    st.markdown("View detailed information about a specific lab")
    
    # Initialize session state
    if 'show_all_labs' not in st.session_state:
        st.session_state['show_all_labs'] = False
    
    # Search for labs
    st.subheader("🔍 Find a Lab")
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        search_query = st.text_input(
            "Search by lab name", 
            key="lab_search",
            placeholder="e.g., National Test House, Bureau of Indian Standards...",
            help="Type to search for labs by name"
        )
    
    with col2:
        limit = st.number_input("Max Results", min_value=10, max_value=500, value=100, step=10, key="lab_search_limit")
    
    # Get labs based on search
    search_performed = bool(search_query and search_query.strip())
    
    if search_performed:
        with st.spinner(f"Searching for '{search_query}'..."):
            labs = search_labs_by_name(search_query.strip(), limit)
    else:
        with st.spinner("Loading labs..."):
            labs = search_labs_by_name(None, limit)
    
    if labs:
        st.success(f"Found {len(labs)} lab(s)")
        
        # Create a mapping for selectbox with better formatting
        lab_options = {f"{lab['lab_name']} (ID: {lab['lab_id']}, {lab['capability_count']} capabilities)": lab['lab_id'] for lab in labs}
        
        st.markdown("---")
        selected_lab_display = st.selectbox(
            "📋 Select a lab to view details",
            options=list(lab_options.keys()),
            key="lab_selector",
            help="Choose a lab from the list. You can type to search within the dropdown.",
            index=0 if labs else None
        )
        
        selected_lab_id = lab_options[selected_lab_display]
        
        # Auto-load or show button
        auto_load = st.checkbox("Auto-load details", value=True, help="Automatically load details when a lab is selected")
        
        if auto_load or st.button("🔍 Load Lab Details", type="primary"):
            with st.spinner("Loading lab details..."):
                details = get_lab_details(selected_lab_id)
            
            if details:
                lab = details['lab']
                capabilities = details['capabilities']
                domain_summary = details['domain_summary']
                
                st.markdown("---")
                st.markdown("## 📊 Lab Information")
                
                # Lab info
                st.subheader(f"🏢 {lab['lab_name']}")
                st.caption(f"Lab ID: {lab['lab_id']} | Created: {lab['created_at']}")
                
                # Domain summary
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Capabilities", len(capabilities))
                with col2:
                    st.metric("Unique Domains", len(domain_summary))
                with col3:
                    st.metric("Unique Tests", len(set(c['test_name'] for c in capabilities)))
                
                # Domain breakdown
                st.subheader("Domain Distribution")
                domain_data = {d['domain_name']: d['capability_count'] for d in domain_summary}
                st.bar_chart(domain_data)
                
                # Capabilities table
                st.subheader("All Capabilities")
                df = st.dataframe(
                    capabilities,
                    column_config={
                        "test_name": "Test Name",
                        "standard_code": "Standard Code",
                        "full_code": "Full Code",
                        "standard_body": "Standard Body",
                        "domain_name": "Domain"
                    },
                    hide_index=True,
                    use_container_width=True
                )
                
                # Download button
                import pandas as pd
                csv = pd.DataFrame(capabilities).to_csv(index=False)
                st.download_button(
                    label="📥 Download Capabilities as CSV",
                    data=csv,
                    file_name=f"lab_{selected_lab_id}_capabilities.csv",
                    mime="text/csv"
                )
            else:
                st.error("Lab not found or has been deleted")
    else:
        if search_performed:
            st.warning(f"No labs found matching '{search_query}'. Try:")
            st.markdown("""
            - Using partial names (e.g., 'National' instead of full name)
            - Checking spelling
            - Removing special characters
            - Viewing all labs below
            """)
            
            # Show option to view all labs
            if st.button("🔍 Show All Labs", type="secondary"):
                st.session_state['show_all_labs'] = True
                st.rerun()
            
            # If user wants to see all labs
            if st.session_state.get('show_all_labs', False):
                st.markdown("---")
                st.subheader("All Available Labs")
                with st.spinner("Loading all labs..."):
                    all_labs = search_labs_by_name(None, 500)
                if all_labs:
                    st.info(f"Showing {len(all_labs)} labs. Use the search box above to filter.")
                    lab_options_all = {f"{lab['lab_name']} (ID: {lab['lab_id']}, {lab['capability_count']} capabilities)": lab['lab_id'] for lab in all_labs}
                    selected_lab_display_all = st.selectbox(
                        "Select a lab",
                        options=list(lab_options_all.keys()),
                        key="lab_selector_all",
                        index=0
                    )
                    selected_lab_id_all = lab_options_all[selected_lab_display_all]
                    
                    if st.button("🔍 Load Selected Lab Details", type="primary"):
                        with st.spinner("Loading lab details..."):
                            details = get_lab_details(selected_lab_id_all)
                        if details:
                            # Display lab details (same as above)
                            lab = details['lab']
                            capabilities = details['capabilities']
                            domain_summary = details['domain_summary']
                            
                            st.markdown("---")
                            st.markdown("## 📊 Lab Information")
                            
                            st.subheader(f"🏢 {lab['lab_name']}")
                            st.caption(f"Lab ID: {lab['lab_id']} | Created: {lab['created_at']}")
                            
                            col1, col2, col3 = st.columns(3)
                            with col1:
                                st.metric("Total Capabilities", len(capabilities))
                            with col2:
                                st.metric("Unique Domains", len(domain_summary))
                            with col3:
                                st.metric("Unique Tests", len(set(c['test_name'] for c in capabilities)))
                            
                            st.subheader("Domain Distribution")
                            domain_data = {d['domain_name']: d['capability_count'] for d in domain_summary}
                            st.bar_chart(domain_data)
                            
                            st.subheader("All Capabilities")
                            df = st.dataframe(
                                capabilities,
                                column_config={
                                    "test_name": "Test Name",
                                    "standard_code": "Standard Code",
                                    "full_code": "Full Code",
                                    "standard_body": "Standard Body",
                                    "domain_name": "Domain"
                                },
                                hide_index=True,
                                use_container_width=True
                            )
                            
                            import pandas as pd
                            csv = pd.DataFrame(capabilities).to_csv(index=False)
                            st.download_button(
                                label="📥 Download Capabilities as CSV",
                                data=csv,
                                file_name=f"lab_{selected_lab_id_all}_capabilities.csv",
                                mime="text/csv"
                            )
        else:
            st.info("Enter a lab name in the search box above to find labs.")

def search_tests_standards_page():
    """Search tests and standards page."""
    st.header("🔎 Search Tests & Standards")
    st.markdown("Find available tests and standards in the database")
    
    tab1, tab2 = st.tabs(["Search Tests", "Search Standards"])
    
    with tab1:
        st.subheader("Search Tests")
        test_query = st.text_input("Enter test name", key="test_search", placeholder="e.g., voltage, emission, safety")
        test_limit = st.slider("Results", 10, 50, 20, key="test_limit")
        
        if st.button("🔍 Search Tests", key="btn_test"):
            if test_query:
                with st.spinner("Searching tests..."):
                    results = search_tests(test_query, test_limit)
                
                if results:
                    st.success(f"Found {len(results)} tests")
                    
                    # Display results with lab names prominently
                    for result in results:
                        with st.expander(f"🧪 {result['test_name']} ({result['lab_count']} labs)", expanded=False):
                            col1, col2 = st.columns([1, 3])
                            with col1:
                                st.metric("Test ID", result['test_id'])
                                st.metric("Labs Offering", result['lab_count'])
                            with col2:
                                st.markdown("### 🏢 Lab Names")
                                # Split lab names and display as a list
                                if result['lab_names'] and result['lab_names'] != 'No labs found':
                                    lab_list = [lab.strip() for lab in result['lab_names'].split(',') if lab.strip()]
                                    # Display in a scrollable container with columns for better readability
                                    with st.container():
                                        num_cols = 2
                                        cols = st.columns(num_cols)
                                        labs_per_col = (len(lab_list) + num_cols - 1) // num_cols
                                        for idx, lab in enumerate(lab_list):
                                            col_idx = idx // labs_per_col
                                            if col_idx < len(cols):
                                                with cols[col_idx]:
                                                    st.markdown(f"• **{lab}**")
                                else:
                                    st.info("No labs found")
                    
                    # Also show as dataframe for easy viewing
                    st.markdown("---")
                    st.markdown("### 📊 Detailed View")
                    df = st.dataframe(
                        results,
                        column_config={
                            "test_id": st.column_config.NumberColumn("Test ID", format="%d"),
                            "test_name": "Test Name",
                            "lab_count": st.column_config.NumberColumn("Labs Offering", format="%d"),
                            "lab_names": st.column_config.TextColumn("Lab Names", width="large")
                        },
                        hide_index=True,
                        use_container_width=True
                    )
                else:
                    st.info("No tests found")
            else:
                st.warning("Please enter a search query")
    
    with tab2:
        st.subheader("Search Standards")
        std_query = st.text_input("Enter standard code", key="std_search", placeholder="e.g., IEC, IS, CISPR")
        std_limit = st.slider("Results", 10, 50, 20, key="std_limit")
        
        if st.button("🔍 Search Standards", key="btn_std"):
            if std_query:
                with st.spinner("Searching standards..."):
                    results = search_standards(std_query, std_limit)
                
                if results:
                    st.success(f"Found {len(results)} standards")
                    
                    # Display results with lab names prominently
                    for result in results:
                        with st.expander(f"📋 {result['standard_code']} - {result['full_code']} ({result['lab_count']} labs)", expanded=False):
                            col1, col2 = st.columns([1, 3])
                            with col1:
                                st.metric("Standard ID", result['standard_id'])
                                st.metric("Labs Offering", result['lab_count'])
                                if result.get('standard_body'):
                                    st.caption(f"Body: {result['standard_body']}")
                            with col2:
                                st.markdown("### 🏢 Lab Names")
                                # Split lab names and display as a list
                                if result['lab_names'] and result['lab_names'] != 'No labs found':
                                    lab_list = [lab.strip() for lab in result['lab_names'].split(',') if lab.strip()]
                                    # Display in a scrollable container with columns for better readability
                                    with st.container():
                                        num_cols = 2
                                        cols = st.columns(num_cols)
                                        labs_per_col = (len(lab_list) + num_cols - 1) // num_cols
                                        for idx, lab in enumerate(lab_list):
                                            col_idx = idx // labs_per_col
                                            if col_idx < len(cols):
                                                with cols[col_idx]:
                                                    st.markdown(f"• **{lab}**")
                                else:
                                    st.info("No labs found")
                    
                    # Also show as dataframe for easy viewing
                    st.markdown("---")
                    st.markdown("### 📊 Detailed View")
                    df = st.dataframe(
                        results,
                        column_config={
                            "standard_id": st.column_config.NumberColumn("Standard ID", format="%d"),
                            "standard_code": "Standard Code",
                            "full_code": "Full Code",
                            "standard_body": "Standard Body",
                            "lab_count": st.column_config.NumberColumn("Labs Offering", format="%d"),
                            "lab_names": st.column_config.TextColumn("Lab Names", width="large")
                        },
                        hide_index=True,
                        use_container_width=True
                    )
                else:
                    st.info("No standards found")
            else:
                st.warning("Please enter a search query")

def statistics_page():
    """Statistics page."""
    st.header("📈 Database Statistics")
    st.markdown("Overview of the lab recommendation engine database")
    
    try:
        conn = get_db_connection()
        # Use regular cursor for count queries
        cur = conn.cursor()
        
        # Overall stats
        col1, col2, col3, col4 = st.columns(4)
        
        cur.execute("SELECT COUNT(*) FROM labs WHERE deleted_at IS NULL")
        lab_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM lab_capabilities")
        cap_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM tests")
        test_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM standards")
        std_count = cur.fetchone()[0]
        
        with col1:
            st.metric("Active Labs", f"{lab_count:,}")
        with col2:
            st.metric("Total Capabilities", f"{cap_count:,}")
        with col3:
            st.metric("Unique Tests", f"{test_count:,}")
        with col4:
            st.metric("Unique Standards", f"{std_count:,}")
        
        # Domain distribution
        st.subheader("Domain Distribution")
        # Switch to RealDictCursor for structured queries
        cur.close()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                d.domain_name,
                COUNT(*) AS capability_count,
                COUNT(DISTINCT lc.lab_id) AS lab_count
            FROM domains d
            JOIN lab_capabilities lc ON lc.domain_id = d.domain_id
            JOIN labs l ON l.lab_id = lc.lab_id
            WHERE l.deleted_at IS NULL
            GROUP BY d.domain_id, d.domain_name
            ORDER BY capability_count DESC
        """)
        domain_stats = cur.fetchall()
        
        domain_df = pd.DataFrame([dict(row) for row in domain_stats])
        if not domain_df.empty:
            col1, col2 = st.columns(2)
            
            with col1:
                st.bar_chart(domain_df.set_index('domain_name')['capability_count'])
            
            with col2:
                st.dataframe(
                    domain_df,
                    column_config={
                        "domain_name": "Domain",
                        "capability_count": st.column_config.NumberColumn("Capabilities", format="%d"),
                        "lab_count": st.column_config.NumberColumn("Labs", format="%d")
                    },
                    hide_index=True,
                    use_container_width=True
                )
        
        # Top labs
        st.subheader("Top Labs by Capability Count")
        cur.execute("""
            SELECT 
                l.lab_id,
                l.lab_name,
                COUNT(*) AS total_capabilities,
                COUNT(DISTINCT lc.test_id) AS unique_tests,
                COUNT(DISTINCT lc.standard_id) AS unique_standards,
                COUNT(DISTINCT lc.domain_id) AS unique_domains
            FROM labs l
            JOIN lab_capabilities lc ON lc.lab_id = l.lab_id
            WHERE l.deleted_at IS NULL
            GROUP BY l.lab_id, l.lab_name
            ORDER BY total_capabilities DESC
            LIMIT 20
        """)
        top_labs = cur.fetchall()
        
        st.dataframe(
            [dict(row) for row in top_labs],
            column_config={
                "lab_id": st.column_config.NumberColumn("Lab ID", format="%d"),
                "lab_name": "Lab Name",
                "total_capabilities": st.column_config.NumberColumn("Total Capabilities", format="%d"),
                "unique_tests": st.column_config.NumberColumn("Unique Tests", format="%d"),
                "unique_standards": st.column_config.NumberColumn("Unique Standards", format="%d"),
                "unique_domains": st.column_config.NumberColumn("Unique Domains", format="%d")
            },
            hide_index=True,
            use_container_width=True
        )
        
        cur.close()
        conn.close()
        
    except Exception as e:
        st.error(f"Error loading statistics: {str(e)}")

# Handle lab detail navigation
if 'selected_lab_id' in st.session_state:
    st.session_state['lab_details_id'] = st.session_state['selected_lab_id']
    del st.session_state['selected_lab_id']
    st.rerun()

if __name__ == "__main__":
    main()


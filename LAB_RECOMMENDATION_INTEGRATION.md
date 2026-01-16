# Lab Recommendation Engine Integration

## Overview

The Lab Recommendation Engine has been successfully integrated into the LMS system. This integration allows users to search for testing laboratories based on test requirements, standards, and domains, and get ranked recommendations.

## What Has Been Integrated

### 1. Frontend Service (`src/services/labRecommendationApi.js`)
- Complete API client for the recommendation engine
- All endpoints implemented:
  - Health check
  - Search labs
  - Get recommendations
  - Get lab details
  - Get domains
  - Search tests
  - Search standards
- Error handling and response interceptors

### 2. UI Components (`src/components/labManagement/LabRecommendation.jsx`)
- Full-featured recommendation/search interface
- Two modes:
  - **Recommendations**: Ranked results with relevance scores
  - **Search**: Simple search results
- Search criteria:
  - Test name
  - Standard code
  - Domain (dropdown)
  - Results limit
- Features:
  - Real-time search
  - Lab details modal
  - Domain statistics
  - Capability listings
  - Responsive design

### 3. Page Route (`src/pages/lab/management/LabRecommendations.jsx`)
- Dedicated page for lab recommendations
- Accessible at `/lab/management/lab-recommendations`

### 4. Navigation
- Added to sidebar navigation menu
- Icon: TrendingUp
- Positioned before "AI Integration"

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Lab Recommendation Engine API URL
VITE_LAB_RECO_API_URL=http://localhost:5000/api
```

**Default**: `http://localhost:5000/api` (if not set)

### Starting the Recommendation Engine API

The recommendation engine API must be running for the integration to work:

```bash
cd lab_reco_engine/api
pip install -r requirements.txt
python recommendation_api.py
```

The API will start on `http://localhost:5000`

## Usage

### 1. Access the Feature

Navigate to **Lab Recommendations** in the sidebar menu (under Calendar, before AI Integration).

### 2. Search for Labs

1. **Choose mode**: Recommendations or Search
2. **Enter criteria**:
   - Test name (e.g., "Voltage Test")
   - Standard (e.g., "IEC 60068")
   - Domain (select from dropdown)
3. **Set limit**: Number of results (default: 20)
4. **Click** "Get Recommendations" or "Search Labs"

### 3. View Results

- **Recommendations mode**: Shows ranked results with:
  - Relevance score
  - Matching tests count
  - Matching standards count
  - Matching domains count
  - Sample tests

- **Search mode**: Shows simple list of matching labs

### 4. View Lab Details

Click on any lab card to view:
- Full lab information
- Domain summary (capabilities per domain)
- Complete capability list (tests, standards, domains)

## API Endpoints Used

The integration uses these endpoints from the recommendation engine:

1. `GET /api/health` - Health check
2. `GET /api/domains` - Get all domains
3. `GET /api/labs/search` - Search labs
4. `POST /api/labs/recommend` - Get ranked recommendations
5. `GET /api/labs/<lab_id>` - Get lab details

## Integration Points

### Current Integration
- ✅ Standalone page (`/lab/management/lab-recommendations`)
- ✅ Navigation menu item
- ✅ Full UI with search and recommendations

### Future Integration Opportunities

1. **RFQ Workflow**
   - Auto-suggest labs when creating RFQ
   - Pre-fill lab recommendations based on test requirements
   - Quick lab selection from recommendations

2. **Estimation Workflow**
   - Suggest labs during estimation
   - Pre-populate lab options

3. **Test Plan Creation**
   - Recommend labs based on selected tests
   - Show lab capabilities when planning tests

4. **Project Management**
   - Associate recommended labs with projects
   - Track lab utilization

## Database Connection

The recommendation engine API connects to PostgreSQL:

```python
DB_CONFIG = {
    'dbname': 'lab_reco_engine',
    'user': 'postgres',
    'password': 'your_password',
    'host': 'localhost',
    'port': 5432
}
```

**Note**: Update the database credentials in `lab_reco_engine/api/recommendation_api.py` if needed.

## Troubleshooting

### API Not Responding

1. **Check if API is running**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check environment variable**:
   - Ensure `VITE_LAB_RECO_API_URL` is set correctly
   - Default is `http://localhost:5000/api`

3. **Check CORS**: The API has CORS enabled, but if issues occur, verify Flask-CORS is installed

### No Results Found

1. **Check database**: Ensure the recommendation engine database is populated
2. **Check search criteria**: At least one criteria (test_name, standard, or domain) is required
3. **Check API logs**: Review API console output for errors

### Database Connection Errors

1. **Verify PostgreSQL is running**
2. **Check database credentials** in `recommendation_api.py`
3. **Verify database exists**: `lab_reco_engine`
4. **Check database schema**: Run `db/schema.sql` if needed

## Files Created/Modified

### New Files
- `src/services/labRecommendationApi.js`
- `src/components/labManagement/LabRecommendation.jsx`
- `src/pages/lab/management/LabRecommendations.jsx`
- `LAB_RECOMMENDATION_INTEGRATION.md` (this file)

### Modified Files
- `src/App.jsx` - Added route for lab recommendations
- `src/layouts/LabManagementLayout.jsx` - Added navigation item

## Next Steps

1. **Test the integration**:
   - Start the recommendation engine API
   - Navigate to Lab Recommendations page
   - Test search and recommendations

2. **Customize** (optional):
   - Adjust UI styling
   - Add more filters
   - Integrate into RFQ/Estimation workflows

3. **Enhance** (future):
   - Add lab comparison feature
   - Save favorite labs
   - Export recommendations
   - Integration with project workflow

## Support

For issues:
1. Check API logs
2. Verify database connection
3. Review browser console for errors
4. Check network tab for API requests

For more information about the recommendation engine:
- See `lab_reco_engine/README.md`
- See `lab_reco_engine/docs/API_DOCUMENTATION.md`



# Lab Management System - System Architecture

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [API & Backend Architecture](#api--backend-architecture)
6. [Data Flow](#data-flow)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Routing Architecture](#routing-architecture)
10. [Build & Deployment](#build--deployment)
11. [Security Architecture](#security-architecture)
12. [Performance Optimizations](#performance-optimizations)
13. [Future Considerations](#future-considerations)

---

## Overview

The Lab Management System (LMS) is a comprehensive React-based web application designed to manage laboratory operations, including customer management, project tracking, test planning and execution, document management, and compliance reporting.

### Key Features
- **Customer & RFQ Management**: Manage clients and request for quotations
- **Project Lifecycle**: End-to-end project management from estimation to completion
- **Test Management**: Test plans, executions, and results tracking
- **Document Management**: Centralized document repository
- **Quality & Compliance**: Audits, NCRs, and certifications
- **Analytics & Reporting**: Dashboard with real-time metrics and charts
- **AI Integration** (Optional): AI-powered features for recommendations and automation

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Single Page Application                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │   Pages  │  │Components│  │ Contexts │  │Services │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ (Axios)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Service Layer                      │  │
│  │  • Authentication & Authorization                         │  │
│  │  • Request Interceptors                                   │  │
│  │  • Response Interceptors                                  │  │
│  │  • Error Handling                                         │  │
│  │  • Token Refresh                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  RESTful API Server                       │  │
│  │  • Customer Management                                    │  │
│  │  • Project Management                                     │  │
│  │  • Test Management                                        │  │
│  │  • Document Management                                    │  │
│  │  • Authentication Service                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Database   │  │  File Store  │  │ LocalStorage │         │
│  │  (Backend)   │  │  (Backend)   │  │  (Client)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Patterns
- **SPA (Single Page Application)**: Client-side routing with React Router
- **Component-Based Architecture**: Modular, reusable UI components
- **Service Layer Pattern**: Separation of API calls from business logic
- **Context API Pattern**: Global state management for auth and shared data
- **Lazy Loading**: Code splitting for optimal performance

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library for building component-based interfaces |
| **React Router DOM** | 6.20.0 | Client-side routing and navigation |
| **Vite** | 5.0.8 | Build tool and development server |
| **Tailwind CSS** | 3.3.6 | Utility-first CSS framework |
| **Framer Motion** | 10.16.16 | Animation library for smooth UI transitions |
| **Axios** | 1.6.2 | HTTP client for API requests |
| **Recharts** | 2.10.3 | Charting library for data visualization |
| **Lucide React** | 0.294.0 | Icon library |
| **React Hot Toast** | 2.4.1 | Toast notifications |
| **Headless UI** | 1.7.17 | Unstyled UI components |
| **date-fns** | 2.30.0 | Date utility library |
| **clsx** | 2.0.0 | Conditional className utility |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Vite** | Fast HMR (Hot Module Replacement), optimized builds |
| **PostCSS** | CSS processing and autoprefixing |
| **Terser** | JavaScript minification for production |
| **ESBuild** | Fast JavaScript bundler (via Vite) |

---

## Frontend Architecture

### Project Structure

```
LMS/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Root component with routing
│   ├── index.css                # Global styles
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ErrorBoundary.jsx   # Error handling wrapper
│   │   ├── labManagement/      # Lab-specific components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── AIChatbot.jsx   # AI chatbot component
│   │   │   └── forms/          # Form components
│   │   │       ├── CreateCustomerForm.jsx
│   │   │       ├── CreateProjectForm.jsx
│   │   │       ├── CreateTestPlanForm.jsx
│   │   │       └── ...
│   │   ├── aiFeatures/         # AI-powered features (optional)
│   │   └── documentProcessing/ # Document processing (optional)
│   │
│   ├── contexts/                # React Context providers
│   │   ├── LabDataContext.jsx  # Global lab data state
│   │   └── LabManagementAuthContext.jsx  # Authentication state
│   │
│   ├── layouts/                 # Layout components
│   │   └── LabManagementLayout.jsx  # Main application layout
│   │
│   ├── pages/                   # Page components
│   │   └── lab/
│   │       └── management/      # Lab management pages
│   │           ├── Dashboard.jsx
│   │           ├── Customers.jsx
│   │           ├── Projects.jsx
│   │           ├── TestPlans.jsx
│   │           └── ... (20+ pages)
│   │
│   ├── services/                # API service layer
│   │   ├── labManagementApi.js # Main API service
│   │   ├── aiService.js        # AI service (optional)
│   │   ├── aiFeatures/         # AI feature services (optional)
│   │   └── documentProcessing/ # Document services (optional)
│   │
│   └── assets/                  # Static assets
│       └── techlink-logo.svg
│
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

### Application Entry Point Flow

```
index.html
    │
    └── main.jsx (React DOM render)
            │
            └── App.jsx
                    │
                    ├── ErrorBoundary
                    │       │
                    │       └── LabManagementAuthProvider
                    │               │
                    │               └── LabDataProvider
                    │                       │
                    │                       └── Router
                    │                               │
                    │                               └── LabManagementLayout
                    │                                       │
                    │                                       └── Outlet (Page Components)
```

---

## API & Backend Architecture

### API Service Layer

The application uses a centralized API service layer (`labManagementApi.js`) that provides:

#### 1. **Base API Service Class**
```javascript
class ApiService {
  - axios client with base configuration
  - Request interceptors (authentication tokens)
  - Response interceptors (error handling, token refresh)
  - HTTP methods (get, post, put, delete, patch)
}
```

#### 2. **Service Modules**

| Service | Endpoints | Purpose |
|---------|-----------|---------|
| `customersService` | `/api/customers` | Customer CRUD operations |
| `rfqsService` | `/api/rfqs` | RFQ management |
| `estimationsService` | `/api/estimations` | Cost estimation |
| `projectsService` | `/api/projects` | Project management |
| `testPlansService` | `/api/test-plans` | Test plan management |
| `testExecutionsService` | `/api/test-executions` | Test execution tracking |
| `testResultsService` | `/api/test-results` | Test results management |
| `samplesService` | `/api/samples` | Sample tracking |
| `trfsService` | `/api/trfs` | Test Request Forms |
| `documentsService` | `/api/documents` | Document management |
| `reportsService` | `/api/reports` | Report generation |
| `auditsService` | `/api/audits` | Audit management |
| `ncrsService` | `/api/ncrs` | Non-Conformance Reports |
| `certificationsService` | `/api/certifications` | Certification tracking |

#### 3. **API Configuration**

- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Timeout**: 30 seconds
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (JWT) in Authorization header

#### 4. **Request Interceptors**
- Automatically attach authentication token from localStorage
- Handle token refresh on 401 responses
- Retry failed requests with new token

#### 5. **Response Interceptors**
- Handle 401 Unauthorized (token refresh)
- Error normalization
- Global error handling

#### 6. **Caching Strategy**
- In-memory cache with 30-second TTL
- Cache invalidation on mutations
- Pattern-based cache clearing

### Backend API Expectations

The frontend expects a RESTful API with the following characteristics:

#### Recommended Backend Framework

**FastAPI is recommended** for the backend implementation. See `BACKEND_ARCHITECTURE_FASTAPI.md` for detailed backend architecture and implementation guide.

**Why FastAPI?**
- ✅ High performance (async/await support)
- ✅ Automatic API documentation (Swagger/OpenAPI)
- ✅ Type safety with Pydantic models
- ✅ Seamless integration with React frontend
- ✅ Python ecosystem for analytics/ML features
- ✅ Built-in JWT authentication support

#### Authentication
```
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/refresh        # Refresh access token
POST   /api/v1/auth/logout         # User logout
```

#### Standard REST Endpoints
```
GET    /api/v1/{resource}          # List all resources
GET    /api/v1/{resource}/{id}     # Get resource by ID
POST   /api/v1/{resource}          # Create new resource
PUT    /api/v1/{resource}/{id}     # Update resource
DELETE /api/v1/{resource}/{id}     # Delete resource
PATCH  /api/v1/{resource}/{id}     # Partial update
```

#### Response Format

FastAPI returns Pydantic models as JSON, which aligns with frontend expectations:

```json
{
  "id": 1,
  "company_name": "TechCorp Industries",
  "email": "contact@techcorp.com",
  ...
}
```

For consistency, the frontend can also handle wrapped responses:

```json
{
  "data": { ... },              // Resource data
  "message": "Success",         // Optional message
  "error": null                 // Error information (if any)
}
```

---

## Data Flow

### Request Flow

```
User Action
    │
    └──> Page Component
            │
            └──> Service Method (e.g., customersService.getAll())
                    │
                    └──> API Service (apiService.get())
                            │
                            └──> Axios HTTP Request
                                    │
                                    └──> Backend API
                                            │
                                            └──> Database
                                                    │
                                                    └──> Response
                                                            │
                                                            └──> Service Layer
                                                                    │
                                                                    └──> Component State Update
                                                                            │
                                                                            └──> UI Re-render
```

### State Update Flow

```
User Interaction
    │
    ├──> Form Submit
    │       │
    │       └──> Service.create(data)
    │               │
    │               └──> API POST Request
    │                       │
    │                       └──> Success Response
    │                               │
    │                               ├──> Update Local State
    │                               ├──> Clear Cache
    │                               └──> Show Success Toast
    │
    └──> Context Update
            │
            └──> LabDataContext
                    │
                    ├──> Update State
                    ├──> Save to localStorage
                    └──> Notify Subscribed Components
```

---

## Component Architecture

### Component Hierarchy

```
App
└── Router
    └── LabManagementLayout
        ├── Sidebar (Navigation)
        ├── Header (Search, Notifications)
        └── Main Content Area
            └── Outlet (Current Page)
                ├── Dashboard
                ├── Customers
                ├── Projects
                └── ... (other pages)
```

### Component Types

#### 1. **Layout Components**
- **LabManagementLayout**: Main application shell
  - Sidebar navigation
  - Top header with search
  - Notification center
  - User profile section

#### 2. **Page Components**
- **Dashboard**: Analytics and KPIs
- **Customers**: Customer management
- **Projects**: Project lifecycle management
- **TestPlans**: Test planning interface
- **TestExecutions**: Execution tracking
- **TestResults**: Results visualization
- **Documents**: Document repository
- **Reports**: Report generation
- **Audits**: Audit management
- **NCRs**: Non-conformance tracking
- **Certifications**: Certification management

#### 3. **UI Components**
- **Button**: Reusable button component
- **Input**: Form input component
- **Card**: Card container component
- **Modal**: Modal dialog component
- **Badge**: Status badge component

#### 4. **Form Components**
- Dedicated form components for each entity
- Validation logic
- Error handling
- Submit handling

### Component Communication

```
Parent Component
    │
    ├── Props (data down)
    │       │
    │       └──> Child Component
    │
    └── Callbacks (events up)
            │
            └──> Child Component
                    │
                    └──> onAction() → Parent
```

---

## State Management

### State Management Strategy

The application uses a hybrid approach combining:
1. **React Context API** for global state
2. **Local Component State** for component-specific data
3. **localStorage** for persistence

### Context Providers

#### 1. **LabManagementAuthContext**
```javascript
{
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void
}
```
- Manages authentication state
- Provides login/logout functions
- Persists user in localStorage

#### 2. **LabDataContext**
```javascript
{
  labRequests: LabRequest[],
  technicians: Technician[],
  schedule: ScheduleItem[],
  organizationData: OrganizationData | null,
  scopeData: ScopeData,
  
  // Mutations
  updateRequest: (id, updates) => void,
  assignRequest: (requestId, technicianId) => void,
  updateRequestStatus: (id, status, data) => void,
  
  // Statistics
  getStats: () => Stats
}
```
- Global lab data state
- CRUD operations
- Automatic localStorage sync

### State Persistence

- **localStorage Keys**:
  - `labManagementAccessToken`: Auth token
  - `labManagementRefreshToken`: Refresh token
  - `labManagementUser`: User data
  - `techlink_lab_requests`: Lab requests
  - `techlink_technicians`: Technician data
  - `techlink_lab_schedule`: Schedule data
  - `techlink_organization_data`: Organization data
  - `techlink_scope_data`: Scope management data

---

## Routing Architecture

### Route Structure

```
/ (root)
  └──> Redirect to /lab/management/dashboard

/lab/management
  ├── dashboard
  ├── organization
  ├── scope-management
  ├── customers
  ├── rfqs
  ├── estimations
  ├── projects
  │   └── :id (project detail)
  ├── samples
  │   └── :id (sample detail)
  ├── test-plans
  │   └── :id (test plan detail)
  ├── test-executions
  │   └── :id (execution detail)
  ├── test-results
  │   └── :id (result detail)
  ├── trfs
  │   └── :id (trf detail)
  ├── documents
  │   └── :id (document detail)
  ├── reports
  ├── audits
  ├── ncrs
  ├── certifications
  ├── ai-integration
  └── document-processing
```

### Routing Features

- **Lazy Loading**: All routes use React.lazy() for code splitting
- **Suspense Boundaries**: Loading states during route transitions
- **Route Guards**: (To be implemented) Authentication-based route protection
- **Animated Transitions**: Framer Motion page transitions
- **Nested Routes**: Layout component with nested route rendering

### Route Configuration

```javascript
// Lazy-loaded routes
const Dashboard = lazy(() => import('./pages/lab/management/Dashboard'))
const Customers = lazy(() => import('./pages/lab/management/Customers'))
// ... other routes

// Route definitions
<Route path="/lab/management" element={<LabManagementLayout />}>
  <Route path="dashboard" element={<Suspense><Dashboard /></Suspense>} />
  <Route path="customers" element={<Suspense><Customers /></Suspense>} />
  // ... other routes
</Route>
```

---

## Build & Deployment

### Build Configuration (Vite)

#### Development
```bash
npm run dev
```
- Fast HMR (Hot Module Replacement)
- Source maps enabled
- Development optimizations

#### Production Build
```bash
npm run build
```
- **Minification**: Terser for JavaScript minification
- **Tree Shaking**: Dead code elimination
- **Code Splitting**:
  - `react-vendor`: React, React DOM, React Router
  - `ui-vendor`: Framer Motion, Lucide React, Headless UI
  - `chart-vendor`: Recharts
  - Route-based chunks
- **Asset Optimization**: Image optimization, CSS minification
- **Console Removal**: Drop console.log in production
- **Source Maps**: Disabled in production (optional)

#### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js       # Main application bundle
│   ├── react-vendor-[hash].js # React libraries
│   ├── ui-vendor-[hash].js    # UI libraries
│   ├── chart-vendor-[hash].js # Chart libraries
│   └── [route]-[hash].js      # Route-specific chunks
├── index.html
└── [other assets]
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes (Production) |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

### Deployment Considerations

1. **Static Hosting**: Can be deployed to any static hosting service
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - GitHub Pages

2. **Environment Configuration**: Set environment variables in hosting platform

3. **Routing**: Configure server to serve `index.html` for all routes (SPA routing)

4. **HTTPS**: Enforce HTTPS in production

5. **CDN**: Use CDN for static assets

---

## Security Architecture

### Current Security Measures

#### 1. **Authentication**
- JWT-based authentication
- Token storage in localStorage (⚠️ Consider httpOnly cookies)
- Automatic token refresh on 401 responses

#### 2. **API Security**
- Bearer token in Authorization header
- HTTPS enforcement (production)
- Request timeout (30 seconds)

#### 3. **Error Handling**
- Error boundaries for component crashes
- Global error handling in API interceptors
- User-friendly error messages

### Security Recommendations

#### 🔴 Critical (Before Production)
1. **Replace Mock Authentication**: Implement real JWT authentication
2. **Secure Token Storage**: Consider httpOnly cookies or secure storage
3. **Input Validation**: Sanitize all user inputs
4. **CSRF Protection**: Implement CSRF tokens
5. **Rate Limiting**: Add rate limiting on API calls
6. **XSS Prevention**: Sanitize rendered content
7. **Content Security Policy**: Implement CSP headers

#### 🟡 Important
1. **Environment Variables**: Don't expose sensitive data
2. **Error Messages**: Don't leak sensitive information
3. **Dependency Updates**: Keep dependencies updated
4. **Security Headers**: Implement security headers (HSTS, X-Frame-Options, etc.)

---

## Performance Optimizations

### Current Optimizations

#### 1. **Code Splitting**
- Route-based code splitting with React.lazy()
- Vendor chunk splitting (React, UI libraries, Charts)
- Dynamic imports for large components

#### 2. **Caching**
- In-memory API response caching (30s TTL)
- Browser caching for static assets
- localStorage for user data persistence

#### 3. **Rendering Optimizations**
- React.memo() for expensive components
- Suspense boundaries for loading states
- Virtual scrolling (where applicable)

#### 4. **Bundle Optimization**
- Tree shaking
- Minification
- Compression (gzip/brotli)

#### 5. **Lazy Loading**
- Images (lazy loading)
- Route components (code splitting)
- Heavy libraries (on-demand loading)

### Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Initial Load | < 3s | ✅ Optimized |
| Time to Interactive | < 5s | ✅ Optimized |
| Bundle Size | < 500KB | ✅ Optimized (with code splitting) |
| Lighthouse Score | > 90 | ⚠️ To be measured |

### Performance Recommendations

1. **Image Optimization**: Use WebP format, responsive images
2. **Service Worker**: Implement for offline support
3. **Preloading**: Preload critical routes
4. **Memoization**: Use useMemo/useCallback where needed
5. **Virtual Scrolling**: For large lists (> 100 items)

---

## Future Considerations

### Short-term Enhancements

1. **Backend Integration**
   - Complete API integration
   - Real authentication system
   - Database connectivity

2. **Testing**
   - Unit tests (Jest + React Testing Library)
   - Integration tests
   - E2E tests (Cypress/Playwright)

3. **Error Handling**
   - Comprehensive error boundaries
   - Error logging service (Sentry)
   - User-friendly error pages

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

### Medium-term Enhancements

1. **State Management**
   - Consider Redux/Zustand for complex state
   - React Query for server state

2. **Real-time Features**
   - WebSocket integration
   - Real-time notifications
   - Live updates

3. **PWA Support**
   - Service worker
   - Offline support
   - Install prompt

4. **Internationalization**
   - i18n support (react-i18next)
   - Multi-language support

### Long-term Enhancements

1. **Microservices Architecture**
   - Split into microservices
   - API gateway
   - Service mesh

2. **Advanced AI Features**
   - ML-based recommendations
   - Predictive analytics
   - Automated report generation

3. **Mobile App**
   - React Native mobile app
   - Shared business logic
   - Platform-specific optimizations

4. **Advanced Analytics**
   - Business intelligence dashboard
   - Custom report builder
   - Data export capabilities

---

## Architecture Diagrams

### Component Dependency Graph

```
App.jsx
├── Router
│   ├── LabManagementLayout
│   │   ├── Navigation
│   │   ├── Header
│   │   └── Outlet
│   │       └── [Page Components]
│   │           ├── Dashboard
│   │           ├── Customers
│   │           └── ...
│   │
│   └── ErrorBoundary
│
├── LabManagementAuthProvider
│   └── LabDataProvider
│
└── Toaster (Notifications)
```

### Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Page Component │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────────┐
│  Service Layer  │─────▶│   API Service    │
└─────────────────┘      └────────┬─────────┘
       │                          │
       │                          ▼
       │                  ┌───────────────┐
       │                  │  Backend API  │
       │                  └───────────────┘
       │
       ▼
┌─────────────────┐
│   Context API   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Component State│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      UI         │
└─────────────────┘
```

---

## Appendix

### Key Files Reference

| File | Purpose |
|------|---------|
| `src/main.jsx` | Application entry point |
| `src/App.jsx` | Root component with routing |
| `src/services/labManagementApi.js` | API service layer |
| `src/contexts/LabManagementAuthContext.jsx` | Authentication context |
| `src/contexts/LabDataContext.jsx` | Global data context |
| `src/layouts/LabManagementLayout.jsx` | Main layout component |
| `vite.config.js` | Build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

### Dependencies Summary

- **Core**: React, React DOM, React Router DOM
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Animation**: Framer Motion
- **HTTP**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **UI Components**: Headless UI
- **Utilities**: date-fns, clsx
- **Build Tool**: Vite

### Related Documentation

- **`BACKEND_ARCHITECTURE_FASTAPI.md`**: Comprehensive FastAPI backend architecture guide with implementation details, database design, and deployment recommendations.

---

**Document Version**: 1.1  
**Last Updated**: 2024  
**Maintained By**: Development Team


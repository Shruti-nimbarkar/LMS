import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import { LabDataProvider } from './contexts/LabDataContext'
import { LabManagementAuthProvider, useLabManagementAuth } from './contexts/LabManagementAuthContext'
import LabManagementLayout from './layouts/LabManagementLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { ChatbotWidget } from './components/chatbot'

// Lazy load lab management pages for better performance
const LabManagementDashboard = lazy(() => import('./pages/lab/management/Dashboard'))
const LabManagementOrganizationDetails = lazy(() => import('./pages/lab/management/OrganizationDetails'))
const LabManagementScopeManagement = lazy(() => import('./pages/lab/management/ScopeManagement'))
const LabManagementCustomers = lazy(() => import('./pages/lab/management/Customers'))
const LabManagementProjects = lazy(() => import('./pages/lab/management/Projects'))
const LabManagementRFQs = lazy(() => import('./pages/lab/management/RFQs'))
const LabManagementEstimations = lazy(() => import('./pages/lab/management/Estimations'))
const LabManagementTestPlans = lazy(() => import('./pages/lab/management/TestPlans'))
const LabManagementTestExecutions = lazy(() => import('./pages/lab/management/TestExecutions'))
const LabManagementTestResults = lazy(() => import('./pages/lab/management/TestResults'))
const LabManagementSamples = lazy(() => import('./pages/lab/management/Samples'))
const LabManagementTRFs = lazy(() => import('./pages/lab/management/TRFs'))
const LabManagementDocuments = lazy(() => import('./pages/lab/management/Documents'))
const LabManagementReports = lazy(() => import('./pages/lab/management/Reports'))
const LabManagementAudits = lazy(() => import('./pages/lab/management/Audits'))
const LabManagementNCRs = lazy(() => import('./pages/lab/management/NCRs'))
const LabManagementCertifications = lazy(() => import('./pages/lab/management/Certifications'))
const ProjectDetail = lazy(() => import('./pages/lab/management/ProjectDetail'))
const PlaceholderPage = lazy(() => import('./pages/lab/management/PlaceholderPage'))
const LabManagementCalendar = lazy(() => import('./pages/lab/management/Calendar'))
const LabManagementRecommendations = lazy(() => import('./pages/lab/management/LabRecommendations'))
const Inventory = lazy(() => import('./pages/lab/management/Inventory'))
const InventoryInstruments = lazy(() => import('./pages/lab/management/InventoryInstruments'))
const InventoryCalibration = lazy(() => import('./pages/lab/management/InventoryCalibration'))
const InventoryConsumables = lazy(() => import('./pages/lab/management/InventoryConsumables'))
const InventoryTransactions = lazy(() => import('./pages/lab/management/InventoryTransactions'))
const InventoryReports = lazy(() => import('./pages/lab/management/InventoryReports'))
const QualityAssurance = lazy(() => import('./pages/lab/management/QualityAssurance'))
const QASOPManagement = lazy(() => import('./pages/lab/management/QASOPManagement'))
const QAQCChecks = lazy(() => import('./pages/lab/management/QAQCChecks'))
const QAAuditCompliance = lazy(() => import('./pages/lab/management/QAAuditCompliance'))
const QANCCAPA = lazy(() => import('./pages/lab/management/QANCCAPA'))
const QADocumentControl = lazy(() => import('./pages/lab/management/QADocumentControl'))
const QAAReports = lazy(() => import('./pages/lab/management/QAAReports'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/lab/management/dashboard" replace />} />
        
        {/* Lab Management System */}
        <Route path="/lab/management" element={<LabManagementLayout />}>
          <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><LabManagementDashboard /></Suspense>} />
          <Route path="organization" element={<Suspense fallback={<PageLoader />}><LabManagementOrganizationDetails /></Suspense>} />
          <Route path="scope-management" element={<Suspense fallback={<PageLoader />}><LabManagementScopeManagement /></Suspense>} />
          <Route path="customers" element={<Suspense fallback={<PageLoader />}><LabManagementCustomers /></Suspense>} />
          <Route path="rfqs" element={<Suspense fallback={<PageLoader />}><LabManagementRFQs /></Suspense>} />
          <Route path="estimations" element={<Suspense fallback={<PageLoader />}><LabManagementEstimations /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<PageLoader />}><LabManagementProjects /></Suspense>} />
          <Route path="projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>} />
          <Route path="test-plans" element={<Suspense fallback={<PageLoader />}><LabManagementTestPlans /></Suspense>} />
          <Route path="test-plans/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="Test Plan Details" description="Detailed test plan information" /></Suspense>} />
          <Route path="test-executions" element={<Suspense fallback={<PageLoader />}><LabManagementTestExecutions /></Suspense>} />
          <Route path="test-executions/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="Test Execution Details" description="Detailed test execution information" /></Suspense>} />
          <Route path="test-results" element={<Suspense fallback={<PageLoader />}><LabManagementTestResults /></Suspense>} />
          <Route path="test-results/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="Test Result Details" description="Detailed test result information" /></Suspense>} />
          <Route path="samples" element={<Suspense fallback={<PageLoader />}><LabManagementSamples /></Suspense>} />
          <Route path="samples/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="Sample Details" description="Detailed sample information" /></Suspense>} />
          <Route path="trfs" element={<Suspense fallback={<PageLoader />}><LabManagementTRFs /></Suspense>} />
          <Route path="trfs/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="TRF Details" description="Detailed TRF information" /></Suspense>} />
          <Route path="documents" element={<Suspense fallback={<PageLoader />}><LabManagementDocuments /></Suspense>} />
          <Route path="documents/:id" element={<Suspense fallback={<PageLoader />}><PlaceholderPage title="Document Details" description="Detailed document information" /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<PageLoader />}><LabManagementReports /></Suspense>} />
          <Route path="audits" element={<Suspense fallback={<PageLoader />}><LabManagementAudits /></Suspense>} />
          <Route path="ncrs" element={<Suspense fallback={<PageLoader />}><LabManagementNCRs /></Suspense>} />
          <Route path="certifications" element={<Suspense fallback={<PageLoader />}><LabManagementCertifications /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<PageLoader />}><LabManagementCalendar /></Suspense>} />
          <Route path="lab-recommendations" element={<Suspense fallback={<PageLoader />}><LabManagementRecommendations /></Suspense>} />
          
          {/* Inventory Management */}
          <Route path="inventory" element={<Suspense fallback={<PageLoader />}><Inventory /></Suspense>} />
          <Route path="inventory/instruments" element={<Suspense fallback={<PageLoader />}><InventoryInstruments /></Suspense>} />
          <Route path="inventory/calibration" element={<Suspense fallback={<PageLoader />}><InventoryCalibration /></Suspense>} />
          <Route path="inventory/consumables" element={<Suspense fallback={<PageLoader />}><InventoryConsumables /></Suspense>} />
          <Route path="inventory/transactions" element={<Suspense fallback={<PageLoader />}><InventoryTransactions /></Suspense>} />
          <Route path="inventory/reports" element={<Suspense fallback={<PageLoader />}><InventoryReports /></Suspense>} />
          <Route path="qa" element={<Suspense fallback={<PageLoader />}><QualityAssurance /></Suspense>} />
          <Route path="qa/sop" element={<Suspense fallback={<PageLoader />}><QASOPManagement /></Suspense>} />
          <Route path="qa/qc" element={<Suspense fallback={<PageLoader />}><QAQCChecks /></Suspense>} />
          <Route path="qa/audit" element={<Suspense fallback={<PageLoader />}><QAAuditCompliance /></Suspense>} />
          <Route path="qa/nc-capa" element={<Suspense fallback={<PageLoader />}><QANCCAPA /></Suspense>} />
          <Route path="qa/documents" element={<Suspense fallback={<PageLoader />}><QADocumentControl /></Suspense>} />
          <Route path="qa/reports" element={<Suspense fallback={<PageLoader />}><QAAReports /></Suspense>} />
        </Route>
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/lab/management/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { user } = useLabManagementAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Chatbot configuration
  const chatbotConfig = {
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/v1/chat',
    theme: 'light',
    position: 'bottom-right',
    enabled: import.meta.env.VITE_CHATBOT_ENABLED !== 'false',
    branding: {
      name: 'Lab Assistant',
      welcomeMessage: 'Hi! How can I help you with the Lab Management System?',
    },
  }

  const chatbotContext = {
    userId: user?.id?.toString() || '1',
    userRole: user?.role || 'engineer',
    currentPage: location.pathname,
    permissions: user?.permissions || [],
  }

  const handleChatbotAction = (action) => {
    switch (action.type) {
      case 'navigate':
        if (action.path) {
          navigate(action.path)
        }
        break
      case 'openModal':
        // Handle modal opening if needed
        console.log('Open modal:', action.modal, action.data)
        break
      case 'refresh':
        // Handle component refresh if needed
        window.location.reload()
        break
      default:
        console.log('Chatbot action:', action)
    }
  }

  const handleChatbotError = (error) => {
    console.error('Chatbot error:', error)
    // Could show toast notification here
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      <Toaster position="top-right" />
      
      {/* Chatbot Widget - Plugged in */}
      <ChatbotWidget
        apiUrl={chatbotConfig.apiUrl}
        config={chatbotConfig}
        context={chatbotContext}
        onAction={handleChatbotAction}
        onError={handleChatbotError}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <LabManagementAuthProvider>
        <LabDataProvider>
          <Router>
            <AppContent />
          </Router>
        </LabDataProvider>
      </LabManagementAuthProvider>
    </ErrorBoundary>
  )
}

export default App

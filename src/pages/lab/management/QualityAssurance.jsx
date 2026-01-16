import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  ClipboardCheck, 
  AlertTriangle,
  FolderOpen,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import Card from '../../../components/labManagement/Card'

function QualityAssurance() {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'sop',
      title: 'SOP Management',
      description: 'Upload, version, and manage Standard Operating Procedures',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      route: '/lab/management/qa/sop',
      stats: { total: 12, active: 10, underReview: 2 }
    },
    {
      id: 'qc',
      title: 'Quality Control Checks',
      description: 'Define QC parameters and track test results with trend analysis',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      route: '/lab/management/qa/qc',
      stats: { total: 8, passing: 7, failing: 1 }
    },
    {
      id: 'audit',
      title: 'Audit & Compliance',
      description: 'Manage internal and external audits with findings tracking',
      icon: ClipboardCheck,
      color: 'from-purple-500 to-purple-600',
      route: '/lab/management/qa/audit',
      stats: { total: 5, completed: 3, inProgress: 2 }
    },
    {
      id: 'nc-capa',
      title: 'Non-Conformance & CAPA',
      description: 'Track non-conformances and corrective/preventive actions',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      route: '/lab/management/qa/nc-capa',
      stats: { open: 2, inProgress: 1, closed: 15 }
    },
    {
      id: 'documents',
      title: 'Document Control',
      description: 'Central repository for policies, certificates, and reports',
      icon: FolderOpen,
      color: 'from-indigo-500 to-indigo-600',
      route: '/lab/management/qa/documents',
      stats: { total: 45, locked: 12, active: 33 }
    },
    {
      id: 'reports',
      title: 'QA Reports & Alerts',
      description: 'Compliance dashboard, alerts, and audit readiness reports',
      icon: BarChart3,
      color: 'from-teal-500 to-teal-600',
      route: '/lab/management/qa/reports',
      stats: { compliance: 87.5, alerts: 3 }
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Quality Assurance
          </h1>
          <p className="text-gray-600 mt-1">Compliance, accuracy, and audit readiness management</p>
        </div>
      </motion.div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card
                hover
                className="cursor-pointer h-full flex flex-col"
                onClick={() => navigate(section.route)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {section.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    {section.id === 'sop' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-green-600">Active: {section.stats.active}</span>
                      </>
                    )}
                    {section.id === 'qc' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-red-600">Failing: {section.stats.failing}</span>
                      </>
                    )}
                    {section.id === 'audit' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-blue-600">In Progress: {section.stats.inProgress}</span>
                      </>
                    )}
                    {section.id === 'nc-capa' && (
                      <>
                        <span className="text-gray-500">Open: <span className="font-semibold text-gray-900">{section.stats.open}</span></span>
                        <span className="text-green-600">Closed: {section.stats.closed}</span>
                      </>
                    )}
                    {section.id === 'documents' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-blue-600">Active: {section.stats.active}</span>
                      </>
                    )}
                    {section.id === 'reports' && (
                      <>
                        <span className="text-gray-500">Compliance: <span className="font-semibold text-gray-900">{section.stats.compliance}%</span></span>
                        <span className="text-orange-600">Alerts: {section.stats.alerts}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default QualityAssurance

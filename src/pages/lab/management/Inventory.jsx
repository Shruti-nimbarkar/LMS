import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  Wrench, 
  Calendar, 
  ShoppingCart, 
  BarChart3,
  ChevronRight
} from 'lucide-react'
import Card from '../../../components/labManagement/Card'
import Button from '../../../components/labManagement/Button'

function Inventory() {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'instruments',
      title: 'Instruments Management',
      description: 'Manage lab instruments, track maintenance, and warranty information',
      icon: Wrench,
      color: 'from-blue-500 to-blue-600',
      route: '/lab/management/inventory/instruments',
      stats: { total: 12, active: 10, maintenance: 2 }
    },
    {
      id: 'calibration',
      title: 'Calibration Management',
      description: 'Track calibration schedules, certificates, and compliance',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      route: '/lab/management/inventory/calibration',
      stats: { total: 12, valid: 10, dueSoon: 2 }
    },
    {
      id: 'consumables',
      title: 'Accessories & Consumables',
      description: 'Manage consumables, track stock levels, and expiry dates',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      route: '/lab/management/inventory/consumables',
      stats: { total: 45, lowStock: 3, expiring: 2 }
    },
    {
      id: 'transactions',
      title: 'Inventory Transactions',
      description: 'Log stock usage, additions, and wastage with audit trail',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      route: '/lab/management/inventory/transactions',
      stats: { today: 5, thisWeek: 23, thisMonth: 89 }
    },
    {
      id: 'reports',
      title: 'Reports & Dashboard',
      description: 'View inventory summaries, compliance reports, and analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      route: '/lab/management/inventory/reports',
      stats: { compliance: 83.3, utilization: 75.2 }
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
              <Package className="w-6 h-6 text-white" />
            </div>
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive inventory tracking and management system</p>
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
                    {section.id === 'instruments' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-green-600">Active: {section.stats.active}</span>
                      </>
                    )}
                    {section.id === 'calibration' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-yellow-600">Due Soon: {section.stats.dueSoon}</span>
                      </>
                    )}
                    {section.id === 'consumables' && (
                      <>
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{section.stats.total}</span></span>
                        <span className="text-orange-600">Low Stock: {section.stats.lowStock}</span>
                      </>
                    )}
                    {section.id === 'transactions' && (
                      <>
                        <span className="text-gray-500">Today: <span className="font-semibold text-gray-900">{section.stats.today}</span></span>
                        <span className="text-blue-600">This Month: {section.stats.thisMonth}</span>
                      </>
                    )}
                    {section.id === 'reports' && (
                      <>
                        <span className="text-gray-500">Compliance: <span className="font-semibold text-gray-900">{section.stats.compliance}%</span></span>
                        <span className="text-green-600">Utilization: {section.stats.utilization}%</span>
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

export default Inventory

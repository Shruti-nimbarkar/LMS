import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Play, CheckCircle, Clock, User, ExternalLink } from 'lucide-react'
import { testExecutionsService } from '../../../services/labManagementApi'
import { testPlansService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Card from '../../../components/labManagement/Card'
import Button from '../../../components/labManagement/Button'
import Badge from '../../../components/labManagement/Badge'
import Input from '../../../components/labManagement/Input'
import Modal from '../../../components/labManagement/Modal'
import CreateTestExecutionForm from '../../../components/labManagement/forms/CreateTestExecutionForm'

function TestExecutions() {
  const [executions, setExecutions] = useState([])
  const [testPlans, setTestPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const testPlanId = searchParams.get('testPlanId')

  useEffect(() => {
    loadTestPlans()
    loadExecutions()
  }, [])

  const loadTestPlans = async () => {
    try {
      const data = await testPlansService.getAll()
      setTestPlans(data)
    } catch (error) {
      toast.error('Failed to load test plans')
    }
  }

  const loadExecutions = async () => {
    try {
      setLoading(true)
      if (testPlanId) {
        const data = await testExecutionsService.getByTestPlan(parseInt(testPlanId))
        setExecutions(data)
        setSelectedPlan(testPlanId)
      } else {
        const allPlans = await testPlansService.getAll()
        const allExecutions = []
        for (const plan of allPlans) {
          try {
            const execs = await testExecutionsService.getByTestPlan(plan.id)
            allExecutions.push(...execs)
          } catch (error) {
            // Ignore errors for plans without executions
          }
        }
        setExecutions(allExecutions)
      }
    } catch (error) {
      toast.error('Failed to load test executions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      passed: 'success',
      'meet compliance': 'success',
      'doesn\'t meet compliance': 'danger'
    }
    return colors[status?.toLowerCase()] || 'default'
  }

  const filteredExecutions = executions.filter(exec => {
    const matchesSearch = exec.id?.toString().includes(searchTerm.toLowerCase())
    const matchesPlan = selectedPlan === 'all' || exec.testPlanId?.toString() === selectedPlan
    const matchesStatus = selectedStatus === 'all' || exec.status?.toLowerCase() === selectedStatus.toLowerCase()
    // Also filter by testPlanId from URL if present
    const matchesUrlPlan = !testPlanId || exec.testPlanId?.toString() === testPlanId
    return matchesSearch && matchesPlan && matchesStatus && matchesUrlPlan
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading test executions...</p>
        </div>
      </div>
    )
  }

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
              <Play className="w-6 h-6 text-white" />
            </div>
            Test Executions
          </h1>
          <p className="text-gray-600 mt-1">Track and manage test execution progress</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          New Execution
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search executions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Test Plans</option>
            {testPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="passed">Passed</option>
            <option value="meet compliance">Meet Compliance</option>
            <option value="doesn't meet compliance">Doesn't Meet Compliance</option>
          </select>
        </div>
      </Card>

      {/* Executions Grid */}
      {filteredExecutions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No test executions found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first test execution to get started</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExecutions.map((execution, index) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card
                hover
                className="cursor-pointer h-full flex flex-col"
                onClick={() => navigate(`/lab/management/test-executions/${execution.id}`)}
              >
                {execution.testPlanId && (
                  <div className="mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/lab/management/test-plans/${execution.testPlanId}`)
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Test Plan
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Execution #{execution.id}
                </h3>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(execution.executionDate).toLocaleDateString()}
                  </div>
                  
                  {execution.executedByName && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      {execution.executedByName}
                    </div>
                  )}
                  
                  {(execution.status?.toLowerCase() === 'completed' || execution.status?.toLowerCase() === 'passed' || execution.status?.toLowerCase() === 'meet compliance') && (
                    <div className="flex items-center text-sm text-green-600 mt-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {execution.status}
                    </div>
                  )}
                  
                  {(execution.status?.toLowerCase() === 'completed' || execution.status?.toLowerCase() === 'passed' || execution.status?.toLowerCase() === 'meet compliance' || execution.status?.toLowerCase() === 'doesn\'t meet compliance') && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/lab/management/test-results?executionId=${execution.id}`)
                        }}
                        className="text-xs text-primary hover:underline w-full text-left"
                      >
                        View Results →
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Test Execution"
        size="lg"
      >
        <CreateTestExecutionForm
          testPlanId={testPlanId ? parseInt(testPlanId) : undefined}
          onSuccess={() => {
            setShowCreateModal(false)
            loadExecutions()
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}

export default TestExecutions

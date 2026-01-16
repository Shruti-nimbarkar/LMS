import { useState, useEffect } from 'react'
import { testExecutionsService } from '../../../services/labManagementApi'
import { testPlansService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateTestExecutionForm({ testPlanId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    testPlanId: testPlanId || 0,
    executionDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [testPlans, setTestPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(!testPlanId)

  useEffect(() => {
    if (!testPlanId) {
      loadTestPlans()
    }
  }, [testPlanId])

  const loadTestPlans = async () => {
    try {
      setLoadingPlans(true)
      const data = await testPlansService.getAll()
      setTestPlans(data)
    } catch (error) {
      toast.error('Failed to load test plans')
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.testPlanId) {
      toast.error('Please select a test plan')
      return
    }

    try {
      setLoading(true)
      await testExecutionsService.create(formData)
      toast.success('Test execution created successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create test execution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!testPlanId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Plan <span className="text-red-500">*</span>
          </label>
          {loadingPlans ? (
            <div className="text-sm text-gray-500">Loading test plans...</div>
          ) : (
            <select
              value={formData.testPlanId}
              onChange={(e) => setFormData({ ...formData, testPlanId: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value={0}>Select a test plan</option>
              {testPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.testType}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <Input
        label="Execution Date"
        type="date"
        value={formData.executionDate}
        onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the execution"
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1"
        >
          Create Execution
        </Button>
      </div>
    </form>
  )
}

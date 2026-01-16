import { useState } from 'react'
import { qcService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateQCForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    qcId: '',
    testName: '',
    parameter: '',
    targetValue: '',
    acceptanceRangeMin: '',
    acceptanceRangeMax: '',
    unit: '',
    frequency: 'Daily'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.testName || !formData.parameter || !formData.targetValue || !formData.acceptanceRangeMin || !formData.acceptanceRangeMax) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        acceptanceRange: {
          min: parseFloat(formData.acceptanceRangeMin),
          max: parseFloat(formData.acceptanceRangeMax)
        }
      }
      delete submitData.acceptanceRangeMin
      delete submitData.acceptanceRangeMax
      
      await qcService.create(submitData)
      toast.success('QC check created successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create QC check')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="QC ID"
          value={formData.qcId}
          onChange={(e) => setFormData({ ...formData, qcId: e.target.value })}
          placeholder="QC-001"
        />
        <Input
          label="Test Name"
          value={formData.testName}
          onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
          placeholder="EMC Compliance Test"
          required
        />
        <Input
          label="Parameter"
          value={formData.parameter}
          onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
          placeholder="Emission Level"
          required
        />
        <Input
          label="Target Value"
          type="number"
          step="0.01"
          value={formData.targetValue}
          onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
          placeholder="50"
          required
        />
        <Input
          label="Acceptance Range (Min)"
          type="number"
          step="0.01"
          value={formData.acceptanceRangeMin}
          onChange={(e) => setFormData({ ...formData, acceptanceRangeMin: e.target.value })}
          placeholder="45"
          required
        />
        <Input
          label="Acceptance Range (Max)"
          type="number"
          step="0.01"
          value={formData.acceptanceRangeMax}
          onChange={(e) => setFormData({ ...formData, acceptanceRangeMax: e.target.value })}
          placeholder="55"
          required
        />
        <Input
          label="Unit"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          placeholder="dBµV/m"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
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
          Create QC Check
        </Button>
      </div>
    </form>
  )
}

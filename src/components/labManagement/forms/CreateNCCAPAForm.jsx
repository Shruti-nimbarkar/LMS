import { useState, useEffect } from 'react'
import { ncCapaService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateNCCAPAForm({ ncCapa, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    ncId: '',
    description: '',
    impactedArea: '',
    severity: 'Medium',
    rootCause: '',
    actionOwner: '',
    dueDate: '',
    status: 'Open',
    correctiveAction: '',
    preventiveAction: '',
    linkedAudit: '',
    linkedTest: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ncCapa) {
      setFormData({
        ncId: ncCapa.ncId || '',
        description: ncCapa.description || '',
        impactedArea: ncCapa.impactedArea || '',
        severity: ncCapa.severity || 'Medium',
        rootCause: ncCapa.rootCause || '',
        actionOwner: ncCapa.actionOwner || '',
        dueDate: ncCapa.dueDate || '',
        status: ncCapa.status || 'Open',
        correctiveAction: ncCapa.correctiveAction || '',
        preventiveAction: ncCapa.preventiveAction || '',
        linkedAudit: ncCapa.linkedAudit || '',
        linkedTest: ncCapa.linkedTest || ''
      })
    }
  }, [ncCapa])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.description || !formData.impactedArea || !formData.actionOwner || !formData.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (ncCapa) {
        await ncCapaService.update(ncCapa.id, formData)
        toast.success('NC/CAPA updated successfully!')
      } else {
        await ncCapaService.create(formData)
        toast.success('NC/CAPA created successfully!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save NC/CAPA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="NC ID"
          value={formData.ncId}
          onChange={(e) => setFormData({ ...formData, ncId: e.target.value })}
          placeholder="NC-2024-001"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the non-conformance"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
        </div>
        <Input
          label="Impacted Area"
          value={formData.impactedArea}
          onChange={(e) => setFormData({ ...formData, impactedArea: e.target.value })}
          placeholder="EMC Testing"
          required
        />
        <Input
          label="Action Owner"
          value={formData.actionOwner}
          onChange={(e) => setFormData({ ...formData, actionOwner: e.target.value })}
          placeholder="John Doe"
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Root Cause <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.rootCause}
            onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
            placeholder="Describe the root cause"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corrective Action <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.correctiveAction}
            onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
            placeholder="Describe the corrective action"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preventive Action
          </label>
          <textarea
            value={formData.preventiveAction}
            onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
            placeholder="Describe the preventive action"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>
        <Input
          label="Linked Audit (optional)"
          value={formData.linkedAudit}
          onChange={(e) => setFormData({ ...formData, linkedAudit: e.target.value })}
          placeholder="AUD-2024-001"
        />
        <Input
          label="Linked Test (optional)"
          value={formData.linkedTest}
          onChange={(e) => setFormData({ ...formData, linkedTest: e.target.value })}
          placeholder="QC-003"
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
          {ncCapa ? 'Update NC/CAPA' : 'Create NC/CAPA'}
        </Button>
      </div>
    </form>
  )
}

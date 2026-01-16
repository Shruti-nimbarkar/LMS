import { useState } from 'react'
import { auditService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateQAAuditForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    auditId: '',
    auditType: 'Internal',
    date: '',
    auditorName: '',
    auditorOrganization: '',
    scope: '',
    status: 'Scheduled',
    findings: []
  })
  const [loading, setLoading] = useState(false)
  const [newFinding, setNewFinding] = useState({ description: '', severity: 'Minor', status: 'Open' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.date || !formData.auditorName || !formData.scope) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        ...formData,
        totalFindings: formData.findings.length,
        openFindings: formData.findings.filter(f => f.status === 'Open').length,
        closedFindings: formData.findings.filter(f => f.status === 'Closed').length
      }
      await auditService.create(submitData)
      toast.success('Audit created successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create audit')
    } finally {
      setLoading(false)
    }
  }

  const addFinding = () => {
    if (!newFinding.description) {
      toast.error('Please enter a finding description')
      return
    }
    setFormData({
      ...formData,
      findings: [...formData.findings, { ...newFinding, id: Date.now() }]
    })
    setNewFinding({ description: '', severity: 'Minor', status: 'Open' })
  }

  const removeFinding = (id) => {
    setFormData({
      ...formData,
      findings: formData.findings.filter(f => f.id !== id)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Audit ID"
          value={formData.auditId}
          onChange={(e) => setFormData({ ...formData, auditId: e.target.value })}
          placeholder="AUD-2024-001"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audit Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.auditType}
            onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <Input
          label="Auditor Name"
          value={formData.auditorName}
          onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
          placeholder="Dr. John Smith"
          required
        />
        <Input
          label="Auditor Organization"
          value={formData.auditorOrganization}
          onChange={(e) => setFormData({ ...formData, auditorOrganization: e.target.value })}
          placeholder="Internal QA Team"
        />
        <Input
          label="Scope"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          placeholder="EMC Testing Department"
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
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Findings Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Findings
        </label>
        <div className="space-y-2 mb-2">
          {formData.findings.map((finding, index) => (
            <div key={finding.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{finding.description}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-gray-500">Severity: {finding.severity}</span>
                  <span className="text-xs text-gray-500">Status: {finding.status}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFinding(finding.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            value={newFinding.description}
            onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
            placeholder="Finding description"
            className="md:col-span-2"
          />
          <select
            value={newFinding.severity}
            onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical">Critical</option>
          </select>
          <Button type="button" onClick={addFinding} variant="outline">
            Add Finding
          </Button>
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
          Create Audit
        </Button>
      </div>
    </form>
  )
}

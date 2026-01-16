import { useState, useEffect } from 'react'
import { sopService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateSOPForm({ sop, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    sopId: '',
    title: '',
    category: 'Testing',
    version: '1.0',
    effectiveDate: '',
    approvedBy: '',
    status: 'Active',
    linkedTests: [],
    linkedInstruments: [],
    linkedDepartments: [],
    documentUrl: null,
    nextReviewDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [linkedTestsInput, setLinkedTestsInput] = useState('')
  const [linkedInstrumentsInput, setLinkedInstrumentsInput] = useState('')
  const [linkedDepartmentsInput, setLinkedDepartmentsInput] = useState('')

  useEffect(() => {
    if (sop) {
      setFormData({
        sopId: sop.sopId || '',
        title: sop.title || '',
        category: sop.category || 'Testing',
        version: sop.version || '1.0',
        effectiveDate: sop.effectiveDate || '',
        approvedBy: sop.approvedBy || '',
        status: sop.status || 'Active',
        linkedTests: sop.linkedTests || [],
        linkedInstruments: sop.linkedInstruments || [],
        linkedDepartments: sop.linkedDepartments || [],
        documentUrl: sop.documentUrl || null,
        nextReviewDate: sop.nextReviewDate || ''
      })
      setLinkedTestsInput(sop.linkedTests?.join(', ') || '')
      setLinkedInstrumentsInput(sop.linkedInstruments?.join(', ') || '')
      setLinkedDepartmentsInput(sop.linkedDepartments?.join(', ') || '')
    }
  }, [sop])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.effectiveDate || !formData.approvedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        ...formData,
        linkedTests: linkedTestsInput.split(',').map(t => t.trim()).filter(t => t),
        linkedInstruments: linkedInstrumentsInput.split(',').map(i => i.trim()).filter(i => i),
        linkedDepartments: linkedDepartmentsInput.split(',').map(d => d.trim()).filter(d => d)
      }
      
      if (sop) {
        await sopService.update(sop.id, submitData)
        toast.success('SOP updated successfully!')
      } else {
        await sopService.create(submitData)
        toast.success('SOP created successfully!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save SOP')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB')
        return
      }
      setFormData({ ...formData, documentUrl: file })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SOP ID"
          value={formData.sopId}
          onChange={(e) => setFormData({ ...formData, sopId: e.target.value })}
          placeholder="SOP-001"
        />
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="EMC Testing Procedure"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Testing">Testing</option>
            <option value="Calibration">Calibration</option>
            <option value="Sample Management">Sample Management</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Safety">Safety</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <Input
          label="Version"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          placeholder="1.0"
        />
        <Input
          label="Effective Date"
          type="date"
          value={formData.effectiveDate}
          onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
          required
        />
        <Input
          label="Next Review Date"
          type="date"
          value={formData.nextReviewDate}
          onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
        />
        <Input
          label="Approved By"
          value={formData.approvedBy}
          onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
          placeholder="Dr. John Smith"
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
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Obsolete">Obsolete</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Linked Tests (comma-separated)
        </label>
        <Input
          value={linkedTestsInput}
          onChange={(e) => setLinkedTestsInput(e.target.value)}
          placeholder="EMC Compliance Test, RF Emission Test"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Linked Instruments (comma-separated)
        </label>
        <Input
          value={linkedInstrumentsInput}
          onChange={(e) => setLinkedInstrumentsInput(e.target.value)}
          placeholder="INST-001, INST-002"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Linked Departments (comma-separated)
        </label>
        <Input
          value={linkedDepartmentsInput}
          onChange={(e) => setLinkedDepartmentsInput(e.target.value)}
          placeholder="EMC Testing, Quality Assurance"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SOP Document (PDF, max 10MB)
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {formData.documentUrl && (
          <p className="text-sm text-gray-500 mt-1">
            {formData.documentUrl.name || 'File selected'}
          </p>
        )}
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
          {sop ? 'Update SOP' : 'Create SOP'}
        </Button>
      </div>
    </form>
  )
}

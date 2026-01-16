import { useState, useEffect } from 'react'
import { instrumentsService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateInstrumentForm({ instrument, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    instrumentId: '',
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    labLocation: '',
    assignedDepartment: '',
    status: 'Active',
    purchaseDate: '',
    warrantyExpiry: '',
    serviceVendor: '',
    serviceVendorContact: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (instrument) {
      setFormData({
        instrumentId: instrument.instrumentId || '',
        name: instrument.name || '',
        manufacturer: instrument.manufacturer || '',
        model: instrument.model || '',
        serialNumber: instrument.serialNumber || '',
        labLocation: instrument.labLocation || '',
        assignedDepartment: instrument.assignedDepartment || '',
        status: instrument.status || 'Active',
        purchaseDate: instrument.purchaseDate || '',
        warrantyExpiry: instrument.warrantyExpiry || '',
        serviceVendor: instrument.serviceVendor || '',
        serviceVendorContact: instrument.serviceVendorContact || '',
        notes: instrument.notes || ''
      })
    }
  }, [instrument])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.manufacturer || !formData.model) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (instrument) {
        await instrumentsService.update(instrument.id, formData)
        toast.success('Instrument updated successfully!')
      } else {
        await instrumentsService.create(formData)
        toast.success('Instrument created successfully!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save instrument')
    } finally {
      setLoading(false)
    }
  }

  const departments = ['EMC Testing', 'RF Testing', 'Safety Testing', 'Environmental Testing', 'Quality Assurance']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Instrument ID"
          value={formData.instrumentId}
          onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
          placeholder="INST-001"
        />
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Spectrum Analyzer"
          required
        />
        <Input
          label="Manufacturer"
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          placeholder="Keysight Technologies"
          required
        />
        <Input
          label="Model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="N9020B"
          required
        />
        <Input
          label="Serial Number"
          value={formData.serialNumber}
          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          placeholder="US12345678"
        />
        <Input
          label="Lab Location"
          value={formData.labLocation}
          onChange={(e) => setFormData({ ...formData, labLocation: e.target.value })}
          placeholder="Lab A - Room 101"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Department
          </label>
          <select
            value={formData.assignedDepartment}
            onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
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
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
        />
        <Input
          label="Warranty Expiry"
          type="date"
          value={formData.warrantyExpiry}
          onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
        />
        <Input
          label="Service Vendor"
          value={formData.serviceVendor}
          onChange={(e) => setFormData({ ...formData, serviceVendor: e.target.value })}
          placeholder="Keysight Service Center"
        />
        <Input
          label="Service Vendor Contact"
          type="email"
          value={formData.serviceVendorContact}
          onChange={(e) => setFormData({ ...formData, serviceVendorContact: e.target.value })}
          placeholder="service@keysight.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the instrument"
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
          {instrument ? 'Update Instrument' : 'Create Instrument'}
        </Button>
      </div>
    </form>
  )
}

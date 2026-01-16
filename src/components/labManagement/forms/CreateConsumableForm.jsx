import { useState, useEffect } from 'react'
import { consumablesService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Button from '../Button'
import Input from '../Input'

export default function CreateConsumableForm({ consumable, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    itemId: '',
    category: 'Consumable',
    itemName: '',
    batchLotNumber: '',
    quantityAvailable: 0,
    unit: 'pieces',
    expiryDate: '',
    storageConditions: '',
    supplier: '',
    supplierContact: '',
    lowStockThreshold: 10,
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (consumable) {
      setFormData({
        itemId: consumable.itemId || '',
        category: consumable.category || 'Consumable',
        itemName: consumable.itemName || '',
        batchLotNumber: consumable.batchLotNumber || '',
        quantityAvailable: consumable.quantityAvailable || 0,
        unit: consumable.unit || 'pieces',
        expiryDate: consumable.expiryDate || '',
        storageConditions: consumable.storageConditions || '',
        supplier: consumable.supplier || '',
        supplierContact: consumable.supplierContact || '',
        lowStockThreshold: consumable.lowStockThreshold || 10,
        notes: consumable.notes || ''
      })
    }
  }, [consumable])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.itemName || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (consumable) {
        await consumablesService.update(consumable.id, formData)
        toast.success('Item updated successfully!')
      } else {
        await consumablesService.create(formData)
        toast.success('Item created successfully!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Item ID"
          value={formData.itemId}
          onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
          placeholder="CONS-001"
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
            <option value="Consumable">Consumable</option>
            <option value="Accessory">Accessory</option>
          </select>
        </div>
        <Input
          label="Item Name"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          placeholder="EMC Test Probes"
          required
        />
        <Input
          label="Batch/Lot Number"
          value={formData.batchLotNumber}
          onChange={(e) => setFormData({ ...formData, batchLotNumber: e.target.value })}
          placeholder="BATCH-2024-001"
        />
        <Input
          label="Quantity Available"
          type="number"
          value={formData.quantityAvailable}
          onChange={(e) => setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) || 0 })}
          min="0"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="pieces">Pieces</option>
            <option value="kits">Kits</option>
            <option value="boxes">Boxes</option>
            <option value="liters">Liters</option>
            <option value="kg">Kilograms</option>
            <option value="meters">Meters</option>
          </select>
        </div>
        <Input
          label="Expiry Date"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
        />
        <Input
          label="Storage Conditions"
          value={formData.storageConditions}
          onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
          placeholder="Room Temperature"
        />
        <Input
          label="Supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Test Equipment Suppliers"
        />
        <Input
          label="Supplier Contact"
          type="email"
          value={formData.supplierContact}
          onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
          placeholder="sales@supplier.com"
        />
        <Input
          label="Low Stock Threshold"
          type="number"
          value={formData.lowStockThreshold}
          onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
          min="0"
          placeholder="10"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the item"
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
          {consumable ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}

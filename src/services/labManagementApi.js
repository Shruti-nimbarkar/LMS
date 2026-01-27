import axios from 'axios'

// import axios from 'axios'
// VITE_API_URL=http://127.0.0.1:8000


// import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error('VITE_API_URL environment variable is required')
}

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.request.use(
      (config) => {
        const token =
          localStorage.getItem('labManagementAccessToken') ||
          localStorage.getItem('accessToken')

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken =
              localStorage.getItem('labManagementRefreshToken') ||
              localStorage.getItem('refreshToken')

            if (refreshToken) {
              const res = await axios.post(
                `${API_BASE_URL}/api/auth/refresh`,
                { refreshToken }
              )

              localStorage.setItem('labManagementAccessToken', res.data.accessToken)
              localStorage.setItem('labManagementRefreshToken', res.data.refreshToken)

              originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
              return this.client(originalRequest)
            }
          } catch (err) {
            localStorage.clear()
            window.location.href = '/'
            return Promise.reject(err)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get(url) {
    const res = await this.client.get(url)
    return res.data
  }

  async post(url, data) {
    const res = await this.client.post(url, data)
    return res.data
  }

  async put(url, data) {
    const res = await this.client.put(url, data)
    return res.data
  }

  async delete(url) {
    const res = await this.client.delete(url)
    return res.data
  }

  async patch(url, data) {
    const res = await this.client.patch(url, data)
    return res.data
  }
}

export const apiService = new ApiService()


// Mock data services for now - can be replaced with real API calls
const mockDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms))

// Simple cache mechanism
const cache = new Map()
const CACHE_TTL = 30000 // 30 seconds

const getCached = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() })
}

const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// Customers Service
// Customers Service (CONNECTED TO BACKEND)
// Customers Service (FINAL – aligned with frontend + backend)

export const customersService = {
  // 🔹 GET ALL CUSTOMERS
  getAll: async () => {
    const cacheKey = 'customers:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    const response = await apiService.get('/customers')

    // Backend returns ARRAY directly
    const customers = Array.isArray(response) ? response : []

    setCached(cacheKey, customers)
    return customers
  },

  // 🔹 CREATE CUSTOMER
  create: async (data) => {
    try {
      const response = await apiService.post('/customers', data)

      // Backend returns { customer: {...} }
      clearCache('customers:')

      return {
        success: true,
        data: response.customer,
      }
    } catch (error) {
      console.error('Create customer failed:', error)
      return {
        success: false,
        error: error?.response?.data || 'Failed to create customer',
      }
    }
  },
}

const response = await apiService.get('/customers')
console.log('🔥 API customers response:', response)



// RFQs Service
export const rfqsService = {
  getAll: async () => {
    const response = await apiService.get('/rfqs')
    return Array.isArray(response) ? response : []
  },

  create: async (data) => {
    const response = await apiService.post('/rfqs', data)
    return response.rfq
  },
}


// Estimations Service
// Estimations Service (CONNECTED TO BACKEND – FINAL)

export const estimationsService = {
  // 🔹 GET ALL ESTIMATIONS
  getAll: async () => {
    const cacheKey = 'estimations:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    const response = await apiService.get('/estimations')

    const estimations = Array.isArray(response) ? response : []

    setCached(cacheKey, estimations)
    return estimations
  },

  // 🔹 GET ESTIMATION BY ID (optional – future use)
  getById: async (id) => {
    return apiService.get(`/estimations/${id}`)
  },

  // 🔹 CREATE ESTIMATION
  create: async (data) => {
    try {
      const response = await apiService.post('/estimations', data)

      // clear cache so list reloads
      clearCache('estimations:')

      return response
    } catch (error) {
      console.error('Create estimation failed:', error)
      throw error
    }
  },

  // 🔹 TEST TYPES (STATIC – OK FOR NOW)
  getTestTypes: async () => {
    return [
      { id: 1, name: 'EMC Testing', hsnCode: '9030', defaultRate: 5000 },
      { id: 2, name: 'RF Testing', hsnCode: '9030', defaultRate: 6000 },
      { id: 3, name: 'Safety Testing', hsnCode: '9030', defaultRate: 4500 },
    ]
  },
}




// Projects Service
// Projects Service (CONNECTED TO BACKEND – FINAL)

export const projectsService = {
  // 🔹 GET ALL PROJECTS
  getAll: async () => {
    const cacheKey = 'projects:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    const response = await apiService.get('/projects')

    const projects = Array.isArray(response) ? response : []

    setCached(cacheKey, projects)
    return projects
  },

  // 🔹 GET PROJECT BY ID (for Project Details page – future use)
  getById: async (id) => {
    return apiService.get(`/projects/${id}`)
  },

  // 🔹 CREATE PROJECT
  create: async (data) => {
    try {
      const response = await apiService.post('/projects', data)

      // Clear cache so list refreshes
      clearCache('projects:')

      return response.project
    } catch (error) {
      console.error('Create project failed:', error)
      throw error
    }
  },
}


// Dashboard Service
export const dashboardService = {
  getSummary: async () => {
    const cacheKey = 'dashboard:summary'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = {
      instrumentStatuses: [
        { status: 'Active', count: 12 },
        { status: 'Maintenance', count: 2 },
        { status: 'Calibration', count: 1 },
      ],
      toDoItems: [
        { id: 1, title: 'Review Test Plan for PROJ-001', type: 'review', dueDate: '2024-01-25' },
        { id: 2, title: 'Complete Sample Analysis', type: 'analysis', dueDate: '2024-01-26' },
      ],
      billingProgress: {
        target: 5000000,
        current: 3200000,
        percentage: 64,
      },
    }
    setCached(cacheKey, data)
    return data
  },
}

// Export cache utilities for manual cache clearing
export { clearCache, setCached, getCached }

// Test Plans Service
export const testPlansService = {
  // 🔹 GET ALL TEST PLANS
  getAll: async () => {
    const response = await apiService.get('/test-plans')
    return Array.isArray(response) ? response : []
  },

  // 🔹 CREATE TEST PLAN
  create: async (data) => {
    const response = await apiService.post('/test-plans', data)

    if (!response?.success) {
      throw new Error('Test plan creation failed')
    }

    clearCache('test-plans:')
    return response.testPlan
  },

  // 🔹 GET BY ID
  getById: async (id) => {
    return apiService.get(`/test-plans/${id}`)
  },
}


// Test Executions Service
export const testExecutionsService = {
  // 🔹 GET BY TEST PLAN
  getByTestPlan: async (testPlanId) => {
    const response = await apiService.get(`/test-executions/by-test-plan/${testPlanId}`)
    return Array.isArray(response) ? response : []
  },

  // 🔹 CREATE EXECUTION
  create: async (data) => {
    const response = await apiService.post('/test-executions', data)

    if (!response?.success) {
      throw new Error('Failed to create test execution')
    }

    clearCache('test-executions:')
    return response.execution
  },

  // 🔹 GET BY ID
  getById: async (id) => {
    return apiService.get(`/test-executions/${id}`)
  },
}


// Test Results Service
export const testResultsService = {
  // 🔹 GET BY EXECUTION
  getByExecution: async (executionId) => {
    const response = await apiService.get(`/test-results/by-execution/${executionId}`)
    return Array.isArray(response) ? response : []
  },

  // 🔹 CREATE RESULT
  create: async (data) => {
    const response = await apiService.post('/test-results', data)

    if (!response?.success) {
      throw new Error('Failed to create test result')
    }

    clearCache('test-results:')
    return response.result
  },

  // 🔹 GET BY ID
  getById: async (id) => {
    return apiService.get(`/test-results/${id}`)
  },
}


// Samples Service
// Samples Service
export const samplesService = {
  getAll: async (projectId) => {
    const url = projectId
      ? `http://127.0.0.1:8000/samples/?projectId=${projectId}`
      : 'http://127.0.0.1:8000/samples/'

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(await res.text())
    }
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/samples/${id}`)
    if (!res.ok) {
      throw new Error(await res.text())
    }
    return res.json()
  },

  create: async (data) => {
    const res = await fetch('http://127.0.0.1:8000/samples/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`http://127.0.0.1:8000/samples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    return res.json()
  },

  delete: async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/samples/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    return true
  },
}

// TRFs Service
export const trfsService = {
  /**
   * Get all TRFs
   */
  getAll: async () => {
    return apiService.get('/trfs')
  },

  /**
   * Get TRF by ID
   * @param {number} id
   */
  getById: async (id) => {
    return apiService.get(`/trfs/${id}`)
  },

  /**
   * Create new TRF
   * @param {object} data
   */
  create: async (data) => {
    return apiService.post('/trfs', data)
  },

  /**
   * Update TRF (future-ready)
   * @param {number} id
   * @param {object} data
   */
  update: async (id, data) => {
    return apiService.put(`/trfs/${id}`, data)
  },

  /**
   * Delete TRF (future-ready)
   * @param {number} id
   */
  delete: async (id) => {
    return apiService.delete(`/trfs/${id}`)
  }
}

// Documents Service
export const documentsService = {
  /**
   * Get all documents
   */
  getAll: async () => {
    return apiService.get('/documents')
  },

  /**
   * Upload document (multipart/form-data)
   * IMPORTANT: bypass apiService.post to avoid JSON header
   */
  create: async (formData) => {
    const response = await apiService.client.post(
      '/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Download document (binary)
   * IMPORTANT: use axios client directly
   */
  download: async (id) => {
    const response = await apiService.client.get(
      `/documents/${id}/download`,
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * Delete document (future-ready)
   */
  delete: async (id) => {
    return apiService.delete(`/documents/${id}`)
  },
}

// Reports Service
export const reportsService = {
  /**
   * Get all reports
   */
  getAll: async () => {
    return apiService.get('/reports')
  },

  /**
   * Upload report (multipart/form-data)
   */
  create: async (formData) => {
    const response = await apiService.client.post(
      '/reports',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Download report file
   */
  download: async (id) => {
    const response = await apiService.client.get(
      `/reports/${id}/download`,
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * Delete report
   */
  delete: async (id) => {
    return apiService.delete(`/reports/${id}`)
  },
}


// Audits Service
export const auditsService = {
  // 🔹 GET ALL AUDITS
  getAll: async () => {
    const response = await apiService.get('/audits')
    return Array.isArray(response) ? response : []
  },

  // 🔹 CREATE AUDIT
  create: async (data) => {
    const response = await apiService.post('/audits', data)

    if (!response?.success) {
      throw new Error('Audit creation failed')
    }

    clearCache('audits:')
    return response.audit
  },

  // 🔹 GET BY ID (optional)
  getById: async (id) => {
    return apiService.get(`/audits/${id}`)
  },
}


// NCRs Service
export const ncrsService = {
  // 🔹 GET ALL NCRs
  getAll: async () => {
    const response = await apiService.get('/ncrs')
    return Array.isArray(response) ? response : []
  },

  // 🔹 CREATE NCR
  create: async (data) => {
    const response = await apiService.post('/ncrs', data)

    if (!response?.success) {
      throw new Error('NCR creation failed')
    }

    clearCache('ncrs:')
    return response.ncr
  },

  // 🔹 GET BY ID (optional)
  getById: async (id) => {
    return apiService.get(`/ncrs/${id}`)
  },
}


// Certifications Service
// Certifications Service (CONNECTED TO BACKEND – FINAL)

export const certificationsService = {
  // 🔹 GET ALL CERTIFICATIONS
  getAll: async () => {
    const cacheKey = 'certifications:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    const response = await apiService.get('/certifications')

    const certifications = Array.isArray(response) ? response : []

    setCached(cacheKey, certifications)
    return certifications
  },

  // 🔹 GET CERTIFICATION BY ID
  getById: async (id) => {
    return apiService.get(`/certifications/${id}`)
  },

  // 🔹 CREATE CERTIFICATION
  create: async (data) => {
    try {
      const response = await apiService.post('/certifications', data)

      clearCache('certifications:')

      return response.certification
    } catch (error) {
      console.error('Create certification failed:', error)
      throw error
    }
  },
}


// Inventory Management Services

// Instruments Service
export const instrumentsService = {
  getAll: async () => {
    const cacheKey = 'instruments:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        instrumentId: 'INST-001',
        name: 'Spectrum Analyzer',
        manufacturer: 'Keysight Technologies',
        model: 'N9020B',
        serialNumber: 'US12345678',
        labLocation: 'Lab A - Room 101',
        assignedDepartment: 'EMC Testing',
        status: 'Active',
        purchaseDate: '2022-01-15',
        warrantyExpiry: '2025-01-15',
        serviceVendor: 'Keysight Service Center',
        serviceVendorContact: 'service@keysight.com',
        notes: 'Primary instrument for RF testing',
        createdAt: '2022-01-15T10:00:00Z'
      },
      {
        id: 2,
        instrumentId: 'INST-002',
        name: 'EMI Receiver',
        manufacturer: 'Rohde & Schwarz',
        model: 'ESW26',
        serialNumber: 'DE98765432',
        labLocation: 'Lab B - Room 205',
        assignedDepartment: 'EMC Testing',
        status: 'Under Maintenance',
        purchaseDate: '2021-06-20',
        warrantyExpiry: '2024-06-20',
        serviceVendor: 'Rohde & Schwarz Service',
        serviceVendorContact: 'support@rohde-schwarz.com',
        notes: 'Scheduled maintenance',
        createdAt: '2021-06-20T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/instruments/${id}`),
  create: (data) => {
    clearCache('instruments:')
    return apiService.post('/api/instruments', data)
  },
  update: (id, data) => {
    clearCache('instruments:')
    return apiService.put(`/api/instruments/${id}`, data)
  },
  deactivate: (id) => {
    clearCache('instruments:')
    return apiService.patch(`/api/instruments/${id}/deactivate`, {})
  },
}

// Calibration Service
export const calibrationsService = {
  getAll: async (instrumentId) => {
    const cacheKey = instrumentId ? `calibrations:instrument:${instrumentId}` : 'calibrations:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        calibrationId: 'CAL-001',
        instrumentId: 1,
        instrumentName: 'Spectrum Analyzer',
        lastCalibrationDate: '2024-01-15',
        nextDueDate: '2024-07-15',
        calibrationFrequency: '6 months',
        calibrationMethod: 'ISO/IEC 17025',
        certifiedBy: 'NIST Accredited Lab',
        certificateNumber: 'CAL-2024-001',
        certificateUrl: null,
        status: 'Valid',
        notes: 'All parameters within specification',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        calibrationId: 'CAL-002',
        instrumentId: 2,
        instrumentName: 'EMI Receiver',
        lastCalibrationDate: '2023-12-10',
        nextDueDate: '2024-06-10',
        calibrationFrequency: '6 months',
        calibrationMethod: 'ISO/IEC 17025',
        certifiedBy: 'NIST Accredited Lab',
        certificateNumber: 'CAL-2023-045',
        certificateUrl: null,
        status: 'Due Soon',
        notes: 'Calibration due in 2 months',
        createdAt: '2023-12-10T10:00:00Z'
      },
    ]
    const filtered = instrumentId
      ? data.filter(cal => cal.instrumentId === parseInt(instrumentId))
      : data
    setCached(cacheKey, filtered)
    return filtered
  },
  getById: (id) => apiService.get(`/api/calibrations/${id}`),
  getHistory: async (instrumentId) => {
    const cacheKey = `calibrations:history:${instrumentId}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
  create: (data) => {
    clearCache('calibrations:')
    return apiService.post('/api/calibrations', data)
  },
  update: (id, data) => {
    clearCache('calibrations:')
    return apiService.put(`/api/calibrations/${id}`, data)
  },
  getUpcoming: async () => {
    const cacheKey = 'calibrations:upcoming'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
}

// Consumables Service
export const consumablesService = {
  getAll: async () => {
    const cacheKey = 'consumables:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        itemId: 'CONS-001',
        category: 'Consumable',
        itemName: 'EMC Test Probes',
        batchLotNumber: 'BATCH-2024-001',
        quantityAvailable: 25,
        unit: 'pieces',
        expiryDate: '2025-12-31',
        storageConditions: 'Room Temperature',
        supplier: 'Test Equipment Suppliers',
        supplierContact: 'sales@testequip.com',
        lowStockThreshold: 10,
        status: 'In Stock',
        notes: 'Standard EMC probes',
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 2,
        itemId: 'CONS-002',
        category: 'Consumable',
        itemName: 'RF Cables',
        batchLotNumber: 'BATCH-2024-002',
        quantityAvailable: 8,
        unit: 'pieces',
        expiryDate: null,
        storageConditions: 'Dry Storage',
        supplier: 'Cable Manufacturers Inc',
        supplierContact: 'info@cablemfg.com',
        lowStockThreshold: 15,
        status: 'Low Stock',
        notes: '50 ohm impedance cables',
        createdAt: '2024-01-12T10:00:00Z'
      },
      {
        id: 3,
        itemId: 'ACC-001',
        category: 'Accessory',
        itemName: 'Antenna Mounting Kit',
        batchLotNumber: 'N/A',
        quantityAvailable: 5,
        unit: 'kits',
        expiryDate: null,
        storageConditions: 'Standard Storage',
        supplier: 'Antenna Solutions',
        supplierContact: 'sales@antennasolutions.com',
        lowStockThreshold: 3,
        status: 'In Stock',
        notes: 'Universal mounting kit',
        createdAt: '2024-01-08T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/consumables/${id}`),
  create: (data) => {
    clearCache('consumables:')
    return apiService.post('/api/consumables', data)
  },
  update: (id, data) => {
    clearCache('consumables:')
    return apiService.put(`/api/consumables/${id}`, data)
  },
  delete: (id) => {
    clearCache('consumables:')
    return apiService.delete(`/api/consumables/${id}`)
  },
  getLowStock: async () => {
    const cacheKey = 'consumables:lowStock'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
  getExpiring: async () => {
    const cacheKey = 'consumables:expiring'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
}

// Inventory Transactions Service
export const inventoryTransactionsService = {
  getAll: async (itemId) => {
    const cacheKey = itemId ? `transactions:item:${itemId}` : 'transactions:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        transactionId: 'TXN-001',
        itemId: 1,
        itemName: 'EMC Test Probes',
        itemType: 'Consumable',
        transactionType: 'Usage',
        quantity: 5,
        usedBy: 'John Doe',
        purpose: 'EMC Testing - Project Alpha',
        linkedTestId: 1,
        linkedTestName: 'EMC Compliance Test',
        date: '2024-01-20',
        notes: 'Used for emission testing',
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 2,
        transactionId: 'TXN-002',
        itemId: 1,
        itemName: 'EMC Test Probes',
        itemType: 'Consumable',
        transactionType: 'Addition',
        quantity: 30,
        usedBy: 'Inventory Manager',
        purpose: 'Stock Replenishment',
        linkedTestId: null,
        linkedTestName: null,
        date: '2024-01-15',
        notes: 'New stock received',
        createdAt: '2024-01-15T10:00:00Z'
      },
    ]
    const filtered = itemId
      ? data.filter(txn => txn.itemId === parseInt(itemId))
      : data
    setCached(cacheKey, filtered)
    return filtered
  },
  getById: (id) => apiService.get(`/api/inventory-transactions/${id}`),
  create: (data) => {
    clearCache('transactions:')
    clearCache('consumables:')
    return apiService.post('/api/inventory-transactions', data)
  },
  getByDateRange: async (startDate, endDate) => {
    const cacheKey = `transactions:range:${startDate}:${endDate}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
}

// Inventory Reports Service
export const inventoryReportsService = {
  getSummary: async () => {
    const cacheKey = 'inventory:summary'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = {
      totalInstruments: 12,
      activeInstruments: 10,
      instrumentsUnderMaintenance: 2,
      totalConsumables: 45,
      lowStockItems: 3,
      expiringItems: 2,
      upcomingCalibrations: 5,
      overdueCalibrations: 1,
    }
    setCached(cacheKey, data)
    return data
  },
  getCalibrationCompliance: async () => {
    const cacheKey = 'inventory:calibration:compliance'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = {
      totalInstruments: 12,
      calibrated: 10,
      dueSoon: 2,
      overdue: 0,
      complianceRate: 83.3,
    }
    setCached(cacheKey, data)
    return data
  },
  getInstrumentUtilization: async () => {
    const cacheKey = 'inventory:instrument:utilization'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = []
    setCached(cacheKey, data)
    return data
  },
}

// Quality Assurance Services

// SOP Management Service
export const sopService = {
  getAll: async () => {
    const cacheKey = 'sops:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        sopId: 'SOP-001',
        title: 'EMC Testing Procedure',
        category: 'Testing',
        version: '2.1',
        effectiveDate: '2024-01-15',
        approvedBy: 'Dr. John Smith',
        status: 'Active',
        linkedTests: ['EMC Compliance Test', 'RF Emission Test'],
        linkedInstruments: ['INST-001', 'INST-002'],
        linkedDepartments: ['EMC Testing'],
        documentUrl: '/documents/sop-001-v2.1.pdf',
        revisionHistory: [
          { version: '2.1', date: '2024-01-15', changedBy: 'Dr. John Smith', changes: 'Updated test parameters' },
          { version: '2.0', date: '2023-06-10', changedBy: 'Dr. Jane Doe', changes: 'Major revision' },
          { version: '1.0', date: '2022-01-01', changedBy: 'Dr. John Smith', changes: 'Initial version' }
        ],
        nextReviewDate: '2024-07-15',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        sopId: 'SOP-002',
        title: 'Instrument Calibration Procedure',
        category: 'Calibration',
        version: '1.5',
        effectiveDate: '2023-12-01',
        approvedBy: 'Dr. Jane Doe',
        status: 'Active',
        linkedTests: [],
        linkedInstruments: ['INST-001', 'INST-002', 'INST-003'],
        linkedDepartments: ['Quality Assurance'],
        documentUrl: '/documents/sop-002-v1.5.pdf',
        revisionHistory: [
          { version: '1.5', date: '2023-12-01', changedBy: 'Dr. Jane Doe', changes: 'Updated calibration frequency' },
          { version: '1.0', date: '2022-01-01', changedBy: 'Dr. Jane Doe', changes: 'Initial version' }
        ],
        nextReviewDate: '2024-06-01',
        createdAt: '2023-12-01T10:00:00Z'
      },
      {
        id: 3,
        sopId: 'SOP-003',
        title: 'Sample Handling and Storage',
        category: 'Sample Management',
        version: '1.2',
        effectiveDate: '2024-02-01',
        approvedBy: 'Dr. John Smith',
        status: 'Under Review',
        linkedTests: ['All Tests'],
        linkedInstruments: [],
        linkedDepartments: ['Sample Management'],
        documentUrl: '/documents/sop-003-v1.2.pdf',
        revisionHistory: [
          { version: '1.2', date: '2024-02-01', changedBy: 'Dr. John Smith', changes: 'Updated storage requirements' },
          { version: '1.1', date: '2023-08-15', changedBy: 'Dr. John Smith', changes: 'Minor corrections' },
          { version: '1.0', date: '2022-01-01', changedBy: 'Dr. John Smith', changes: 'Initial version' }
        ],
        nextReviewDate: '2024-08-01',
        createdAt: '2024-02-01T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/sops/${id}`),
  create: (data) => {
    clearCache('sops:')
    return apiService.post('/api/sops', data)
  },
  update: (id, data) => {
    clearCache('sops:')
    return apiService.put(`/api/sops/${id}`, data)
  },
  delete: (id) => {
    clearCache('sops:')
    return apiService.delete(`/api/sops/${id}`)
  },
}

// Quality Control Checks Service
export const qcService = {
  getAll: async () => {
    const cacheKey = 'qc:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        qcId: 'QC-001',
        testName: 'EMC Compliance Test',
        parameter: 'Emission Level',
        targetValue: 50,
        acceptanceRange: { min: 45, max: 55 },
        unit: 'dBµV/m',
        frequency: 'Daily',
        lastCheckDate: '2024-01-20',
        lastResult: 48.5,
        status: 'Pass',
        deviation: false,
        trend: [
          { date: '2024-01-20', value: 48.5, status: 'Pass' },
          { date: '2024-01-19', value: 49.2, status: 'Pass' },
          { date: '2024-01-18', value: 47.8, status: 'Pass' },
          { date: '2024-01-17', value: 51.2, status: 'Pass' },
          { date: '2024-01-16', value: 49.5, status: 'Pass' }
        ],
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        qcId: 'QC-002',
        testName: 'RF Emission Test',
        parameter: 'Power Level',
        targetValue: 100,
        acceptanceRange: { min: 95, max: 105 },
        unit: 'mW',
        frequency: 'Weekly',
        lastCheckDate: '2024-01-18',
        lastResult: 102.5,
        status: 'Pass',
        deviation: false,
        trend: [
          { date: '2024-01-18', value: 102.5, status: 'Pass' },
          { date: '2024-01-11', value: 98.2, status: 'Pass' },
          { date: '2024-01-04', value: 101.8, status: 'Pass' }
        ],
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 3,
        qcId: 'QC-003',
        testName: 'Temperature Calibration',
        parameter: 'Temperature Accuracy',
        targetValue: 25,
        acceptanceRange: { min: 24.5, max: 25.5 },
        unit: '°C',
        frequency: 'Monthly',
        lastCheckDate: '2024-01-01',
        lastResult: 25.8,
        status: 'Fail',
        deviation: true,
        trend: [
          { date: '2024-01-01', value: 25.8, status: 'Fail' },
          { date: '2023-12-01', value: 24.9, status: 'Pass' },
          { date: '2023-11-01', value: 25.1, status: 'Pass' }
        ],
        createdAt: '2023-11-01T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/qc-checks/${id}`),
  create: (data) => {
    clearCache('qc:')
    return apiService.post('/api/qc-checks', data)
  },
  update: (id, data) => {
    clearCache('qc:')
    return apiService.put(`/api/qc-checks/${id}`, data)
  },
  recordResult: (id, result) => {
    clearCache('qc:')
    return apiService.post(`/api/qc-checks/${id}/results`, result)
  },
  delete: (id) => {
    clearCache('qc:')
    return apiService.delete(`/api/qc-checks/${id}`)
  },
}

// Audit & Compliance Service
export const auditService = {
  getAll: async () => {
    const cacheKey = 'audits:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        auditId: 'AUD-2024-001',
        auditType: 'Internal',
        date: '2024-01-15',
        auditorName: 'Dr. Sarah Johnson',
        auditorOrganization: 'Internal QA Team',
        scope: 'EMC Testing Department',
        status: 'Completed',
        findings: [
          { id: 1, description: 'Missing calibration certificate for INST-002', severity: 'Minor', status: 'Closed' },
          { id: 2, description: 'SOP-003 needs review', severity: 'Major', status: 'Open' }
        ],
        totalFindings: 2,
        openFindings: 1,
        closedFindings: 1,
        complianceScore: 85,
        reportUrl: '/documents/audit-2024-001.pdf',
        nextAuditDate: '2024-07-15',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        auditId: 'AUD-2024-002',
        auditType: 'External',
        date: '2024-02-01',
        auditorName: 'ISO 17025 Auditor',
        auditorOrganization: 'Accreditation Body',
        scope: 'Full Laboratory',
        status: 'In Progress',
        findings: [
          { id: 1, description: 'Document control procedure needs update', severity: 'Major', status: 'Open' }
        ],
        totalFindings: 1,
        openFindings: 1,
        closedFindings: 0,
        complianceScore: null,
        reportUrl: null,
        nextAuditDate: null,
        createdAt: '2024-02-01T10:00:00Z'
      },
      {
        id: 3,
        auditId: 'AUD-2023-005',
        auditType: 'Internal',
        date: '2023-12-10',
        auditorName: 'Dr. Mike Davis',
        auditorOrganization: 'Internal QA Team',
        scope: 'Calibration Department',
        status: 'Completed',
        findings: [],
        totalFindings: 0,
        openFindings: 0,
        closedFindings: 0,
        complianceScore: 100,
        reportUrl: '/documents/audit-2023-005.pdf',
        nextAuditDate: '2024-06-10',
        createdAt: '2023-12-10T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/audits/${id}`),
  create: (data) => {
    clearCache('audits:')
    return apiService.post('/api/audits', data)
  },
  update: (id, data) => {
    clearCache('audits:')
    return apiService.put(`/api/audits/${id}`, data)
  },
  delete: (id) => {
    clearCache('audits:')
    return apiService.delete(`/api/audits/${id}`)
  },
}

// Non-Conformance & CAPA Service
export const ncCapaService = {
  getAll: async () => {
    const cacheKey = 'nc-capa:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        ncId: 'NC-2024-001',
        description: 'Calibration certificate expired for INST-002',
        impactedArea: 'EMC Testing',
        severity: 'High',
        rootCause: 'Missed calibration schedule reminder',
        actionOwner: 'John Doe',
        dueDate: '2024-02-15',
        status: 'Open',
        correctiveAction: 'Immediate calibration scheduled',
        preventiveAction: 'Implement automated calibration reminders',
        closureDate: null,
        linkedAudit: 'AUD-2024-001',
        linkedTest: null,
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 2,
        ncId: 'NC-2024-002',
        description: 'QC check failed for Temperature Calibration',
        impactedArea: 'Calibration',
        severity: 'Medium',
        rootCause: 'Instrument drift over time',
        actionOwner: 'Jane Smith',
        dueDate: '2024-02-10',
        status: 'In Progress',
        correctiveAction: 'Instrument recalibrated and verified',
        preventiveAction: 'Increase calibration frequency',
        closureDate: null,
        linkedAudit: null,
        linkedTest: 'QC-003',
        createdAt: '2024-01-22T10:00:00Z'
      },
      {
        id: 3,
        ncId: 'NC-2023-015',
        description: 'SOP-002 outdated version in use',
        impactedArea: 'Document Control',
        severity: 'Low',
        rootCause: 'Version control process not followed',
        actionOwner: 'Mike Davis',
        dueDate: '2024-01-30',
        status: 'Closed',
        correctiveAction: 'All copies updated to latest version',
        preventiveAction: 'Implemented document version tracking system',
        closureDate: '2024-01-28',
        linkedAudit: 'AUD-2023-005',
        linkedTest: null,
        createdAt: '2023-12-15T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/nc-capa/${id}`),
  create: (data) => {
    clearCache('nc-capa:')
    return apiService.post('/api/nc-capa', data)
  },
  update: (id, data) => {
    clearCache('nc-capa:')
    return apiService.put(`/api/nc-capa/${id}`, data)
  },
  close: (id, closureData) => {
    clearCache('nc-capa:')
    return apiService.post(`/api/nc-capa/${id}/close`, closureData)
  },
  delete: (id) => {
    clearCache('nc-capa:')
    return apiService.delete(`/api/nc-capa/${id}`)
  },
}

// Document Control Service
export const documentControlService = {
  getAll: async () => {
    const cacheKey = 'documents:all'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        id: 1,
        documentId: 'DOC-001',
        title: 'Quality Manual',
        category: 'Policy',
        version: '3.0',
        documentType: 'Policy',
        effectiveDate: '2024-01-01',
        approvedBy: 'Dr. John Smith',
        status: 'Active',
        accessLevel: 'All Staff',
        locked: false,
        documentUrl: '/documents/quality-manual-v3.0.pdf',
        downloadCount: 45,
        lastAccessed: '2024-01-20',
        revisionHistory: [
          { version: '3.0', date: '2024-01-01', changedBy: 'Dr. John Smith' },
          { version: '2.5', date: '2023-06-01', changedBy: 'Dr. Jane Doe' }
        ],
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: 2,
        documentId: 'DOC-002',
        title: 'Calibration Certificate - INST-001',
        category: 'Certificate',
        version: '1.0',
        documentType: 'Certificate',
        effectiveDate: '2024-01-15',
        approvedBy: 'NIST Accredited Lab',
        status: 'Active',
        accessLevel: 'QA Team',
        locked: true,
        documentUrl: '/documents/cal-cert-inst-001.pdf',
        downloadCount: 12,
        lastAccessed: '2024-01-18',
        revisionHistory: [
          { version: '1.0', date: '2024-01-15', changedBy: 'NIST Accredited Lab' }
        ],
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 3,
        documentId: 'DOC-003',
        title: 'ISO 17025 Accreditation Certificate',
        category: 'Certificate',
        version: '1.0',
        documentType: 'Certificate',
        effectiveDate: '2023-01-01',
        approvedBy: 'Accreditation Body',
        status: 'Active',
        accessLevel: 'All Staff',
        locked: true,
        documentUrl: '/documents/iso-17025-cert.pdf',
        downloadCount: 89,
        lastAccessed: '2024-01-19',
        revisionHistory: [
          { version: '1.0', date: '2023-01-01', changedBy: 'Accreditation Body' }
        ],
        createdAt: '2023-01-01T10:00:00Z'
      },
    ]
    setCached(cacheKey, data)
    return data
  },
  getById: (id) => apiService.get(`/api/documents/${id}`),
  create: (data) => {
    clearCache('documents:')
    return apiService.post('/api/documents', data)
  },
  update: (id, data) => {
    clearCache('documents:')
    return apiService.put(`/api/documents/${id}`, data)
  },
  lock: (id) => {
    clearCache('documents:')
    return apiService.post(`/api/documents/${id}/lock`)
  },
  unlock: (id) => {
    clearCache('documents:')
    return apiService.post(`/api/documents/${id}/unlock`)
  },
  delete: (id) => {
    clearCache('documents:')
    return apiService.delete(`/api/documents/${id}`)
  },
}

// QA Reports Service
export const qaReportsService = {
  getComplianceScore: async () => {
    const cacheKey = 'qa:compliance:score'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = {
      overallScore: 87.5,
      sopCompliance: 90,
      calibrationCompliance: 85,
      qcCompliance: 88,
      auditCompliance: 92,
      documentControl: 90,
      trends: [
        { month: 'Oct 2023', score: 82 },
        { month: 'Nov 2023', score: 84 },
        { month: 'Dec 2023', score: 86 },
        { month: 'Jan 2024', score: 87.5 }
      ]
    }
    setCached(cacheKey, data)
    return data
  },
  getOverdueCAPA: async () => {
    const cacheKey = 'qa:overdue:capa'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        ncId: 'NC-2024-001',
        description: 'Calibration certificate expired',
        dueDate: '2024-02-15',
        daysOverdue: 0,
        owner: 'John Doe',
        severity: 'High'
      }
    ]
    setCached(cacheKey, data)
    return data
  },
  getSOPReviewReminders: async () => {
    const cacheKey = 'qa:sop:reminders'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = [
      {
        sopId: 'SOP-001',
        title: 'EMC Testing Procedure',
        nextReviewDate: '2024-07-15',
        daysUntilReview: 175,
        status: 'Active'
      },
      {
        sopId: 'SOP-002',
        title: 'Instrument Calibration Procedure',
        nextReviewDate: '2024-06-01',
        daysUntilReview: 132,
        status: 'Active'
      }
    ]
    setCached(cacheKey, data)
    return data
  },
  getAuditReadiness: async () => {
    const cacheKey = 'qa:audit:readiness'
    const cached = getCached(cacheKey)
    if (cached) return cached

    await mockDelay()
    const data = {
      readinessScore: 88,
      openFindings: 2,
      overdueCAPA: 0,
      expiredSOPs: 0,
      missingCalibrations: 1,
      areas: [
        { area: 'SOP Management', status: 'Ready', score: 90 },
        { area: 'Calibration', status: 'Needs Attention', score: 75 },
        { area: 'QC Checks', status: 'Ready', score: 88 },
        { area: 'Document Control', status: 'Ready', score: 92 }
      ]
    }
    setCached(cacheKey, data)
    return data
  },
}

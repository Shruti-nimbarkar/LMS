/**
 * Lab Recommendation API Service
 * 
 * Service for interacting with the Lab Recommendation Engine API
 */

import axios from 'axios'

const RECO_API_BASE_URL = import.meta.env.VITE_LAB_RECO_API_URL || 'http://localhost:5000/api'

class LabRecommendationService {
  constructor() {
    this.client = axios.create({
      baseURL: RECO_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers if needed
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Lab Recommendation API Error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Health check failed')
    }
  }

  /**
   * Search labs by test name, standard, or domain
   * @param {Object} params - Search parameters
   * @param {string} [params.test_name] - Test name to search for
   * @param {string} [params.standard] - Standard code to search for
   * @param {string} [params.domain] - Domain name
   * @param {number} [params.limit] - Maximum results (default: 50)
   */
  async searchLabs(params = {}) {
    try {
      const response = await this.client.get('/labs/search', { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to search labs')
    }
  }

  /**
   * Get ranked lab recommendations
   * @param {Object} criteria - Recommendation criteria
   * @param {string} [criteria.test_name] - Test name
   * @param {string} [criteria.standard] - Standard code
   * @param {string} [criteria.domain] - Domain name
   * @param {number} [criteria.limit] - Maximum results (default: 20)
   */
  async getRecommendations(criteria = {}) {
    try {
      const response = await this.client.post('/labs/recommend', criteria)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get recommendations')
    }
  }

  /**
   * Get lab details by ID
   * @param {number} labId - Lab ID
   */
  async getLabDetails(labId) {
    try {
      const response = await this.client.get(`/labs/${labId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to get lab details for ID ${labId}`)
    }
  }

  /**
   * Get all domains
   */
  async getDomains() {
    try {
      const response = await this.client.get('/domains')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get domains')
    }
  }

  /**
   * Search tests
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search query
   * @param {number} [params.limit] - Maximum results (default: 20)
   */
  async searchTests(params) {
    try {
      const response = await this.client.get('/tests/search', { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to search tests')
    }
  }

  /**
   * Search standards
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search query
   * @param {number} [params.limit] - Maximum results (default: 20)
   */
  async searchStandards(params) {
    try {
      const response = await this.client.get('/standards/search', { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to search standards')
    }
  }

  /**
   * Handle API errors
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || defaultMessage
      const errorObj = new Error(message)
      errorObj.status = error.response.status
      errorObj.data = error.response.data
      return errorObj
    } else if (error.request) {
      // Request made but no response
      const errorObj = new Error('No response from recommendation service. Please check if the service is running.')
      errorObj.status = 0
      return errorObj
    } else {
      // Error setting up request
      return new Error(error.message || defaultMessage)
    }
  }
}

// Export singleton instance
export const labRecommendationApi = new LabRecommendationService()
export default labRecommendationApi



/**
 * LabRecommendation Component
 * 
 * Component for searching and getting lab recommendations
 */

import { useState, useEffect } from 'react'
import { Search, FlaskConical, Award, Building2, TrendingUp, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { labRecommendationApi } from '../../services/labRecommendationApi'
import toast from 'react-hot-toast'

export default function LabRecommendation() {
  const [searchType, setSearchType] = useState('recommend') // 'recommend' or 'search'
  const [testName, setTestName] = useState('')
  const [standard, setStandard] = useState('')
  const [domain, setDomain] = useState('')
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [domains, setDomains] = useState([])
  const [selectedLab, setSelectedLab] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Load domains on mount
  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    try {
      const data = await labRecommendationApi.getDomains()
      setDomains(data.domains || [])
    } catch (error) {
      console.error('Failed to load domains:', error)
    }
  }

  const handleSearch = async () => {
    if (!testName.trim() && !standard.trim() && !domain.trim()) {
      toast.error('Please provide at least one search criteria')
      return
    }

    setLoading(true)
    setResults([])
    setSelectedLab(null)

    try {
      const params = {
        ...(testName.trim() && { test_name: testName.trim() }),
        ...(standard.trim() && { standard: standard.trim() }),
        ...(domain.trim() && { domain: domain.trim() }),
        limit,
      }

      let data
      if (searchType === 'recommend') {
        data = await labRecommendationApi.getRecommendations(params)
      } else {
        data = await labRecommendationApi.searchLabs(params)
      }

      setResults(data.results || [])
      
      if (data.results?.length === 0) {
        toast.info('No labs found matching your criteria')
      } else {
        toast.success(`Found ${data.count || data.results?.length} lab(s)`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error.message || 'Failed to search labs')
    } finally {
      setLoading(false)
    }
  }

  const handleLabClick = async (labId) => {
    setLoadingDetails(true)
    try {
      const data = await labRecommendationApi.getLabDetails(labId)
      setSelectedLab(data)
    } catch (error) {
      console.error('Failed to load lab details:', error)
      toast.error('Failed to load lab details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lab Recommendation Engine
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSearchType('recommend')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                searchType === 'recommend'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Recommendations
            </button>
            <button
              onClick={() => setSearchType('search')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                searchType === 'search'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FlaskConical className="w-4 h-4 inline mr-1" />
              Test Name
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Voltage Test"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Standard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Standard
            </label>
            <input
              type="text"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., IEC 60068"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Domains</option>
              {domains.map((d) => (
                <option key={d.domain_id} value={d.domain_name}>
                  {d.domain_name} ({d.lab_count} labs)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Limit:
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
              min="1"
              max="100"
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {searchType === 'recommend' ? 'Get Recommendations' : 'Search Labs'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Results ({results.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((lab, index) => (
                <motion.div
                  key={lab.lab_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLabClick(lab.lab_id)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg cursor-pointer transition-all hover:border-primary"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Building2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {lab.lab_name}
                        </h4>
                        {lab.relevance_score && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Score: {lab.relevance_score}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Matching Info */}
                  {searchType === 'recommend' && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {lab.matching_tests && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {lab.matching_tests} Tests
                        </span>
                      )}
                      {lab.matching_standards && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          {lab.matching_standards} Standards
                        </span>
                      )}
                      {lab.matching_domains && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          {lab.matching_domains} Domains
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sample Tests/Standards */}
                  {lab.sample_tests && lab.sample_tests.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Sample Tests:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lab.sample_tests.slice(0, 3).map((test, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lab Details Modal */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLab(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedLab.lab?.lab_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedLab.total_capabilities} capabilities
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLab(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Domain Summary */}
                    {selectedLab.domain_summary && selectedLab.domain_summary.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Domain Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {selectedLab.domain_summary.map((domain) => (
                            <div
                              key={domain.domain_name}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <p className="font-medium text-gray-900 dark:text-white">
                                {domain.domain_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {domain.capability_count} capabilities
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Capabilities */}
                    {selectedLab.capabilities && selectedLab.capabilities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Capabilities
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {selectedLab.capabilities.map((cap, index) => (
                            <div
                              key={index}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {cap.test_name}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {cap.standard_code}
                                    </span>
                                    {cap.full_code && cap.full_code !== cap.standard_code && (
                                      <span className="text-gray-500 dark:text-gray-500">
                                        ({cap.full_code})
                                      </span>
                                    )}
                                    {cap.standard_body && (
                                      <span className="text-gray-500 dark:text-gray-500">
                                        - {cap.standard_body}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {cap.domain_name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



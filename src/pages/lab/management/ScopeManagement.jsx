import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target,
  TestTube,
  Package,
  FileText,
  XCircle,
  DollarSign,
  CheckCircle,
  ClipboardCheck,
  Users,
  Calendar,
  Plus,
  Trash2,
  Search,
  Edit2,
  Save,
  X
} from 'lucide-react'
import Card from '../../../components/labManagement/Card'
import toast from 'react-hot-toast'
import { useLabData } from '../../../contexts/LabDataContext'

const scopeSections = [
  { id: 'add-scope', name: 'Add Scope', icon: Target },
  { id: 'equipment', name: 'Lab Equipment', icon: Package },
  { id: 'scope-testing', name: 'Scope For Testing', icon: TestTube },
  { id: 'facilities-available', name: 'Facilities Available', icon: CheckCircle },
  { id: 'facilities-not-available', name: 'Facilities not Available', icon: XCircle },
  { id: 'reference-material', name: 'Reference Material', icon: FileText },
  { id: 'exclusion', name: 'Exclusion', icon: XCircle },
  { id: 'sample-testing-charges', name: 'Sample Testing Charges', icon: DollarSign },
]

const fieldOfTestingOptions = [
  'Chemical',
  'Mechanical',
  'Electrical',
  'Civil',
  'Electronics',
  'Environmental',
  'Textile',
  'Food & Agriculture',
  'Medical',
  'Other'
]

const maintenanceTypeOptions = ['Internal', 'External', 'Both']

export default function ScopeManagement() {
  const { scopeData, updateScopeData } = useLabData()
  
  const [activeSection, setActiveSection] = useState('add-scope')
  const [showILCFirst, setShowILCFirst] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // ILC/PT State
  const [ilcProgrammes, setIlcProgrammes] = useState(scopeData.ilcProgrammes)
  const [internalAuditFrequency, setInternalAuditFrequency] = useState(scopeData.internalAuditFrequency)
  const [lastAuditDate, setLastAuditDate] = useState(scopeData.lastAuditDate)
  const [managementReviewFrequency, setManagementReviewFrequency] = useState(scopeData.managementReviewFrequency)
  const [lastReviewDate, setLastReviewDate] = useState(scopeData.lastReviewDate)

  // Scope State
  const [scopes, setScopes] = useState(scopeData.scopes)
  const [showScopeForm, setShowScopeForm] = useState(false)
  const [currentScope, setCurrentScope] = useState({
    indianStandard: '',
    fieldOfTesting: '',
    optimalTestingTime: '',
    testingCapacityPerMonth: '',
    productManual: null
  })

  // Equipment State
  const [equipments, setEquipments] = useState(scopeData.equipments)
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState({
    name: '',
    model: '',
    identificationNumber: '',
    range: '',
    leastCount: '',
    calibrationDate: '',
    validityDate: '',
    traceability: '',
    maintenanceType: '',
    amcSchedule: null
  })

  // Scope Testing State
  const [scopeTests, setScopeTests] = useState(scopeData.scopeTests)
  const [currentScopeTest, setCurrentScopeTest] = useState({
    clauseNumber: '',
    clauseTitle: '',
    equipment: '',
    environmentalConditions: '',
    products: '',
    methodOfTest: '',
    serialNo: ''
  })

  // Facilities Available State
  const [facilitiesAvailable, setFacilitiesAvailable] = useState(scopeData.facilitiesAvailable)

  // Facilities Not Available State
  const [facilitiesNotAvailable, setFacilitiesNotAvailable] = useState(scopeData.facilitiesNotAvailable)
  const [allFacilitiesAvailable, setAllFacilitiesAvailable] = useState(scopeData.allFacilitiesAvailable)

  // Reference Material State
  const [referenceMaterials, setReferenceMaterials] = useState(scopeData.referenceMaterials)
  const [referenceMaterialNA, setReferenceMaterialNA] = useState(scopeData.referenceMaterialNA)

  // Exclusion State
  const [exclusions, setExclusions] = useState(scopeData.exclusions)
  const [exclusionNA, setExclusionNA] = useState(scopeData.exclusionNA)

  // Testing Charges State
  const [testingCharges, setTestingCharges] = useState(scopeData.testingCharges)
  const [completeTestingCharge, setCompleteTestingCharge] = useState(scopeData.completeTestingCharge)

  // Sync state to context whenever any data changes
  useEffect(() => {
    updateScopeData({
      ilcProgrammes,
      internalAuditFrequency,
      lastAuditDate,
      managementReviewFrequency,
      lastReviewDate,
      scopes,
      equipments,
      scopeTests,
      facilitiesAvailable,
      facilitiesNotAvailable,
      allFacilitiesAvailable,
      referenceMaterials,
      referenceMaterialNA,
      exclusions,
      exclusionNA,
      testingCharges,
      completeTestingCharge
    })
  }, [
    ilcProgrammes,
    internalAuditFrequency,
    lastAuditDate,
    managementReviewFrequency,
    lastReviewDate,
    scopes,
    equipments,
    scopeTests,
    facilitiesAvailable,
    facilitiesNotAvailable,
    allFacilitiesAvailable,
    referenceMaterials,
    referenceMaterialNA,
    exclusions,
    exclusionNA,
    testingCharges,
    completeTestingCharge,
    updateScopeData
  ])

  // ILC/PT Functions
  const addILCProgramme = () => {
    setIlcProgrammes([...ilcProgrammes, {
      id: Date.now(),
      programme: '',
      parameter: '',
      score: ''
    }])
  }

  const removeILCProgramme = (id) => {
    setIlcProgrammes(ilcProgrammes.filter(item => item.id !== id))
  }

  const updateILCProgramme = (id, field, value) => {
    setIlcProgrammes(ilcProgrammes.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleILCSubmit = () => {
    if (!internalAuditFrequency || !lastAuditDate || !managementReviewFrequency || !lastReviewDate) {
      toast.error('Please fill in all required audit and review details')
      return
    }
    toast.success('ILC/PT information saved successfully!')
    setShowILCFirst(false)
  }

  // Scope Functions
  const handleAddScope = () => {
    if (!currentScope.indianStandard || !currentScope.fieldOfTesting) {
      toast.error('Please fill in Indian Standard and Field of Testing')
      return
    }
    setScopes([...scopes, { ...currentScope, id: Date.now() }])
    setCurrentScope({
      indianStandard: '',
      fieldOfTesting: '',
      optimalTestingTime: '',
      testingCapacityPerMonth: '',
      productManual: null
    })
    setShowScopeForm(false)
    toast.success('Scope added successfully!')
  }

  const removeScope = (id) => {
    setScopes(scopes.filter(s => s.id !== id))
    toast.success('Scope removed')
  }

  // Equipment Functions
  const handleAddEquipment = () => {
    if (!currentEquipment.name || !currentEquipment.identificationNumber) {
      toast.error('Please fill in equipment name and identification number')
      return
    }
    setEquipments([...equipments, { ...currentEquipment, id: Date.now() }])
    setCurrentEquipment({
      name: '',
      model: '',
      identificationNumber: '',
      range: '',
      leastCount: '',
      calibrationDate: '',
      validityDate: '',
      traceability: '',
      maintenanceType: '',
      amcSchedule: null
    })
    setShowEquipmentForm(false)
    toast.success('Equipment added successfully!')
  }

  const removeEquipment = (id) => {
    setEquipments(equipments.filter(e => e.id !== id))
    toast.success('Equipment removed')
  }

  // Scope Testing Functions
  const handleAddScopeTest = () => {
    if (!currentScopeTest.clauseNumber || !currentScopeTest.equipment) {
      toast.error('Please fill in clause number and select equipment')
      return
    }
    setScopeTests([...scopeTests, { ...currentScopeTest, id: Date.now() }])
    setCurrentScopeTest({
      clauseNumber: '',
      clauseTitle: '',
      equipment: '',
      environmentalConditions: '',
      products: '',
      methodOfTest: '',
      serialNo: ''
    })
    toast.success('Scope test added successfully!')
  }

  const removeScopeTest = (id) => {
    setScopeTests(scopeTests.filter(s => s.id !== id))
  }

  // Facilities Available Functions
  const addFacilityAvailable = () => {
    setFacilitiesAvailable([...facilitiesAvailable, {
      id: Date.now(),
      clauseNumber: '',
      clauseTitle: '',
      equipment: '',
      environmentalConditions: '',
      products: '',
      methodOfTest: '',
      serialNo: ''
    }])
  }

  const updateFacilityAvailable = (id, field, value) => {
    setFacilitiesAvailable(facilitiesAvailable.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const removeFacilityAvailable = (id) => {
    setFacilitiesAvailable(facilitiesAvailable.filter(f => f.id !== id))
  }

  // Facilities Not Available Functions
  const addFacilityNotAvailable = () => {
    setFacilitiesNotAvailable([...facilitiesNotAvailable, {
      id: Date.now(),
      clauseNumber: '',
      clauseTitle: '',
      methodOfTest: '',
      facilityNotAvailable: ''
    }])
  }

  const updateFacilityNotAvailable = (id, field, value) => {
    setFacilitiesNotAvailable(facilitiesNotAvailable.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const removeFacilityNotAvailable = (id) => {
    setFacilitiesNotAvailable(facilitiesNotAvailable.filter(f => f.id !== id))
  }

  // Reference Material Functions
  const addReferenceMaterial = () => {
    setReferenceMaterials([...referenceMaterials, {
      id: Date.now(),
      name: '',
      validity: '',
      traceability: ''
    }])
  }

  const updateReferenceMaterial = (id, field, value) => {
    setReferenceMaterials(referenceMaterials.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  const removeReferenceMaterial = (id) => {
    setReferenceMaterials(referenceMaterials.filter(r => r.id !== id))
  }

  // Exclusion Functions
  const addExclusion = () => {
    setExclusions([...exclusions, {
      id: Date.now(),
      clauseNumber: '',
      testName: '',
      justification: ''
    }])
  }

  const updateExclusion = (id, field, value) => {
    setExclusions(exclusions.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ))
  }

  const removeExclusion = (id) => {
    setExclusions(exclusions.filter(e => e.id !== id))
  }

  // Testing Charges Functions
  const addTestingCharge = () => {
    setTestingCharges([...testingCharges, {
      id: Date.now(),
      clauseNumber: '',
      clauseTitle: '',
      charge: '',
      remarks: ''
    }])
  }

  const updateTestingCharge = (id, field, value) => {
    setTestingCharges(testingCharges.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  const removeTestingCharge = (id) => {
    setTestingCharges(testingCharges.filter(t => t.id !== id))
  }

  const handleSaveTestingCharges = () => {
    if (!completeTestingCharge) {
      toast.error('Please enter complete testing charge')
      return
    }
    toast.success('Testing charges saved successfully!')
  }

  const renderILCContent = () => (
    <div className="space-y-8">
      {/* Inter Lab Comparison / Proficiency Testing */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Inter Lab Comparison / Proficiency Testing
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Enter the details of participation or organization of PT/ILC programs.
          </p>
        </div>

        {ilcProgrammes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No ILC/PT programmes added yet</p>
            <button
              onClick={addILCProgramme}
              className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              + Add Programme
            </button>
          </div>
        ) : (
          <>
            {ilcProgrammes.map((programme, index) => (
              <div key={programme.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Programme {index + 1}</h3>
                  <button
                    onClick={() => removeILCProgramme(programme.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    × Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ILC/PT Programme Conducted / Participated
                    </label>
                    <input
                      type="text"
                      value={programme.programme}
                      onChange={(e) => updateILCProgramme(programme.id, 'programme', e.target.value)}
                      placeholder="Enter programme name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parameter
                    </label>
                    <input
                      type="text"
                      value={programme.parameter}
                      onChange={(e) => updateILCProgramme(programme.id, 'parameter', e.target.value)}
                      placeholder="Enter parameter"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score
                    </label>
                    <input
                      type="text"
                      value={programme.score}
                      onChange={(e) => updateILCProgramme(programme.id, 'score', e.target.value)}
                      placeholder="Enter score"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addILCProgramme}
              className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
            >
              + Add more
            </button>
          </>
        )}
      </div>

      {/* Internal Audit */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Internal Audit</h2>
          <p className="text-sm text-gray-600 mt-2">
            Enter the dates and details of internal audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency of Internal Audit <span className="text-red-500">*</span>
            </label>
            <select
              value={internalAuditFrequency}
              onChange={(e) => setInternalAuditFrequency(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half Yearly">Half Yearly</option>
              <option value="Annually">Annually</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the frequency of Internal Audit from the List.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Audit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={lastAuditDate}
              onChange={(e) => setLastAuditDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the Calendar to select the Last Audit Date.
            </p>
          </div>
        </div>
      </div>

      {/* Management Review */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Management Review</h2>
          <p className="text-sm text-gray-600 mt-2">
            Enter the details of latest Management review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency of Management Review <span className="text-red-500">*</span>
            </label>
            <select
              value={managementReviewFrequency}
              onChange={(e) => setManagementReviewFrequency(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half Yearly">Half Yearly</option>
              <option value="Annually">Annually</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the frequency of Management Review from the List.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Review Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={lastReviewDate}
              onChange={(e) => setLastReviewDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the Calendar to select the Last Management Review Date.
            </p>
          </div>
        </div>
      </div>

      {/* Save & Next Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleILCSubmit}
          className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
        >
          Save & Next
        </button>
      </div>
    </div>
  )

  const renderScopeContent = () => {
    switch (activeSection) {
      case 'add-scope':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-7 h-7 text-primary" />
                Scope of Recognition
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Enter the Indian Standards against which recognition is required.
              </p>
            </div>

            {/* Scope List */}
            {scopes.length > 0 && (
              <div className="space-y-4">
                {scopes.map((scope) => (
                  <div key={scope.id} className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{scope.indianStandard}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Field:</span>
                            <span className="ml-2 font-medium">{scope.fieldOfTesting}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Testing Time:</span>
                            <span className="ml-2 font-medium">{scope.optimalTestingTime || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacity/Month:</span>
                            <span className="ml-2 font-medium">{scope.testingCapacityPerMonth || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeScope(scope.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Scope Form */}
            {showScopeForm ? (
              <div className="p-6 bg-blue-50 rounded-xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Scope</h3>
                  <button
                    onClick={() => setShowScopeForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indian Standard Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentScope.indianStandard}
                      onChange={(e) => setCurrentScope({...currentScope, indianStandard: e.target.value})}
                      placeholder="e.g., IS 2386"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Testing <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentScope.fieldOfTesting}
                      onChange={(e) => setCurrentScope({...currentScope, fieldOfTesting: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select field</option>
                      {fieldOfTestingOptions.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Optimal Testing Time
                    </label>
                    <input
                      type="text"
                      value={currentScope.optimalTestingTime}
                      onChange={(e) => setCurrentScope({...currentScope, optimalTestingTime: e.target.value})}
                      placeholder="e.g., 2 days"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testing Capacity Per Month
                    </label>
                    <input
                      type="text"
                      value={currentScope.testingCapacityPerMonth}
                      onChange={(e) => setCurrentScope({...currentScope, testingCapacityPerMonth: e.target.value})}
                      placeholder="e.g., 50 samples"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddScope}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Scope
                  </button>
                  <button
                    onClick={() => setShowScopeForm(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={() => setShowScopeForm(true)}
                  className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Scope
                </button>
              </div>
            )}
          </div>
        )

      case 'equipment':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-7 h-7 text-primary" />
                Lab Equipment Management
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Manage all laboratory equipment with calibration and maintenance details.
              </p>
            </div>

            {/* Search Bar */}
            {equipments.length > 0 && (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Equipment List */}
            {equipments.filter(e => 
              e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.identificationNumber.toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Equipment Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Model</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Range</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Calibration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {equipments.filter(e => 
                      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      e.identificationNumber.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{equipment.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{equipment.model || '-'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{equipment.identificationNumber}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{equipment.range || '-'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {equipment.validityDate ? new Date(equipment.validityDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <button
                            onClick={() => removeEquipment(equipment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Equipment Form */}
            {showEquipmentForm ? (
              <div className="p-6 bg-amber-50 rounded-xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Equipment</h3>
                  <button
                    onClick={() => setShowEquipmentForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentEquipment.name}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, name: e.target.value})}
                      placeholder="Enter equipment name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={currentEquipment.model}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, model: e.target.value})}
                      placeholder="Enter model"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identification Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentEquipment.identificationNumber}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, identificationNumber: e.target.value})}
                      placeholder="Enter ID number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Range & Least Count
                    </label>
                    <input
                      type="text"
                      value={currentEquipment.range}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, range: e.target.value})}
                      placeholder="e.g., 0-100 mm, LC: 0.01 mm"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calibration Date
                    </label>
                    <input
                      type="date"
                      value={currentEquipment.calibrationDate}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, calibrationDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity Date
                    </label>
                    <input
                      type="date"
                      value={currentEquipment.validityDate}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, validityDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Traceability
                    </label>
                    <input
                      type="text"
                      value={currentEquipment.traceability}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, traceability: e.target.value})}
                      placeholder="Enter traceability details"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Type
                    </label>
                    <select
                      value={currentEquipment.maintenanceType}
                      onChange={(e) => setCurrentEquipment({...currentEquipment, maintenanceType: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {maintenanceTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddEquipment}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Equipment
                  </button>
                  <button
                    onClick={() => setShowEquipmentForm(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={() => setShowEquipmentForm(true)}
                  className="px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Equipment
                </button>
              </div>
            )}
          </div>
        )

      case 'scope-testing':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TestTube className="w-7 h-7 text-primary" />
                Scope For Testing
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Link equipment to testing clauses and define testing parameters.
              </p>
            </div>

            {scopeTests.length > 0 && (
              <div className="space-y-4">
                {scopeTests.map((test, index) => (
                  <div key={test.id} className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Clause {test.clauseNumber}: {test.clauseTitle}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Equipment:</span>
                            <span className="ml-2 font-medium">{test.equipment}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <span className="ml-2 font-medium">{test.methodOfTest || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeScopeTest(test.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 bg-blue-50 rounded-xl space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Scope Test</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clause Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentScopeTest.clauseNumber}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, clauseNumber: e.target.value})}
                    placeholder="e.g., 5.2.1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clause Title
                  </label>
                  <input
                    type="text"
                    value={currentScopeTest.clauseTitle}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, clauseTitle: e.target.value})}
                    placeholder="Enter clause title"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Equipment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentScopeTest.equipment}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, equipment: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select equipment</option>
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.name}>{eq.name} ({eq.identificationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environmental Conditions
                  </label>
                  <input
                    type="text"
                    value={currentScopeTest.environmentalConditions}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, environmentalConditions: e.target.value})}
                    placeholder="e.g., 25°C, 65% RH"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Products
                  </label>
                  <input
                    type="text"
                    value={currentScopeTest.products}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, products: e.target.value})}
                    placeholder="Applicable products"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method of Test
                  </label>
                  <input
                    type="text"
                    value={currentScopeTest.methodOfTest}
                    onChange={(e) => setCurrentScopeTest({...currentScopeTest, methodOfTest: e.target.value})}
                    placeholder="Test method"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleAddScopeTest}
                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Test
              </button>
            </div>
          </div>
        )

      case 'facilities-available':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-7 h-7 text-primary" />
                Facilities Available
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                List all testing facilities available in your laboratory.
              </p>
            </div>

            {facilitiesAvailable.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No facilities added yet</p>
                <button
                  onClick={addFacilityAvailable}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  + Add Facility
                </button>
              </div>
            ) : (
              <>
                {facilitiesAvailable.map((facility, index) => (
                  <div key={facility.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Facility {index + 1}</h3>
                      <button
                        onClick={() => removeFacilityAvailable(facility.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        × Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clause Number
                        </label>
                        <input
                          type="text"
                          value={facility.clauseNumber}
                          onChange={(e) => updateFacilityAvailable(facility.id, 'clauseNumber', e.target.value)}
                          placeholder="Enter clause number"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clause Title
                        </label>
                        <input
                          type="text"
                          value={facility.clauseTitle}
                          onChange={(e) => updateFacilityAvailable(facility.id, 'clauseTitle', e.target.value)}
                          placeholder="Enter clause title"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment
                        </label>
                        <select
                          value={facility.equipment}
                          onChange={(e) => updateFacilityAvailable(facility.id, 'equipment', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select equipment</option>
                          {equipments.map(eq => (
                            <option key={eq.id} value={eq.name}>{eq.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Method of Test
                        </label>
                        <input
                          type="text"
                          value={facility.methodOfTest}
                          onChange={(e) => updateFacilityAvailable(facility.id, 'methodOfTest', e.target.value)}
                          placeholder="Enter method"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addFacilityAvailable}
                  className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
                >
                  + Add More
                </button>
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => toast.success('Facilities saved successfully!')}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Save Facilities
              </button>
            </div>
          </div>
        )

      case 'facilities-not-available':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-7 h-7 text-primary" />
                Facilities not Available
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                List testing facilities that are not available in your laboratory.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <input
                type="checkbox"
                id="allFacilities"
                checked={allFacilitiesAvailable}
                onChange={(e) => {
                  setAllFacilitiesAvailable(e.target.checked)
                  if (e.target.checked) {
                    setFacilitiesNotAvailable([])
                  }
                }}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="allFacilities" className="text-sm font-medium text-gray-900">
                All Facilities Available
              </label>
            </div>

            {!allFacilitiesAvailable && (
              <>
                {facilitiesNotAvailable.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No unavailable facilities listed</p>
                    <button
                      onClick={addFacilityNotAvailable}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      + Add Facility
                    </button>
                  </div>
                ) : (
                  <>
                    {facilitiesNotAvailable.map((facility, index) => (
                      <div key={facility.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Facility {index + 1}</h3>
                          <button
                            onClick={() => removeFacilityNotAvailable(facility.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            × Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Clause Number
                            </label>
                            <input
                              type="text"
                              value={facility.clauseNumber}
                              onChange={(e) => updateFacilityNotAvailable(facility.id, 'clauseNumber', e.target.value)}
                              placeholder="Enter clause number"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Clause Title
                            </label>
                            <input
                              type="text"
                              value={facility.clauseTitle}
                              onChange={(e) => updateFacilityNotAvailable(facility.id, 'clauseTitle', e.target.value)}
                              placeholder="Enter clause title"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Method of Test
                            </label>
                            <input
                              type="text"
                              value={facility.methodOfTest}
                              onChange={(e) => updateFacilityNotAvailable(facility.id, 'methodOfTest', e.target.value)}
                              placeholder="Enter method"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Facility not Available
                            </label>
                            <input
                              type="text"
                              value={facility.facilityNotAvailable}
                              onChange={(e) => updateFacilityNotAvailable(facility.id, 'facilityNotAvailable', e.target.value)}
                              placeholder="Specify facility"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addFacilityNotAvailable}
                      className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add More
                    </button>
                  </>
                )}
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => toast.success('Facilities saved successfully!')}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        )

      case 'reference-material':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-7 h-7 text-primary" />
                Reference Material
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Manage CRM/RM (Certified Reference Material) details.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <input
                type="checkbox"
                id="refMaterialNA"
                checked={referenceMaterialNA}
                onChange={(e) => {
                  setReferenceMaterialNA(e.target.checked)
                  if (e.target.checked) {
                    setReferenceMaterials([])
                  }
                }}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="refMaterialNA" className="text-sm font-medium text-gray-900">
                Reference Material Not Applicable
              </label>
            </div>

            {!referenceMaterialNA && (
              <>
                {referenceMaterials.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No reference materials added yet</p>
                    <button
                      onClick={addReferenceMaterial}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      + Add Material
                    </button>
                  </div>
                ) : (
                  <>
                    {referenceMaterials.map((material, index) => (
                      <div key={material.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Material {index + 1}</h3>
                          <button
                            onClick={() => removeReferenceMaterial(material.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            × Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name of Material (CRM/RM)
                            </label>
                            <input
                              type="text"
                              value={material.name}
                              onChange={(e) => updateReferenceMaterial(material.id, 'name', e.target.value)}
                              placeholder="Enter material name"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Validity (Month/Year)
                            </label>
                            <input
                              type="month"
                              value={material.validity}
                              onChange={(e) => updateReferenceMaterial(material.id, 'validity', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Traceability
                            </label>
                            <input
                              type="text"
                              value={material.traceability}
                              onChange={(e) => updateReferenceMaterial(material.id, 'traceability', e.target.value)}
                              placeholder="Enter traceability"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addReferenceMaterial}
                      className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add More
                    </button>
                  </>
                )}
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => toast.success('Reference materials saved successfully!')}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Save Materials
              </button>
            </div>
          </div>
        )

      case 'exclusion':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-7 h-7 text-primary" />
                Exclusion
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                List tests that are excluded with technical justification.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <input
                type="checkbox"
                id="exclusionNA"
                checked={exclusionNA}
                onChange={(e) => {
                  setExclusionNA(e.target.checked)
                  if (e.target.checked) {
                    setExclusions([])
                  }
                }}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="exclusionNA" className="text-sm font-medium text-gray-900">
                Exclusion Not Applicable
              </label>
            </div>

            {!exclusionNA && (
              <>
                {exclusions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No exclusions added yet</p>
                    <button
                      onClick={addExclusion}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      + Add Exclusion
                    </button>
                  </div>
                ) : (
                  <>
                    {exclusions.map((exclusion, index) => (
                      <div key={exclusion.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Exclusion {index + 1}</h3>
                          <button
                            onClick={() => removeExclusion(exclusion.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            × Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Clause Number
                            </label>
                            <input
                              type="text"
                              value={exclusion.clauseNumber}
                              onChange={(e) => updateExclusion(exclusion.id, 'clauseNumber', e.target.value)}
                              placeholder="Enter clause number"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name of Test
                            </label>
                            <input
                              type="text"
                              value={exclusion.testName}
                              onChange={(e) => updateExclusion(exclusion.id, 'testName', e.target.value)}
                              placeholder="Enter test name"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Technical Justification for seeking exclusion
                            </label>
                            <textarea
                              value={exclusion.justification}
                              onChange={(e) => updateExclusion(exclusion.id, 'justification', e.target.value)}
                              placeholder="Enter technical justification..."
                              rows={4}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addExclusion}
                      className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add More
                    </button>
                  </>
                )}
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => toast.success('Exclusions saved successfully!')}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Save Exclusions
              </button>
            </div>
          </div>
        )

      case 'sample-testing-charges':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-7 h-7 text-primary" />
                Sample Testing Charges
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Define testing charges for complete and clause-wise testing.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Testing Charges <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={completeTestingCharge}
                  onChange={(e) => setCompleteTestingCharge(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="px-4 py-2.5 bg-gray-100 rounded-xl text-gray-700 font-medium">₹</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the total charge for complete testing of all parameters.
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Clause-wise Testing Charges</h3>

              {testingCharges.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No clause-wise charges added yet</p>
                  <button
                    onClick={addTestingCharge}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    + Add Charge
                  </button>
                </div>
              ) : (
                <>
                  {testingCharges.map((charge, index) => (
                    <div key={charge.id} className="p-6 bg-gray-50 rounded-xl space-y-4 mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Clause {index + 1}</h3>
                        <button
                          onClick={() => removeTestingCharge(charge.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          × Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clause Number
                          </label>
                          <input
                            type="text"
                            value={charge.clauseNumber}
                            onChange={(e) => updateTestingCharge(charge.id, 'clauseNumber', e.target.value)}
                            placeholder="Enter clause number"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clause Title
                          </label>
                          <input
                            type="text"
                            value={charge.clauseTitle}
                            onChange={(e) => updateTestingCharge(charge.id, 'clauseTitle', e.target.value)}
                            placeholder="Enter clause title"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Testing Charge (₹)
                          </label>
                          <input
                            type="number"
                            value={charge.charge}
                            onChange={(e) => updateTestingCharge(charge.id, 'charge', e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks
                          </label>
                          <input
                            type="text"
                            value={charge.remarks}
                            onChange={(e) => updateTestingCharge(charge.id, 'remarks', e.target.value)}
                            placeholder="Optional remarks"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addTestingCharge}
                    className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors"
                  >
                    + Add More
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveTestingCharges}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Save Testing Charges
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scope Management</h1>
          <p className="text-gray-600 mt-2">
            {showILCFirst 
              ? 'Step 4: Inter Lab Comparison / Proficiency Testing' 
              : 'Step 5: Scope of Recognition & Manage Equipment'
            }
          </p>
        </div>
      </div>

      {showILCFirst ? (
        /* Show ILC/PT First */
        <Card>
          {renderILCContent()}
        </Card>
      ) : (
        /* Show Scope Management with Sidebar */
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-4 space-y-2 sticky top-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Scope Sections
                </h3>
              </div>

              {scopeSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium truncate">{section.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                )
              })}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowILCFirst(true)}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">Back to ILC/PT</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                {renderScopeContent()}
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}


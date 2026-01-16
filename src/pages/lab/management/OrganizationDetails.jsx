import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Users2, 
  Briefcase, 
  Clock, 
  FileText,
  Upload,
  X,
  Plus,
  Save,
  ChevronRight,
  Check,
  Zap,
  Award,
  Info,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react'
import Button from '../../../components/labManagement/Button'
import Input from '../../../components/labManagement/Input'
import Card from '../../../components/labManagement/Card'
import toast from 'react-hot-toast'
import { useLabData } from '../../../contexts/LabDataContext'

const steps = [
  { id: 1, name: 'Laboratory Details', icon: Building2 },
  { id: 2, name: 'Registered Office', icon: MapPin },
  { id: 3, name: 'Parent Organization', icon: Briefcase },
  { id: 4, name: 'Working Days & Type', icon: Clock },
  { id: 5, name: 'Compliance Documents', icon: FileText },
  { id: 6, name: 'Undertakings & Policies', icon: FileText },
  { id: 7, name: 'Power & Water Supply', icon: Zap },
  { id: 8, name: 'Accreditation & Other', icon: Award },
  { id: 9, name: 'Quality Manual & SOPs', icon: BookOpen },
  { id: 10, name: 'Quality Formats & Procedures', icon: ClipboardList },
  { id: 11, name: 'Checklist', icon: CheckCircle2 },
]

const proofOfLabAddressOptions = [
  'Select',
  'Premises Proof as per Government Status (For Govt. Labs)',
  'Rent Agreement (Duly Notarized)',
  'Municipal Corporation/Local Body/Central Insecticides Board or Drug Controller/ Pollution Control Board',
  'Certificates from Registrar of Firms or Directorate of Industries or Industries Centre',
  'Other'
]

const proofOfLegalIdentityOptions = [
  'Select',
  'PAN Card',
  'Cert. from CA/Notarized Affidavit & Bank Passbook / ID Proof (For Sole Proprietorship)',
  'Certificate of Registration & MOA (For Pvt. and Public Ltd.)',
  'Certificate of Registration (For Partnership Firm)',
  'Certificate of registration under Goods & Service Tax Act.',
  'Certificate of registration under shop and establishment act',
  'Government Notification / Declaration',
  'Other'
]

const complianceDocumentOptions = [
  'Select',
  'AERB Clearance',
  'Environmental Clearance',
  'Other',
  'PESO Clearance'
]

const organizationTypeOptions = [
  'Select',
  'Government',
  'Private Limited Company',
  'Public Limited Company',
  'Partnership',
  'Sole Proprietorship',
  'Trust',
  'Society',
  'Other'
]

const certificationTypeOptions = [
  'Select',
  'NABL Certificate',
  'ISO Certificate',
  'Other'
]

const waterSourceOptions = [
  'Select',
  'Municipal Supply',
  'Own Source',
  'Both'
]

export default function OrganizationDetails() {
  const { organizationData, updateOrganizationData } = useLabData()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(organizationData || {
    // Laboratory Details
    labName: '',
    labAddress: '',
    labCountry: 'India',
    labState: '',
    labDistrict: '',
    labCity: '',
    labPinCode: '',
    labLogo: null,
    labProofOfAddress: 'Select',
    labProofOfAddressOther: '',
    labDocumentId: '',
    labAddressProofDocument: null,
    
    // Registered Office
    sameAsLabAddress: false,
    registeredAddress: '',
    registeredCountry: 'India',
    registeredState: '',
    registeredDistrict: '',
    registeredCity: '',
    registeredPinCode: '',
    registeredMobile: '',
    registeredTelephone: '',
    registeredFax: '',
    
    // Top Management Details
    topManagement: [{
      id: 1,
      name: '',
      designation: '',
      mobile: '',
      telephone: '',
      fax: ''
    }],
    topManagementDocument: null,
    
    // Parent Organization
    sameAsLaboratory: false,
    parentName: '',
    parentAddress: '',
    parentCountry: 'India',
    parentState: '',
    parentDistrict: '',
    parentCity: '',
    parentPinCode: '',
    
    // Bank Details
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    gstNumber: '',
    cancelledCheque: null,
    
    // Working Days & Hours
    workingDays: [],
    shiftTimings: [{ from: '', to: '' }],
    
    // Type of Organization
    organizationType: 'Select',
    organizationTypeOther: '',
    proofOfLegalIdentity: 'Select',
    proofOfLegalIdentityOther: '',
    legalIdentityDocumentId: '',
    legalIdentityDocument: null,
    
    // Statutory Compliance
    complianceDocuments: [],
    
    // Undertakings & Policies
    impartialityDocument: null,
    termsConditionsDocument: null,
    codeOfEthicsDocument: null,
    testingChargesPolicyDocument: null,
    
    // Power, Electric and Water Supply
    adequacySanctionedLoad: '',
    availabilityUninterruptedPower: false,
    stabilityOfSupply: false,
    waterSource: 'Select',
    
    // Accreditation Documents
    accreditationDocuments: [],
    
    // Other Details
    otherLabDetails: '',
    otherDetailsDocument: null,
    layoutLabPremises: null,
    organizationChart: null,
    gpsLatitude: '',
    gpsLongitude: '',
    
    // Quality Manual / Document
    qualityManualTitle: '',
    qualityManualIssueNumber: '',
    qualityManualIssueDate: '',
    qualityManualAmendments: '',
    qualityManualDocument: null,
    
    // Standard Operating Procedures
    sopList: [],
    
    // Quality Formats
    qualityFormats: [],
    
    // Quality Procedures
    qualityProcedures: []
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field, file) => {
    if (file) {
      // Validate file size (2MB for PDFs, 1MB for images)
      const maxSize = field === 'labLogo' ? 1 * 1024 * 1024 : 2 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`File size should not exceed ${field === 'labLogo' ? '1MB' : '2MB'}`)
        return
      }
      
      // Validate file type
      const allowedTypes = field === 'labLogo' 
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['application/pdf']
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Please upload ${field === 'labLogo' ? 'JPG/PNG' : 'PDF'} files only`)
        return
      }
      
      handleInputChange(field, file)
    }
  }

  const addTopManagement = () => {
    setFormData(prev => ({
      ...prev,
      topManagement: [...prev.topManagement, {
        id: prev.topManagement.length + 1,
        name: '',
        designation: '',
        mobile: '',
        telephone: '',
        fax: ''
      }]
    }))
  }

  const removeTopManagement = (id) => {
    if (formData.topManagement.length === 1) {
      toast.error('At least one top management member is required')
      return
    }
    setFormData(prev => ({
      ...prev,
      topManagement: prev.topManagement.filter(tm => tm.id !== id)
    }))
  }

  const updateTopManagement = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      topManagement: prev.topManagement.map(tm =>
        tm.id === id ? { ...tm, [field]: value } : tm
      )
    }))
  }

  const addShiftTiming = () => {
    if (formData.shiftTimings.length >= 4) {
      toast.error('Maximum 4 shifts are allowed')
      return
    }
    setFormData(prev => ({
      ...prev,
      shiftTimings: [...prev.shiftTimings, { from: '', to: '' }]
    }))
  }

  const removeShiftTiming = (index) => {
    if (formData.shiftTimings.length === 1) {
      toast.error('At least one shift timing is required')
      return
    }
    setFormData(prev => ({
      ...prev,
      shiftTimings: prev.shiftTimings.filter((_, i) => i !== index)
    }))
  }

  const updateShiftTiming = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      shiftTimings: prev.shiftTimings.map((shift, i) =>
        i === index ? { ...shift, [field]: value } : shift
      )
    }))
  }

  const toggleWorkingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }))
  }

  const addComplianceDocument = () => {
    setFormData(prev => ({
      ...prev,
      complianceDocuments: [...prev.complianceDocuments, {
        id: Date.now(),
        type: 'Select',
        typeOther: '',
        documentId: '',
        file: null
      }]
    }))
  }

  const removeComplianceDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      complianceDocuments: prev.complianceDocuments.filter(doc => doc.id !== id)
    }))
  }

  const updateComplianceDocument = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      complianceDocuments: prev.complianceDocuments.map(doc =>
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    }))
  }

  const addAccreditationDocument = () => {
    setFormData(prev => ({
      ...prev,
      accreditationDocuments: [...prev.accreditationDocuments, {
        id: Date.now(),
        type: 'Select',
        typeOther: '',
        certificateNo: '',
        certificateFile: null,
        scopeFile: null
      }]
    }))
  }

  const removeAccreditationDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      accreditationDocuments: prev.accreditationDocuments.filter(doc => doc.id !== id)
    }))
  }

  const updateAccreditationDocument = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      accreditationDocuments: prev.accreditationDocuments.map(doc =>
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    }))
  }

  // SOP Management
  const addSOP = () => {
    setFormData(prev => ({
      ...prev,
      sopList: [...prev.sopList, {
        id: Date.now(),
        title: '',
        number: '',
        issueNumber: '',
        issueDate: '',
        amendments: ''
      }]
    }))
  }

  const removeSOP = (id) => {
    setFormData(prev => ({
      ...prev,
      sopList: prev.sopList.filter(sop => sop.id !== id)
    }))
  }

  const updateSOP = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      sopList: prev.sopList.map(sop =>
        sop.id === id ? { ...sop, [field]: value } : sop
      )
    }))
  }

  // Quality Format Management
  const addQualityFormat = () => {
    setFormData(prev => ({
      ...prev,
      qualityFormats: [...prev.qualityFormats, {
        id: Date.now(),
        title: '',
        number: '',
        issueNumber: '',
        issueDate: '',
        amendments: ''
      }]
    }))
  }

  const removeQualityFormat = (id) => {
    setFormData(prev => ({
      ...prev,
      qualityFormats: prev.qualityFormats.filter(format => format.id !== id)
    }))
  }

  const updateQualityFormat = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      qualityFormats: prev.qualityFormats.map(format =>
        format.id === id ? { ...format, [field]: value } : format
      )
    }))
  }

  // Quality Procedure Management
  const addQualityProcedure = () => {
    setFormData(prev => ({
      ...prev,
      qualityProcedures: [...prev.qualityProcedures, {
        id: Date.now(),
        title: '',
        number: '',
        file: null,
        issueNumber: '',
        issueDate: '',
        amendments: ''
      }]
    }))
  }

  const removeQualityProcedure = (id) => {
    setFormData(prev => ({
      ...prev,
      qualityProcedures: prev.qualityProcedures.filter(proc => proc.id !== id)
    }))
  }

  const updateQualityProcedure = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      qualityProcedures: prev.qualityProcedures.map(proc =>
        proc.id === id ? { ...proc, [field]: value } : proc
      )
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.labName || !formData.labAddress || !formData.labState || 
            !formData.labDistrict || !formData.labCity || !formData.labPinCode) {
          toast.error('Please fill in all required laboratory details')
          return false
        }
        if (formData.labProofOfAddress === 'Select') {
          toast.error('Please select proof of laboratory address')
          return false
        }
        if (formData.labProofOfAddress === 'Other' && !formData.labProofOfAddressOther) {
          toast.error('Please specify other proof of address')
          return false
        }
        break
      case 2:
        if (!formData.sameAsLabAddress) {
          if (!formData.registeredAddress || !formData.registeredState || 
              !formData.registeredDistrict || !formData.registeredCity || 
              !formData.registeredPinCode || !formData.registeredMobile) {
            toast.error('Please fill in all required registered office details')
            return false
          }
        }
        if (formData.topManagement.some(tm => !tm.name || !tm.designation || !tm.mobile)) {
          toast.error('Please fill in all required top management details')
          return false
        }
        break
      case 4:
        if (formData.workingDays.length === 0) {
          toast.error('Please select at least one working day')
          return false
        }
        if (formData.shiftTimings.some(shift => !shift.from || !shift.to)) {
          toast.error('Please fill in all shift timings')
          return false
        }
        if (formData.organizationType === 'Select') {
          toast.error('Please select organization type')
          return false
        }
        if (formData.organizationType === 'Other' && !formData.organizationTypeOther) {
          toast.error('Please specify other organization type')
          return false
        }
        if (formData.proofOfLegalIdentity === 'Select') {
          toast.error('Please select proof of legal identity')
          return false
        }
        break
      case 6:
        if (!formData.impartialityDocument || !formData.termsConditionsDocument || 
            !formData.codeOfEthicsDocument || !formData.testingChargesPolicyDocument) {
          toast.error('Please upload all required policy documents')
          return false
        }
        break
      case 7:
        if (!formData.adequacySanctionedLoad) {
          toast.error('Please fill in adequacy of sanctioned load details')
          return false
        }
        if (formData.waterSource === 'Select') {
          toast.error('Please select water source')
          return false
        }
        break
      case 8:
        if (!formData.layoutLabPremises || !formData.organizationChart) {
          toast.error('Please upload layout and organization chart documents')
          return false
        }
        if (!formData.gpsLatitude || !formData.gpsLongitude) {
          toast.error('Please fill in GPS coordinates')
          return false
        }
        break
      case 9:
        if (!formData.qualityManualTitle || !formData.qualityManualIssueNumber || 
            !formData.qualityManualIssueDate || !formData.qualityManualAmendments) {
          toast.error('Please fill in all quality manual details')
          return false
        }
        if (!formData.qualityManualDocument) {
          toast.error('Please upload quality manual document')
          return false
        }
        break
      default:
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSave = () => {
    if (validateStep(currentStep)) {
      updateOrganizationData(formData)
      toast.success('Organization details saved successfully!')
    }
  }

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return
    
    // Validate all required fields across all steps
    if (!formData.labName || !formData.labAddress) {
      toast.error('Please complete all required fields')
      setCurrentStep(1)
      return
    }
    
    updateOrganizationData(formData)
    toast.success('Organization details submitted successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Details</h1>
          <p className="text-gray-600 mt-2">
            Step 1: Complete your laboratory organization information
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep === step.id
                      ? 'bg-primary border-primary text-white'
                      : currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <p
                  className={`text-xs mt-2 text-center font-medium ${
                    currentStep === step.id
                      ? 'text-primary'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mb-6 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            {/* Step 1: Laboratory Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    Laboratory Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter complete name and address of the Laboratory and submit proof of address.
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload Logo of your laboratory. JPG files are recommended of not more than 1 MB size.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formData.labLogo ? formData.labLogo.name : 'Choose file...'}
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('labLogo', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.labLogo && (
                      <Button
                        variant="outline"
                        onClick={() => handleInputChange('labLogo', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Name"
                      value={formData.labName}
                      onChange={(e) => handleInputChange('labName', e.target.value)}
                      placeholder="Enter laboratory name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.labAddress}
                      onChange={(e) => handleInputChange('labAddress', e.target.value)}
                      placeholder="Enter complete address"
                      rows={3}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.labCountry}
                      onChange={(e) => handleInputChange('labCountry', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  <Input
                    label="State"
                    value={formData.labState}
                    onChange={(e) => handleInputChange('labState', e.target.value)}
                    placeholder="Enter state"
                    required
                  />

                  <Input
                    label="District"
                    value={formData.labDistrict}
                    onChange={(e) => handleInputChange('labDistrict', e.target.value)}
                    placeholder="Enter district"
                    required
                  />

                  <Input
                    label="City"
                    value={formData.labCity}
                    onChange={(e) => handleInputChange('labCity', e.target.value)}
                    placeholder="Enter city"
                    required
                  />

                  <Input
                    label="Pin Code"
                    value={formData.labPinCode}
                    onChange={(e) => handleInputChange('labPinCode', e.target.value)}
                    placeholder="Enter pin code"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proof of Laboratory Address <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.labProofOfAddress}
                      onChange={(e) => handleInputChange('labProofOfAddress', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {proofOfLabAddressOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Document ID (Optional)"
                    value={formData.labDocumentId}
                    onChange={(e) => handleInputChange('labDocumentId', e.target.value)}
                    placeholder="e.g., Pan no. in case of PAN Card"
                  />
                </div>

                {formData.labProofOfAddress === 'Other' && (
                  <Input
                    label="Specify Other Proof of Address"
                    value={formData.labProofOfAddressOther}
                    onChange={(e) => handleInputChange('labProofOfAddressOther', e.target.value)}
                    placeholder="Specify other proof of address"
                    required
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof Document <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Only PDF file of up to 2 MB size are allowed.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formData.labAddressProofDocument ? formData.labAddressProofDocument.name : 'Choose file...'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload('labAddressProofDocument', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.labAddressProofDocument && (
                      <Button
                        variant="outline"
                        onClick={() => handleInputChange('labAddressProofDocument', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Registered Office & Top Management */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Registered Office */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      Address of Registered Office / Head Office
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill complete address of registered office (if different from the address filled above), otherwise click same as above.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sameAsLabAddress"
                      checked={formData.sameAsLabAddress}
                      onChange={(e) => handleInputChange('sameAsLabAddress', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="sameAsLabAddress" className="text-sm font-medium text-gray-700">
                      Same as above
                    </label>
                  </div>

                  {!formData.sameAsLabAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.registeredAddress}
                          onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                          placeholder="Enter complete address"
                          rows={3}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.registeredCountry}
                          onChange={(e) => handleInputChange('registeredCountry', e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="India">India</option>
                        </select>
                      </div>

                      <Input
                        label="State"
                        value={formData.registeredState}
                        onChange={(e) => handleInputChange('registeredState', e.target.value)}
                        placeholder="Enter state"
                        required
                      />

                      <Input
                        label="District"
                        value={formData.registeredDistrict}
                        onChange={(e) => handleInputChange('registeredDistrict', e.target.value)}
                        placeholder="Enter district"
                        required
                      />

                      <Input
                        label="City"
                        value={formData.registeredCity}
                        onChange={(e) => handleInputChange('registeredCity', e.target.value)}
                        placeholder="Enter city"
                        required
                      />

                      <Input
                        label="Pin Code"
                        value={formData.registeredPinCode}
                        onChange={(e) => handleInputChange('registeredPinCode', e.target.value)}
                        placeholder="Enter pin code"
                        required
                      />

                      <Input
                        label="Mobile Number"
                        value={formData.registeredMobile}
                        onChange={(e) => handleInputChange('registeredMobile', e.target.value)}
                        placeholder="eg. +91 9818035577"
                        required
                      />

                      <Input
                        label="Telephone Number"
                        value={formData.registeredTelephone}
                        onChange={(e) => handleInputChange('registeredTelephone', e.target.value)}
                        placeholder="Telephone number"
                      />

                      <Input
                        label="Fax"
                        value={formData.registeredFax}
                        onChange={(e) => handleInputChange('registeredFax', e.target.value)}
                        placeholder="Fax number"
                      />
                    </div>
                  )}
                </div>

                {/* Top Management Details */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Users2 className="w-6 h-6 text-primary" />
                      Name & Designation of Top Management and Contact Person
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the details of Top Management and Contact Person of the Laboratory.
                      To add multiple personnel details please use "Add more".
                    </p>
                  </div>

                  {formData.topManagement.map((member, index) => (
                    <div key={member.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Person {index + 1}</h3>
                        {formData.topManagement.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTopManagement(member.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Name"
                          value={member.name}
                          onChange={(e) => updateTopManagement(member.id, 'name', e.target.value)}
                          placeholder="Enter name"
                          required
                        />

                        <Input
                          label="Designation"
                          value={member.designation}
                          onChange={(e) => updateTopManagement(member.id, 'designation', e.target.value)}
                          placeholder="Enter designation"
                          required
                        />

                        <Input
                          label="Mobile Number"
                          value={member.mobile}
                          onChange={(e) => updateTopManagement(member.id, 'mobile', e.target.value)}
                          placeholder="eg. +91 9818035577"
                          required
                        />

                        <Input
                          label="Telephone Number"
                          value={member.telephone}
                          onChange={(e) => updateTopManagement(member.id, 'telephone', e.target.value)}
                          placeholder="Telephone number"
                        />

                        <Input
                          label="Fax"
                          value={member.fax}
                          onChange={(e) => updateTopManagement(member.id, 'fax', e.target.value)}
                          placeholder="Fax number"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addTopManagement}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more
                  </Button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Top Management Details
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload all Top Management / Director details on your letter head or upload any relevant document
                      containing such details e.g., MOA. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.topManagementDocument ? formData.topManagementDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('topManagementDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.topManagementDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('topManagementDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Parent Organization & Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Parent Organization */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-primary" />
                      Parent Organization
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill details of parent organization (in case laboratory is part of larger group), otherwise click same as above.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sameAsLaboratory"
                      checked={formData.sameAsLaboratory}
                      onChange={(e) => handleInputChange('sameAsLaboratory', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="sameAsLaboratory" className="text-sm font-medium text-gray-700">
                      Same as laboratory
                    </label>
                  </div>

                  {!formData.sameAsLaboratory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          label="Name"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          placeholder="Enter parent organization name"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <textarea
                          value={formData.parentAddress}
                          onChange={(e) => handleInputChange('parentAddress', e.target.value)}
                          placeholder="Enter complete address"
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          value={formData.parentCountry}
                          onChange={(e) => handleInputChange('parentCountry', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="India">India</option>
                        </select>
                      </div>

                      <Input
                        label="State"
                        value={formData.parentState}
                        onChange={(e) => handleInputChange('parentState', e.target.value)}
                        placeholder="Enter state"
                      />

                      <Input
                        label="District"
                        value={formData.parentDistrict}
                        onChange={(e) => handleInputChange('parentDistrict', e.target.value)}
                        placeholder="Enter district"
                      />

                      <Input
                        label="City"
                        value={formData.parentCity}
                        onChange={(e) => handleInputChange('parentCity', e.target.value)}
                        placeholder="Enter city"
                      />

                      <Input
                        label="Pin Code"
                        value={formData.parentPinCode}
                        onChange={(e) => handleInputChange('parentPinCode', e.target.value)}
                        placeholder="Enter pin code"
                      />
                    </div>
                  )}
                </div>

                {/* Laboratory Bank Details */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Laboratory Bank Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter complete name and address of the Laboratory and submit proof of address.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Account Holder Name"
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      placeholder="Enter account holder name"
                      required
                    />

                    <Input
                      label="Account Number"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                      required
                    />

                    <Input
                      label="IFSC Code"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      placeholder="Enter IFSC code"
                      required
                    />

                    <Input
                      label="Branch Name"
                      value={formData.branchName}
                      onChange={(e) => handleInputChange('branchName', e.target.value)}
                      placeholder="Enter branch name"
                      required
                    />

                    <Input
                      label="GST Number"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                      placeholder="Enter GST number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancelled Cheque <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a copy of cancelled cheque of the bank a/c provided. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.cancelledCheque ? formData.cancelledCheque.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('cancelledCheque', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.cancelledCheque && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('cancelledCheque', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Working Days & Type of Organization */}
            {currentStep === 4 && (
              <div className="space-y-8">
                {/* Normal Working Days & Hours */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-primary" />
                      Normal Working Day(s) & Hours
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill in the details of Working Days and Shift Timings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Working Day(s) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <label
                          key={day}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.workingDays.includes(day)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.workingDays.includes(day)}
                            onChange={() => toggleWorkingDay(day)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Add Shift Timings <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      You may add multiple shift timings by using the "+" button. A maximum of 4 shifts are allowed.
                    </p>

                    <div className="space-y-3">
                      {formData.shiftTimings.map((shift, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="time"
                              value={shift.from}
                              onChange={(e) => updateShiftTiming(index, 'from', e.target.value)}
                              required
                              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="text-gray-500">To</span>
                            <input
                              type="time"
                              value={shift.to}
                              onChange={(e) => updateShiftTiming(index, 'to', e.target.value)}
                              required
                              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div className="flex gap-2">
                            {index === formData.shiftTimings.length - 1 && formData.shiftTimings.length < 4 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addShiftTiming}
                              >
                                <Plus className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            {formData.shiftTimings.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeShiftTiming(index)}
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Type of Organization */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Type of Organization
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill details of organization and upload the proof of its identity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) => handleInputChange('organizationType', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {organizationTypeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {formData.organizationType === 'Other' && (
                      <Input
                        label="Specify Other Organization Type"
                        value={formData.organizationTypeOther}
                        onChange={(e) => handleInputChange('organizationTypeOther', e.target.value)}
                        placeholder="Specify other organization type"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof of Legal Identity <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.proofOfLegalIdentity}
                        onChange={(e) => handleInputChange('proofOfLegalIdentity', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {proofOfLegalIdentityOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Document ID (Optional)"
                      value={formData.legalIdentityDocumentId}
                      onChange={(e) => handleInputChange('legalIdentityDocumentId', e.target.value)}
                      placeholder="e.g., Pan no. in case of PAN Card"
                    />
                  </div>

                  {formData.proofOfLegalIdentity === 'Other' && (
                    <Input
                      label="Specify Other Proof of Legal Identity"
                      value={formData.proofOfLegalIdentityOther}
                      onChange={(e) => handleInputChange('proofOfLegalIdentityOther', e.target.value)}
                      placeholder="Specify other proof of legal identity"
                      required
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Identity Proof Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.legalIdentityDocument ? formData.legalIdentityDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('legalIdentityDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.legalIdentityDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('legalIdentityDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Statutory Compliance Documents */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Statutory Compliance Documents
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload the documents related to statutory compliance (if required by the Laboratory).
                  </p>
                </div>

                {formData.complianceDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No compliance documents added yet</p>
                    <Button onClick={addComplianceDocument}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                ) : (
                  <>
                    {formData.complianceDocuments.map((doc, index) => (
                      <div key={doc.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">Document {index + 1}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeComplianceDocument(doc.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Document Type
                            </label>
                            <select
                              value={doc.type}
                              onChange={(e) => updateComplianceDocument(doc.id, 'type', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              {complianceDocumentOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>

                          <Input
                            label="Document ID (Optional)"
                            value={doc.documentId}
                            onChange={(e) => updateComplianceDocument(doc.id, 'documentId', e.target.value)}
                            placeholder="Document ID"
                          />
                        </div>

                        {doc.type === 'Other' && (
                          <Input
                            label="Specify Document Type"
                            value={doc.typeOther}
                            onChange={(e) => updateComplianceDocument(doc.id, 'typeOther', e.target.value)}
                            placeholder="Specify document type"
                          />
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Upload a document to provide details of clearances received by the Lab as per document selected in the list.
                            e.g. Environmental Clearance Certificate issued by competent authority.
                            Only PDF file of up to 2 MB size are allowed.
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {doc.file ? doc.file.name : 'Choose file...'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                      const maxSize = 2 * 1024 * 1024
                                      if (file.size > maxSize) {
                                        toast.error('File size should not exceed 2MB')
                                        return
                                      }
                                      if (file.type !== 'application/pdf') {
                                        toast.error('Please upload PDF files only')
                                        return
                                      }
                                      updateComplianceDocument(doc.id, 'file', file)
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {doc.file && (
                              <Button
                                variant="outline"
                                onClick={() => updateComplianceDocument(doc.id, 'file', null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addComplianceDocument}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add more
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Step 6: Undertakings & Policies */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Undertakings & Policies
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload the undertakings as required in following fields (Signed and Stamped as per the instructions given in the forms).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Impartiality Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Impartiality Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload an Impartiality Document as per format provided. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.impartialityDocument ? formData.impartialityDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('impartialityDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.impartialityDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('impartialityDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Terms & Conditions Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a Terms & Conditions Document as per format provided. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.termsConditionsDocument ? formData.termsConditionsDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('termsConditionsDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.termsConditionsDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('termsConditionsDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Code of Ethics Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Code of Ethics Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a Code of Ethics Document as per format provided. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.codeOfEthicsDocument ? formData.codeOfEthicsDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('codeOfEthicsDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.codeOfEthicsDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('codeOfEthicsDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Testing Charges Policy Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Testing Charges Policy Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a Testing Charges Document as per format provided. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.testingChargesPolicyDocument ? formData.testingChargesPolicyDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('testingChargesPolicyDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.testingChargesPolicyDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('testingChargesPolicyDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Power, Electric and Water Supply */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Power / Electricity And Water Supply
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload documents related to Power supply, Power Backup and Water supply.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Adequacy of Sanctioned Load / Captive Power for Testing"
                    value={formData.adequacySanctionedLoad}
                    onChange={(e) => handleInputChange('adequacySanctionedLoad', e.target.value)}
                    placeholder="Enter details"
                    required
                  />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="availabilityUninterruptedPower"
                        checked={formData.availabilityUninterruptedPower}
                        onChange={(e) => handleInputChange('availabilityUninterruptedPower', e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="availabilityUninterruptedPower" className="text-sm font-medium text-gray-700">
                        Availability of Uninterrupted Power Supply
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Check this box in case Power Backup is available in the Lab.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="stabilityOfSupply"
                        checked={formData.stabilityOfSupply}
                        onChange={(e) => handleInputChange('stabilityOfSupply', e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="stabilityOfSupply" className="text-sm font-medium text-gray-700">
                        Stability of Supply
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Check this box in case regular Electric supply is efficient and has minimal downtime.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Source <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Make a selection from the List if Lab has Municipal Supply or Own Source or Both.
                    </p>
                    <select
                      value={formData.waterSource}
                      onChange={(e) => handleInputChange('waterSource', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {waterSourceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Accreditation & Other Details */}
            {currentStep === 8 && (
              <div className="space-y-8">
                {/* Accreditation Documents */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="w-6 h-6 text-primary" />
                      Accreditation Documents / Certification Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload Certificate of Accreditation / Registration and Scope as per IS/ISO/IEC 17025.
                    </p>
                  </div>

                  {formData.accreditationDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No accreditation documents added yet</p>
                      <Button onClick={addAccreditationDocument}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  ) : (
                    <>
                      {formData.accreditationDocuments.map((doc, index) => (
                        <div key={doc.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Accreditation {index + 1}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAccreditationDocument(doc.id)}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Certification Type
                              </label>
                              <select
                                value={doc.type}
                                onChange={(e) => updateAccreditationDocument(doc.id, 'type', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              >
                                {certificationTypeOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>

                            <Input
                              label="Certificate No."
                              value={doc.certificateNo}
                              onChange={(e) => updateAccreditationDocument(doc.id, 'certificateNo', e.target.value)}
                              placeholder="Enter certificate number"
                            />
                          </div>

                          {doc.type === 'Other' && (
                            <Input
                              label="Specify Certification Type"
                              value={doc.typeOther}
                              onChange={(e) => updateAccreditationDocument(doc.id, 'typeOther', e.target.value)}
                              placeholder="Specify certification type"
                            />
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upload Certificate */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Certificate
                              </label>
                              <p className="text-xs text-gray-500 mb-2">
                                Upload a document to provide details of Accreditation/Certifications received by the Lab.
                                Only PDF file of up to 2 MB size are allowed.
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                      {doc.certificateFile ? doc.certificateFile.name : 'Choose file...'}
                                    </span>
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                          const maxSize = 2 * 1024 * 1024
                                          if (file.size > maxSize) {
                                            toast.error('File size should not exceed 2MB')
                                            return
                                          }
                                          if (file.type !== 'application/pdf') {
                                            toast.error('Please upload PDF files only')
                                            return
                                          }
                                          updateAccreditationDocument(doc.id, 'certificateFile', file)
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                {doc.certificateFile && (
                                  <Button
                                    variant="outline"
                                    onClick={() => updateAccreditationDocument(doc.id, 'certificateFile', null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Upload Scope */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Scope
                              </label>
                              <p className="text-xs text-gray-500 mb-2">
                                Upload a document to provide details of Scope for which Lab is Accredited.
                                Only PDF file of up to 2 MB size are allowed.
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                      {doc.scopeFile ? doc.scopeFile.name : 'Choose file...'}
                                    </span>
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                          const maxSize = 2 * 1024 * 1024
                                          if (file.size > maxSize) {
                                            toast.error('File size should not exceed 2MB')
                                            return
                                          }
                                          if (file.type !== 'application/pdf') {
                                            toast.error('Please upload PDF files only')
                                            return
                                          }
                                          updateAccreditationDocument(doc.id, 'scopeFile', file)
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                {doc.scopeFile && (
                                  <Button
                                    variant="outline"
                                    onClick={() => updateAccreditationDocument(doc.id, 'scopeFile', null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={addAccreditationDocument}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add more
                      </Button>
                    </>
                  )}
                </div>

                {/* Other Lab Details */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-6 h-6 text-primary" />
                      Other Lab Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Any other information including Recognition / Accreditation by other Govt Department / Agencies.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Details
                    </label>
                    <textarea
                      value={formData.otherLabDetails}
                      onChange={(e) => handleInputChange('otherLabDetails', e.target.value)}
                      placeholder="Enter any additional information related to Lab Accreditation, Recognition etc. not provided previously"
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Document
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload any supporting document for validation. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.otherDetailsDocument ? formData.otherDetailsDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('otherDetailsDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.otherDetailsDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('otherDetailsDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Details - Layout, Organization Chart, GPS */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Additional Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Provide the details of Lab Layout, Organization Chart and GPS Location details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Layout of Laboratory Premises */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout of Laboratory Premises <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload a document to provide building/floor plans of the Lab. Only PDF file of up to 2 MB size are allowed.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                            <Upload className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formData.layoutLabPremises ? formData.layoutLabPremises.name : 'Choose file...'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload('layoutLabPremises', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {formData.layoutLabPremises && (
                          <Button
                            variant="outline"
                            onClick={() => handleInputChange('layoutLabPremises', null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Organization Chart */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Chart <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload a document to provide details of Organization Structure Diagram on Lab Letter Head.
                        Only PDF file of up to 2 MB size are allowed.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                            <Upload className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formData.organizationChart ? formData.organizationChart.name : 'Choose file...'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload('organizationChart', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {formData.organizationChart && (
                          <Button
                            variant="outline"
                            onClick={() => handleInputChange('organizationChart', null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPS Coordinates <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Enter the GPS Coordinates (Latitude & Longitude) of the LAB. You may use Google Maps to ascertain these details.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Latitude"
                        value={formData.gpsLatitude}
                        onChange={(e) => handleInputChange('gpsLatitude', e.target.value)}
                        placeholder="Enter latitude"
                        required
                      />
                      <Input
                        label="Longitude"
                        value={formData.gpsLongitude}
                        onChange={(e) => handleInputChange('gpsLongitude', e.target.value)}
                        placeholder="Enter longitude"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Quality Manual & SOPs */}
            {currentStep === 9 && (
              <div className="space-y-8">
                {/* Quality Manual / Document */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-primary" />
                      Quality Manual / Document
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the details of latest Quality Manual.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Title"
                        value={formData.qualityManualTitle}
                        onChange={(e) => handleInputChange('qualityManualTitle', e.target.value)}
                        placeholder="Enter quality manual title"
                        required
                      />
                    </div>

                    <Input
                      label="Issue Number"
                      value={formData.qualityManualIssueNumber}
                      onChange={(e) => handleInputChange('qualityManualIssueNumber', e.target.value)}
                      placeholder="Enter issue number"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.qualityManualIssueDate}
                        onChange={(e) => handleInputChange('qualityManualIssueDate', e.target.value)}
                        placeholder="dd/mm/yyyy"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the Date of Issue of Current Quality Manual being followed.
                      </p>
                    </div>

                    <Input
                      label="Amendments"
                      value={formData.qualityManualAmendments}
                      onChange={(e) => handleInputChange('qualityManualAmendments', e.target.value)}
                      placeholder="Enter number of amendments"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Manual / Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload the Quality Manual / Other Document followed by the Lab. Only PDF file of up to 2 MB size are allowed.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formData.qualityManualDocument ? formData.qualityManualDocument.name : 'Choose file...'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('qualityManualDocument', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.qualityManualDocument && (
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('qualityManualDocument', null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Standard Operating Procedures */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Standard Operating Procedures
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the details of latest Standard Operating Procedures.
                    </p>
                  </div>

                  {formData.sopList.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No SOPs added yet</p>
                      <Button onClick={addSOP}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add SOP
                      </Button>
                    </div>
                  ) : (
                    <>
                      {formData.sopList.map((sop, index) => (
                        <div key={sop.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">SOP {index + 1}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSOP(sop.id)}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="SOP Title"
                              value={sop.title}
                              onChange={(e) => updateSOP(sop.id, 'title', e.target.value)}
                              placeholder="Enter SOP title"
                            />

                            <Input
                              label="SOP Number"
                              value={sop.number}
                              onChange={(e) => updateSOP(sop.id, 'number', e.target.value)}
                              placeholder="Enter SOP number"
                            />

                            <Input
                              label="SOP Issue Number"
                              value={sop.issueNumber}
                              onChange={(e) => updateSOP(sop.id, 'issueNumber', e.target.value)}
                              placeholder="Enter issue number"
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SOP Issue Date
                              </label>
                              <input
                                type="date"
                                value={sop.issueDate}
                                onChange={(e) => updateSOP(sop.id, 'issueDate', e.target.value)}
                                placeholder="dd/mm/yyyy"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>

                            <Input
                              label="SOP Amendments"
                              value={sop.amendments}
                              onChange={(e) => updateSOP(sop.id, 'amendments', e.target.value)}
                              placeholder="Enter amendments"
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={addSOP}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add more
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 10: Quality Formats & Procedures */}
            {currentStep === 10 && (
              <div className="space-y-8">
                {/* Quality Formats */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-6 h-6 text-primary" />
                      Quality Formats
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the details of latest Quality Formats.
                    </p>
                  </div>

                  {formData.qualityFormats.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No quality formats added yet</p>
                      <Button onClick={addQualityFormat}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Quality Format
                      </Button>
                    </div>
                  ) : (
                    <>
                      {formData.qualityFormats.map((format, index) => (
                        <div key={format.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Quality Format {index + 1}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQualityFormat(format.id)}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Format Title"
                              value={format.title}
                              onChange={(e) => updateQualityFormat(format.id, 'title', e.target.value)}
                              placeholder="Enter format title"
                            />

                            <Input
                              label="Format Number"
                              value={format.number}
                              onChange={(e) => updateQualityFormat(format.id, 'number', e.target.value)}
                              placeholder="Enter format number"
                            />

                            <Input
                              label="Issue Number"
                              value={format.issueNumber}
                              onChange={(e) => updateQualityFormat(format.id, 'issueNumber', e.target.value)}
                              placeholder="Enter issue number"
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                value={format.issueDate}
                                onChange={(e) => updateQualityFormat(format.id, 'issueDate', e.target.value)}
                                placeholder="dd/mm/yyyy"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>

                            <Input
                              label="Amendments"
                              value={format.amendments}
                              onChange={(e) => updateQualityFormat(format.id, 'amendments', e.target.value)}
                              placeholder="Enter amendments"
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={addQualityFormat}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add more
                      </Button>
                    </>
                  )}
                </div>

                {/* Quality Procedures */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Quality Procedures
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Copies of such documents of the laboratory which cover the requirements specific to this scheme which inter alia include,
                      but not limited to the following.
                    </p>
                  </div>

                  {formData.qualityProcedures.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No quality procedures added yet</p>
                      <Button onClick={addQualityProcedure}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Quality Procedure
                      </Button>
                    </div>
                  ) : (
                    <>
                      {formData.qualityProcedures.map((procedure, index) => (
                        <div key={procedure.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Quality Procedure {index + 1}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQualityProcedure(procedure.id)}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Procedure Title"
                              value={procedure.title}
                              onChange={(e) => updateQualityProcedure(procedure.id, 'title', e.target.value)}
                              placeholder="Enter procedure title"
                              required
                            />

                            <Input
                              label="Procedure Number"
                              value={procedure.number}
                              onChange={(e) => updateQualityProcedure(procedure.id, 'number', e.target.value)}
                              placeholder="Enter procedure number"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Attach Quality Procedure <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                              Upload the Quality Procedures followed by the Lab. Only PDF file of up to 2 MB size are allowed.
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">
                                    {procedure.file ? procedure.file.name : 'Choose file...'}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                      const file = e.target.files[0]
                                      if (file) {
                                        const maxSize = 2 * 1024 * 1024
                                        if (file.size > maxSize) {
                                          toast.error('File size should not exceed 2MB')
                                          return
                                        }
                                        if (file.type !== 'application/pdf') {
                                          toast.error('Please upload PDF files only')
                                          return
                                        }
                                        updateQualityProcedure(procedure.id, 'file', file)
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              {procedure.file && (
                                <Button
                                  variant="outline"
                                  onClick={() => updateQualityProcedure(procedure.id, 'file', null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Issue Number"
                              value={procedure.issueNumber}
                              onChange={(e) => updateQualityProcedure(procedure.id, 'issueNumber', e.target.value)}
                              placeholder="Enter issue number"
                              required
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={procedure.issueDate}
                                onChange={(e) => updateQualityProcedure(procedure.id, 'issueDate', e.target.value)}
                                placeholder="dd/mm/yyyy"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Enter the Date of Issue of Current Quality Procedures being followed.
                              </p>
                            </div>

                            <Input
                              label="Amendments"
                              value={procedure.amendments}
                              onChange={(e) => updateQualityProcedure(procedure.id, 'amendments', e.target.value)}
                              placeholder="Enter amendments"
                              required
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={addQualityProcedure}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add more
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 11: Checklist */}
            {currentStep === 11 && (
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    Checklist
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Validate the completeness of each section of the Lab Registration process.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-700">
                    Make Payment link will be enabled once all sections are completed. Lab will be able to make Payment through Bill Desk Payment Gateway by using NEFT/RTGS/Debit Card/Credit Card/Wallets.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {steps.slice(0, -1).map((step, index) => {
                        const isCompleted = validateStep(step.id)
                        return (
                          <tr key={step.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {step.name} {!isCompleted && <span className="text-red-500">*</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isCompleted ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setCurrentStep(step.id)}
                                className="text-primary hover:text-primary-dark"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    size="lg"
                    disabled={!steps.slice(0, -1).every(step => validateStep(step.id))}
                    className="px-8"
                  >
                    Make Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Next
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    <Check className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}



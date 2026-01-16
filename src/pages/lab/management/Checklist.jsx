import { useState } from 'react'
import { 
  CheckCircle2, 
  Clock,
  Edit,
  CreditCard,
  ChevronLeft
} from 'lucide-react'
import Button from '../../../components/labManagement/Button'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function Checklist() {
  const navigate = useNavigate()

  // Mock checklist data - in real app, this would come from API
  const [checklistItems] = useState([
    { id: 1, subject: 'Laboratory Details', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 2, subject: 'Address of Registered Office / Head Office', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 3, subject: 'Name & Designation of Top Management / Contact Person', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 4, subject: 'Normal Working Day(s) & Hours', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 5, subject: 'Type of Organization', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 6, subject: 'Parent Organization', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 7, subject: 'Bank Details', mandatory: true, status: 'pending', route: '/lab/management/organization-details' },
    { id: 8, subject: 'Statutory Compliance Documents', mandatory: false, status: 'pending', route: '/lab/management/organization-details' },
    { id: 9, subject: 'Accreditation Documents / Certification Details', mandatory: true, status: 'pending', route: '/lab/management/other-details' },
    { id: 10, subject: 'Other Details', mandatory: true, status: 'pending', route: '/lab/management/other-details' },
    { id: 11, subject: 'Undertakings & Policies', mandatory: false, status: 'pending', route: '/lab/management/other-details' },
    { id: 12, subject: 'Power, Electric and Water Supply', mandatory: false, status: 'pending', route: '/lab/management/other-details' },
    { id: 13, subject: 'Quality Manual / Document', mandatory: false, status: 'pending', route: '/lab/management/system' },
    { id: 14, subject: 'Quality Procedures', mandatory: false, status: 'pending', route: '/lab/management/system' },
    { id: 15, subject: 'Standard Operating Procedures', mandatory: false, status: 'pending', route: '/lab/management/system' },
    { id: 16, subject: 'Quality Formats', mandatory: false, status: 'pending', route: '/lab/management/system' },
    { id: 17, subject: 'Inter Lab Comparison / Proficiency Testing', mandatory: false, status: 'pending', route: '/lab/management/inter-lab-comparison' },
    { id: 18, subject: 'Internal Audit', mandatory: true, status: 'pending', route: '/lab/management/inter-lab-comparison' },
    { id: 19, subject: 'Management Review', mandatory: true, status: 'pending', route: '/lab/management/inter-lab-comparison' },
    { id: 20, subject: 'Scope', mandatory: true, status: 'pending', route: '/lab/management/scope-recognition' },
    { id: 21, subject: 'Lab Manpower', mandatory: true, status: 'pending', route: '/lab/management/manpower' }
  ])

  const completedCount = checklistItems.filter(item => item.status === 'completed').length
  const totalCount = checklistItems.length
  const allCompleted = completedCount === totalCount

  const handleEdit = (route) => {
    navigate(route)
  }

  const handleMakePayment = () => {
    if (!allCompleted) {
      toast.error('Please complete all sections before making payment')
      return
    }
    toast.info('Redirecting to payment gateway...')
    // In real app, this would redirect to payment gateway
  }

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    }
    return <Clock className="w-5 h-5 text-yellow-600" />
  }

  const getStatusText = (status) => {
    return status === 'completed' ? 'Completed' : 'Pending'
  }

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-700' : 'text-yellow-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h1 className="text-2xl font-bold text-gray-900">Step 7 : Checklist</h1>
        <p className="text-sm text-gray-600 mt-1">
          Validate the completeness of each section of the Lab Registration process
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/30">
            <h3 className="text-xl font-bold mb-6">Checklist</h3>

            {/* Progress Summary */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-primary">
                  {completedCount} / {totalCount} Completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {checklistItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{item.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {item.subject}
                          {item.mandatory && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(item.route)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 sticky top-6">
            <h4 className="font-bold text-gray-900 mb-4">CHECKLIST</h4>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>• In this section User can Validate the completeness of each section of the Lab Registration process.</li>
              <li>• User can see the Section Name (*for mandatory section), Its Status (Pending or Completed) and Option to Edit that section by using the Edit function.</li>
            </ul>

            {allCompleted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">All Sections Completed!</h5>
                <p className="text-sm text-green-700 mb-3">
                  You can now proceed to make payment.
                </p>
                <ul className="space-y-1 text-xs text-green-700 mb-4">
                  <li>• Make Payment link will be enabled once All Sections are Completed.</li>
                  <li>• Lab will be able to make Payment through Bill Desk Payment Gateway by using NEFT/RTGS/Debit Card/Credit Card/Wallets.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <Button
            variant="secondary"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => window.history.back()}
          >
            Previous
          </Button>
        </div>
        <div>
          <Button
            variant="primary"
            icon={<CreditCard className="w-4 h-4" />}
            onClick={handleMakePayment}
            disabled={!allCompleted}
            className={!allCompleted ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Make Payment
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Checklist

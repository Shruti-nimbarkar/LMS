import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FolderOpen, Lock, Unlock, Download, Eye, Trash2 } from 'lucide-react'
import { documentControlService } from '../../../services/labManagementApi'
import toast from 'react-hot-toast'
import Card from '../../../components/labManagement/Card'
import Button from '../../../components/labManagement/Button'
import Badge from '../../../components/labManagement/Badge'
import Input from '../../../components/labManagement/Input'
import Modal from '../../../components/labManagement/Modal'
import CreateDocumentForm from '../../../components/labManagement/forms/CreateDocumentForm'

function QADocumentControl() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const data = await documentControlService.getAll()
      setDocuments(data)
    } catch (error) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleLock = async (id, shouldLock) => {
    try {
      if (shouldLock) {
        await documentControlService.lock(id)
        toast.success('Document locked')
      } else {
        await documentControlService.unlock(id)
        toast.success('Document unlocked')
      }
      loadDocuments()
    } catch (error) {
      toast.error('Failed to update document lock status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await documentControlService.delete(id)
      toast.success('Document deleted successfully')
      loadDocuments()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.approvedBy?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesType = selectedType === 'all' || doc.documentType === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            Document Control
          </h1>
          <p className="text-gray-600 mt-1">Central repository for policies, certificates, and reports</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Document
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="Policy">Policy</option>
            <option value="Certificate">Certificate</option>
            <option value="Report">Report</option>
            <option value="Procedure">Procedure</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="Policy">Policy</option>
            <option value="Certificate">Certificate</option>
            <option value="Report">Report</option>
            <option value="Procedure">Procedure</option>
          </select>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No documents found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first document</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    {doc.locked && (
                      <Badge variant="warning">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                    <Badge variant="success">
                      {doc.status}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{doc.documentId}</p>
                
                <div className="space-y-2 mb-4 flex-1">
                  <div className="text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span className="ml-2 font-medium text-gray-900">{doc.version}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium text-gray-900">{doc.category}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Effective Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(doc.effectiveDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Approved By:</span>
                    <span className="ml-2 font-medium text-gray-900">{doc.approvedBy}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Access Level:</span>
                    <span className="ml-2 font-medium text-gray-900">{doc.accessLevel}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Downloads:</span>
                    <span className="ml-2 font-medium text-gray-900">{doc.downloadCount}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {doc.documentUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLock(doc.id, !doc.locked)}
                    >
                      {doc.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedDocument(null)
        }}
        title={selectedDocument ? 'Edit Document' : 'Add New Document'}
        size="lg"
      >
        <CreateDocumentForm
          document={selectedDocument}
          onSuccess={() => {
            setShowCreateModal(false)
            setSelectedDocument(null)
            loadDocuments()
          }}
          onCancel={() => {
            setShowCreateModal(false)
            setSelectedDocument(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default QADocumentControl

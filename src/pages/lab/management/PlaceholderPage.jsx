import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6"
        >
          <FileText className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || 'Page'}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {description || 'This page is under development and will be available soon.'}
        </p>
      </div>
    </div>
  )
}

export default PlaceholderPage

/**
 * WelcomeScreen Component
 * 
 * Shows welcome message and quick reply suggestions
 */

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

/**
 * WelcomeScreen Component
 * @param {Object} props
 * @param {Function} props.onSend - Function to send message
 * @param {Array} [props.suggestions] - Array of suggestion strings
 */
export default function WelcomeScreen({ onSend, suggestions = [] }) {
  const handleSuggestionClick = (suggestion) => {
    onSend(suggestion)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-6 overflow-y-auto overflow-x-hidden min-h-0 chatbot-scrollbar">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8 mt-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome to Lab Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          How can I help you today?
        </p>
      </motion.div>

      {suggestions.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm space-y-2"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Quick suggestions:</p>
          </div>
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all group"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-primary dark:group-hover:text-primary-light">
                {suggestion}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}


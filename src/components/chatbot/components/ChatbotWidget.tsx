/**
 * ChatbotWidget Component
 * 
 * Main chatbot widget - floating button that opens chat window
 * This is the main component that should be imported and used in the app
 */

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatWindow from './ChatWindow'

/**
 * ChatbotWidget Component
 * @param {Object} props
 * @param {string} props.apiUrl - Chatbot API URL
 * @param {Object} [props.config] - Configuration options
 * @param {Object} [props.context] - User context
 * @param {Function} [props.onAction] - Action handler
 * @param {Function} [props.onError] - Error handler
 */
export default function ChatbotWidget({
  apiUrl,
  config = {},
  context,
  onAction,
  onError,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPulse, setShowPulse] = useState(true)

  // Don't render if disabled
  if (config.enabled === false) {
    return null
  }

  const position = config.position || 'bottom-right'
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-4 left-4 md:bottom-6 md:left-6',
    'top-right': 'top-4 right-4 md:top-6 md:right-6',
    'top-left': 'top-4 left-4 md:top-6 md:left-6',
  }

  // Hide pulse when chat is open
  useEffect(() => {
    if (isOpen) {
      setShowPulse(false)
    } else {
      // Show pulse after a delay when closed
      const timer = setTimeout(() => setShowPulse(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Button with Pulse Animation */}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        {/* Pulse Ring */}
        <AnimatePresence>
          {showPulse && !isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary opacity-75"
              initial={{ scale: 1, opacity: 0.75 }}
              animate={{ 
                scale: [1, 1.4, 1.4],
                opacity: [0.75, 0, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary via-primary-dark to-primary text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all flex items-center justify-center backdrop-blur-sm"
          style={{
            background: config.primaryColor 
              ? `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}dd)`
              : undefined,
          }}
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, -5, 0],
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <X className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            apiUrl={apiUrl}
            config={config}
            context={context}
            onAction={onAction}
            onError={onError}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}


/**
 * ChatWindow Component
 * 
 * Main chat interface window
 */

import { useState, useEffect } from 'react'
import { X, RotateCcw, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import WelcomeScreen from './WelcomeScreen'
import { useChatbot } from '../hooks/useChatbot'

/**
 * ChatWindow Component
 * @param {Object} props
 * @param {string} props.apiUrl - Chatbot API URL
 * @param {Object} [props.config] - Configuration options
 * @param {Object} [props.context] - User context
 * @param {Function} [props.onAction] - Action handler
 * @param {Function} [props.onError] - Error handler
 * @param {Function} props.onClose - Close handler
 */
export default function ChatWindow({
  apiUrl,
  config,
  context,
  onAction,
  onError,
  onClose,
}) {
  const { messages, loading, sendMessage, clearChat } = useChatbot({
    apiUrl,
    apiKey: config?.apiKey,
    context: context || { userId: '', userRole: '' },
    onAction,
    onError,
  })

  const [isMinimized, setIsMinimized] = useState(false)
  const branding = config?.branding || {}
  const chatbotName = branding.name || 'Lab Assistant'
  const showWelcome = messages.length <= 1 && !loading

  // Responsive sizing
  const windowClasses = `
    fixed z-50 flex flex-col
    bg-white dark:bg-gray-800
    rounded-2xl shadow-2xl
    border border-gray-200 dark:border-gray-700
    backdrop-blur-xl bg-white/95 dark:bg-gray-800/95
    ${isMinimized 
      ? 'bottom-20 right-4 md:bottom-24 md:right-6 w-80 h-16' 
      : 'bottom-20 right-4 md:bottom-24 md:right-6 w-full max-w-md md:w-96 h-[85vh] max-h-[600px] md:h-[600px]'
    }
    transition-all duration-300 ease-out
    overflow-hidden
  `

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? '64px' : 'auto'
      }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={windowClasses}
      style={{
        ...(config?.primaryColor && {
          '--primary-color': config.primaryColor,
        }),
      }}
    >
      {/* Header */}
      <motion.div 
        className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary via-primary-dark to-primary flex items-center justify-between cursor-move flex-shrink-0"
        whileHover={{ opacity: 0.95 }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Animated Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {branding.logo ? (
              <img 
                src={branding.logo} 
                alt="Logo" 
                className="w-10 h-10 rounded-full ring-2 ring-white/50" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LA</span>
              </div>
            )}
            {/* Online Indicator */}
            <motion.div
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{chatbotName}</h3>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-green-300 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-xs text-white/90">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={clearChat}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <AnimatePresence mode="wait">
        {!isMinimized && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            {showWelcome ? (
              <WelcomeScreen 
                onSend={sendMessage}
                suggestions={[
                  "Show me all active projects",
                  "List test plans for this month",
                  "What certifications are expiring soon?",
                  "Help me create a new test plan"
                ]}
              />
            ) : (
              <MessageList messages={messages} loading={loading} />
            )}

            {/* Input */}
            <MessageInput
              onSend={sendMessage}
              disabled={loading}
              placeholder={config?.branding?.welcomeMessage || 'Type your message...'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


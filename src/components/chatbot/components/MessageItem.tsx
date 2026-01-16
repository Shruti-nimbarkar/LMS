/**
 * MessageItem Component
 * 
 * Renders individual chat messages
 */

import { motion } from 'framer-motion'
import { User, Bot, Check, CheckCheck } from 'lucide-react'

/**
 * MessageItem Component
 * @param {Object} props
 * @param {Object} props.message - Chat message object
 */
export default function MessageItem({ message }) {
  const isUser = message.role === 'user'
  const isError = !!message.error
  const timestamp = new Date(message.timestamp)

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <motion.div
        className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
            : isError
            ? 'bg-red-100 text-red-600'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200'
        }`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1 max-w-[82%] md:max-w-[72%] min-w-0`}>
        <motion.div
          className={`relative inline-block px-4 py-2.5 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-sm'
              : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
          
          {/* Message status for user messages */}
          {isUser && (
            <motion.div
              className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCheck className="w-3 h-3 text-primary" />
            </motion.div>
          )}
        </motion.div>

        {/* Timestamp */}
        <div className={`flex items-center gap-1 ${isUser ? 'flex-row-reverse' : 'flex-row'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}


/**
 * TypingIndicator Component
 * 
 * Shows animated typing indicator while chatbot is processing
 */

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-md">
        <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </div>
      
      {/* Typing Animation */}
      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.6, 1],
            }}
          />
        ))}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">
          Typing...
        </span>
      </div>
    </div>
  )
}


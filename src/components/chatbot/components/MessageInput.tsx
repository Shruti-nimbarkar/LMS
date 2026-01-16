/**
 * MessageInput Component
 * 
 * Input field for sending messages to chatbot
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * MessageInput Component
 * @param {Object} props
 * @param {Function} props.onSend - Function to send message
 * @param {boolean} [props.disabled] - Whether input is disabled
 * @param {string} [props.placeholder] - Placeholder text
 */
export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}) {
  const [message, setMessage] = useState('')
  const [showEmojiMenu, setShowEmojiMenu] = useState(false)
  const textareaRef = useRef(null)
  const emojiMenuRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Close emoji menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(event.target)) {
        setShowEmojiMenu(false)
      }
    }

    if (showEmojiMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiMenu])

  // Common emojis/icons
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫',
    '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟',
    '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
    '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
    '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
    '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
  ]

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiMenu(false)
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessage = message.trim().length > 0

  return (
    <motion.div 
      className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm flex-shrink-0"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base transition-all message-input-scrollbar"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>

        {/* Emoji button with menu */}
        <div className="relative" ref={emojiMenuRef}>
          <motion.button
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className={`p-2.5 rounded-lg transition-colors flex-shrink-0 ${
              showEmojiMenu
                ? 'text-primary bg-primary/10 dark:bg-primary/20'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Add emoji"
          >
            <Smile className="w-6 h-6" />
          </motion.button>

          {/* Emoji Menu */}
          <AnimatePresence>
            {showEmojiMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute bottom-full right-0 mb-2 w-72 h-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 overflow-hidden flex flex-col z-50"
              >
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
                  Emojis
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden emoji-menu-scrollbar">
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        title={emoji}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={disabled || !hasMessage}
          className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md ${
            hasMessage
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
          whileHover={hasMessage ? { scale: 1.05, rotate: 5 } : {}}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}


/**
 * useChatbot Hook
 * 
 * Main hook for managing chatbot state and interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatService } from '../services/chatService'

/**
 * @param {Object} options - Hook options
 * @param {string} options.apiUrl - Chatbot API URL
 * @param {string} [options.apiKey] - Optional API key
 * @param {Object} options.context - User context
 * @param {Function} [options.onAction] - Action handler
 * @param {Function} [options.onError] - Error handler
 * @returns {Object} Chatbot state and functions
 */
export function useChatbot({
  apiUrl,
  apiKey,
  context,
  onAction,
  onError,
}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)
  const chatServiceRef = useRef(null)

  // Initialize chat service
  useEffect(() => {
    chatServiceRef.current = new ChatService(apiUrl, apiKey)
  }, [apiUrl, apiKey])

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      if (!chatServiceRef.current || sessionId) return

      try {
        const newSessionId = await chatServiceRef.current.createSession(context.userId)
        setSessionId(newSessionId)

        // Load chat history
        const history = await chatServiceRef.current.getHistory(newSessionId)
        if (history.length > 0) {
          setMessages(history)
        } else {
          // Add welcome message if no history
          setMessages([
            {
              id: 'welcome',
              content: 'Hello! How can I help you with the Lab Management System?',
              role: 'assistant',
              timestamp: new Date(),
            },
          ])
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize session')
        setError(error)
        onError?.(error)
      }
    }

    initializeSession()
  }, [context.userId, sessionId, onError])

  // Send message
  const sendMessage = useCallback(
    async (content) => {
      if (!chatServiceRef.current || !sessionId || loading || !content.trim()) {
        return
      }

      const userMessage = {
        id: `msg_${Date.now()}_user`,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      }

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage])
      setLoading(true)
      setError(null)

      try {
        const response = await chatServiceRef.current.sendMessage(
          content,
          sessionId,
          context
        )

        const assistantMessage = {
          id: `msg_${Date.now()}_assistant`,
          content: response.message,
          role: 'assistant',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Handle actions if any
        if (response.actions && response.actions.length > 0) {
          response.actions.forEach((action) => {
            onAction?.(action)
          })
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send message')
        setError(error)
        onError?.(error)

        // Add error message
        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
          error: error.message,
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setLoading(false)
      }
    },
    [sessionId, context, loading, onAction, onError]
  )

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        content: 'Hello! How can I help you with the Lab Management System?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ])
  }, [])

  return {
    messages,
    loading,
    error,
    sessionId,
    sendMessage,
    clearChat,
  }
}


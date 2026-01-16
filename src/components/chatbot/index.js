/**
 * Chatbot Module - Main Export
 * 
 * This is the main entry point for the chatbot module
 * Import from here to use the chatbot in your application
 */

// Import styles
import './styles.css'

export { default as ChatbotWidget } from './components/ChatbotWidget'
export { useChatbot } from './hooks/useChatbot'
export { ChatService } from './services/chatService'


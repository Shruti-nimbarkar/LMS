/**
 * Chatbot Module - Type Definitions
 * 
 * JSDoc type definitions for the chatbot module
 */

/**
 * @typedef {Object} ChatbotConfig
 * @property {string} apiUrl - API URL for chatbot service
 * @property {string} [apiKey] - Optional API key
 * @property {'light'|'dark'} [theme] - UI theme
 * @property {'bottom-right'|'bottom-left'|'top-right'|'top-left'} [position] - Widget position
 * @property {string} [primaryColor] - Primary color for branding
 * @property {boolean} [enabled] - Whether chatbot is enabled
 * @property {boolean} [showSuggestions] - Show query suggestions
 * @property {boolean} [enableHistory] - Enable chat history
 * @property {boolean} [enableTypingIndicator] - Show typing indicator
 * @property {Object} [branding] - Branding customization
 * @property {string} [branding.name] - Chatbot name
 * @property {string} [branding.logo] - Logo URL
 * @property {string} [branding.welcomeMessage] - Welcome message
 */

/**
 * @typedef {Object} ChatbotContext
 * @property {string} userId - User ID
 * @property {string} userRole - User role
 * @property {string} [currentPage] - Current page path
 * @property {string[]} [permissions] - User permissions
 */

/**
 * @typedef {Object} ChatbotAction
 * @property {'navigate'|'openModal'|'refresh'|'custom'} type - Action type
 * @property {string} [path] - Path for navigate action
 * @property {string} [modal] - Modal name for openModal action
 * @property {string} [component] - Component name for refresh action
 * @property {string} [action] - Custom action name
 * @property {*} [payload] - Action payload
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Message ID
 * @property {string} content - Message content
 * @property {'user'|'assistant'|'system'} role - Message role
 * @property {Date} timestamp - Message timestamp
 * @property {boolean} [isLoading] - Is message loading
 * @property {string} [error] - Error message if any
 */

/**
 * @typedef {Object} ChatResponse
 * @property {string} message - Response message
 * @property {string} sessionId - Session ID
 * @property {string[]} [suggestions] - Suggested queries
 * @property {ChatbotAction[]} [actions] - Actions to execute
 * @property {Object} [metadata] - Response metadata
 */

export {}


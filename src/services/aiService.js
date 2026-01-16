/**
 * AI Service - Centralized AI functionality
 * 
 * This service provides AI-powered features including:
 * - Document extraction and OCR
 * - Form validation
 * - Chatbot responses
 * - Predictive analytics
 */

// Note: Install required packages:
// npm install openai

import { toast } from 'react-hot-toast'

// Initialize AI client (replace with your API key)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const AI_ENABLED = !!OPENAI_API_KEY

/**
 * Extract structured data from uploaded documents using AI
 * Works with PDFs, images, scanned documents
 */
export const extractDocumentData = async (file, documentType = 'general') => {
  if (!AI_ENABLED) {
    console.warn('AI not configured. Skipping document extraction.')
    return null
  }

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file)
    
    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: getExtractionPrompt(documentType)
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${file.type};base64,${base64}`
              }
            }
          ]
        }],
        max_tokens: 1000
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const extractedText = data.choices[0].message.content
    
    // Parse extracted JSON
    try {
      return JSON.parse(extractedText)
    } catch {
      // If not valid JSON, return as text
      return { extractedText }
    }
  } catch (error) {
    console.error('Document extraction error:', error)
    toast.error('AI extraction failed. Please fill manually.')
    return null
  }
}

/**
 * Validate form data using AI
 * Checks for completeness, consistency, and compliance
 */
export const validateFormWithAI = async (formData, step) => {
  if (!AI_ENABLED) {
    return { valid: true, score: 100, issues: [], recommendations: [] }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are an expert in laboratory compliance and registration. Validate the provided data.'
        }, {
          role: 'user',
          content: `Validate this laboratory registration data for step ${step}:

${JSON.stringify(formData, null, 2)}

Return JSON with:
{
  "score": 0-100,
  "valid": boolean,
  "issues": ["list of issues"],
  "recommendations": ["list of recommendations"],
  "criticalErrors": ["list of critical errors"]
}`
        }],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Validation error:', error)
    return { valid: true, score: 100, issues: [], recommendations: [] }
  }
}

/**
 * Get AI chatbot response
 * Context-aware assistance for form filling
 */
export const getChatbotResponse = async (userMessage, context = {}) => {
  if (!AI_ENABLED) {
    return 'AI chatbot is not configured. Please contact support for help.'
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are a helpful assistant for laboratory registration.
          
Current context:
- Current step: ${context.currentStep || 'Unknown'}
- Form data: ${JSON.stringify(context.formData || {})}

Help users:
- Fill forms correctly
- Understand compliance requirements
- Answer questions about the process
- Provide examples when needed

Be concise, helpful, and professional.`
        }, {
          role: 'user',
          content: userMessage
        }]
      })
    })

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Chatbot error:', error)
    return 'I apologize, but I encountered an error. Please try again or contact support.'
  }
}

/**
 * Auto-fill form from natural language description
 * Example: "Our lab is ABC Labs in Mumbai, Maharashtra..."
 */
export const autoFillFromText = async (text, formSchema) => {
  if (!AI_ENABLED) return {}

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `Extract structured data from the user's description.
          
Form schema: ${JSON.stringify(formSchema)}

Return JSON matching the schema with extracted values.`
        }, {
          role: 'user',
          content: text
        }],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Auto-fill error:', error)
    return {}
  }
}

/**
 * Predict equipment maintenance needs
 */
export const predictMaintenance = async (equipment) => {
  if (!AI_ENABLED) return null

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are an expert in laboratory equipment maintenance prediction.'
        }, {
          role: 'user',
          content: `Predict maintenance needs for this equipment:

${JSON.stringify(equipment)}

Return JSON:
{
  "nextMaintenanceDate": "YYYY-MM-DD",
  "priority": "low|medium|high",
  "daysUntil": number,
  "estimatedCost": number,
  "recommendations": ["list"],
  "riskLevel": "low|medium|high"
}`
        }],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Maintenance prediction error:', error)
    return null
  }
}

/**
 * Generate comprehensive reports using AI
 */
export const generateReport = async (reportType, data) => {
  if (!AI_ENABLED) {
    toast.error('AI report generation not available')
    return null
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Generate a professional ${reportType} report based on this data:

${JSON.stringify(data, null, 2)}

Include:
1. Executive Summary
2. Key Metrics and Statistics
3. Compliance Status
4. Detailed Analysis
5. Recommendations
6. Conclusion

Format in markdown with proper headings and sections.`
        }]
      })
    })

    const result = await response.json()
    return result.choices[0].message.content
  } catch (error) {
    console.error('Report generation error:', error)
    toast.error('Failed to generate report')
    return null
  }
}

// Helper Functions

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * Get extraction prompt based on document type
 */
const getExtractionPrompt = (documentType) => {
  const prompts = {
    'compliance': `Extract all relevant information from this compliance document:
- Document type
- Organization name
- Registration/License number
- Issue date and expiry date
- Issuing authority
- Any other relevant details

Return as JSON.`,

    'certificate': `Extract all information from this certificate:
- Certificate type
- Holder name
- Institution/Organization
- Date issued
- Expiry date (if any)
- Certificate number
- Field/Specialization

Return as JSON.`,

    'bank': `Extract bank details from this document:
- Bank name
- Account number
- IFSC code
- Branch name
- Account holder name

Return as JSON.`,

    'address': `Extract address information:
- Street address
- City
- State
- PIN code
- Country
- Landmark (if any)

Return as JSON.`,

    'general': `Extract all relevant structured information from this document as JSON.
Include any names, dates, numbers, addresses, or other important data points.`
  }

  return prompts[documentType] || prompts['general']
}

// Export AI status
export const isAIEnabled = () => AI_ENABLED

// Test AI connection
export const testAIConnection = async () => {
  if (!AI_ENABLED) {
    return { success: false, message: 'API key not configured' }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    })

    if (response.ok) {
      return { success: true, message: 'AI service connected successfully' }
    } else {
      return { success: false, message: 'AI service authentication failed' }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export default {
  extractDocumentData,
  validateFormWithAI,
  getChatbotResponse,
  autoFillFromText,
  predictMaintenance,
  generateReport,
  isAIEnabled,
  testAIConnection
}
















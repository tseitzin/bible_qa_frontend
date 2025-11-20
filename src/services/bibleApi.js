import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie() {
  const name = 'bible_qa_csrf='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length)
    }
  }
  return null
}

// Add CSRF token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing requests
    const csrfToken = getCsrfTokenFromCookie()
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred'
    
    return Promise.reject(new Error(errorMessage))
  }
)

export const bibleApi = {
  async askQuestion(question, userId = 1) {
    if (!question?.trim()) {
      throw new Error('Question cannot be empty')
    }

    try {
      const response = await apiClient.post('/api/ask', {
        question: question.trim(),
        user_id: userId,
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  async askFollowUpQuestion({ question, conversation_history = [], parent_question_id = null, userId = 1 }) {
    if (!question?.trim()) {
      throw new Error('Question cannot be empty')
    }

    try {
      const response = await apiClient.post('/api/ask/followup', {
        question: question.trim(),
        conversation_history,
        parent_question_id,
        user_id: userId,
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getVerse(reference) {
    if (!reference?.trim()) {
      throw new Error('Reference cannot be empty')
    }

    try {
      const response = await apiClient.get('/api/bible/verse', {
        params: { ref: reference.trim() },
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default apiClient

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
  },

  async getPassage(reference) {
    if (!reference?.trim()) {
      throw new Error('Reference cannot be empty')
    }

    try {
      const response = await apiClient.get('/api/bible/passage', {
        params: { reference: reference.trim() }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getChapter(book, chapter) {
    if (!book?.trim() || !chapter) {
      throw new Error('Book and chapter are required')
    }

    return this.getPassage(`${book.trim()} ${chapter}`)
  },

  /**
   * Stream a question answer with real-time updates
   * @param {string} question - The question to ask
   * @param {Function} onChunk - Callback for each chunk: (event) => void
   *   event types:
   *     - { type: 'cached', answer, question_id, is_biblical }
   *     - { type: 'status', message }
   *     - { type: 'content', text }
   *     - { type: 'done', question_id, is_biblical }
   *     - { type: 'error', message }
   * @param {number} userId - User ID (default: 1)
   */
  async streamQuestion(question, onChunk, userId = 1) {
    if (!question?.trim()) {
      throw new Error('Question cannot be empty')
    }

    const csrfToken = getCsrfTokenFromCookie()
    const headers = {
      'Content-Type': 'application/json',
    }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          question: question.trim(),
          user_id: userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              onChunk(data)
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Streaming request failed')
    }
  },

  /**
   * Stream a follow-up question answer with real-time updates
   * @param {Object} data - Follow-up question data
   * @param {string} data.question - The follow-up question
   * @param {Array} data.conversation_history - Conversation context
   * @param {number} data.parent_question_id - Root question ID
   * @param {Function} onChunk - Callback for each chunk (same format as streamQuestion)
   * @param {number} userId - User ID (default: 1)
   */
  async streamFollowUpQuestion(data, onChunk, userId = 1) {
    const { question, conversation_history, parent_question_id } = data
    
    if (!question?.trim()) {
      throw new Error('Question cannot be empty')
    }

    const csrfToken = getCsrfTokenFromCookie()
    const headers = {
      'Content-Type': 'application/json',
    }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask/followup/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          question: question.trim(),
          conversation_history: conversation_history || [],
          parent_question_id,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              onChunk(data)
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Follow-up streaming request failed')
    }
  },

  /**
   * Admin: Get API request logs
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of logs
   * @param {number} params.offset - Number of logs to skip
   * @param {number} params.user_id - Filter by user ID
   * @param {string} params.endpoint - Filter by endpoint
   * @param {number} params.status_code - Filter by status code
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getApiLogs(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get API usage statistics
   * @param {Object} params - Query parameters
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getApiStats(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/stats', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get per-endpoint statistics
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of endpoints
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getEndpointStats(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/endpoints', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get OpenAI API usage statistics
   * @param {Object} params - Query parameters
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getOpenAIStats(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/openai/stats', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get OpenAI API call logs
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of logs
   * @param {number} params.offset - Offset for pagination
   * @param {number} params.user_id - Filter by user ID
   * @param {string} params.status - Filter by status
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getOpenAICalls(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/openai', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get per-user OpenAI usage statistics
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of users
   * @param {string} params.start_date - Start date (ISO format)
   * @param {string} params.end_date - End date (ISO format)
   */
  async getOpenAIUserUsage(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/logs/openai/users', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get user statistics
   */
  async getUserStats() {
    try {
      const response = await apiClient.get('/api/admin/users/stats')
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: List users
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search by email or username
   * @param {boolean} params.active_only - Show only active users
   * @param {number} params.limit - Maximum number of users
   * @param {number} params.offset - Offset for pagination
   */
  async listUsers(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/users/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Get user detail
   * @param {number} userId - User ID
   */
  async getUserDetail(userId) {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Reset user account
   * @param {number} userId - User ID
   */
  async resetUserAccount(userId) {
    try {
      const response = await apiClient.post(`/api/admin/users/${userId}/reset-account`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Clear user's saved answers
   * @param {number} userId - User ID
   */
  async clearUserSavedAnswers(userId) {
    try {
      const response = await apiClient.post(`/api/admin/users/${userId}/clear-saved-answers`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Toggle user active status
   * @param {number} userId - User ID
   */
  async toggleUserActive(userId) {
    try {
      const response = await apiClient.post(`/api/admin/users/${userId}/toggle-active`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Delete user permanently
   * @param {number} userId - User ID
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Admin: Cleanup invalid guest users
   */
  async cleanupGuestUsers() {
    try {
      const response = await apiClient.post('/api/admin/users/cleanup-guest-users')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default apiClient

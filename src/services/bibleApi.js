import axios from 'axios'
import authService from './authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
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
  }
}

export default apiClient

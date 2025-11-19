/**
 * Axios configuration for cookie-based authentication
 */
import axios from 'axios'
import authService from './authService'

axios.defaults.withCredentials = true

// Handle authentication errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadUser = authService.isAuthenticated()
      authService.clearStoredUser()

      if (hadUser && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axios

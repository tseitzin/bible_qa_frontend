/**
 * Axios configuration with JWT token interceptor
 */
import axios from 'axios'
import authService from './authService'

// Add request interceptor to inject JWT tokens
axios.interceptors.request.use(
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

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      authService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios

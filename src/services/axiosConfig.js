/**
 * Axios configuration for cookie-based authentication
 */
import axios from 'axios'
import authService from './authService'

axios.defaults.withCredentials = true

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
axios.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing requests
    const csrfToken = getCsrfTokenFromCookie()
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken
      console.log(`[CSRF] Adding token to ${config.method.toUpperCase()} ${config.url}: ${csrfToken.substring(0, 8)}...`)
    } else {
      console.log(`[CSRF] No token for ${config.method?.toUpperCase()} ${config.url}: token=${csrfToken?.substring(0, 8) || 'null'}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

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

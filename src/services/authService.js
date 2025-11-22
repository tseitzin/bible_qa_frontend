/**
 * Authentication service for user registration, login, and token management
 */
import axios from './axiosConfig'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const USER_KEY = 'bible_qa_user'

const authService = {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data
   */
  async register(email, username, password) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        username,
        password
      })
      return { success: true, user: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed'
      }
    }
  },

  /**
   * Log in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Token and user data
   */
  async login(email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      )

      const user = response.data || null
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }

      return { success: true, user }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed'
      }
    }
  },

  /**
   * Log out the current user
   */
  async logout() {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, null, { withCredentials: true })
    } catch (error) {
      console.error('Failed to log out:', error)
    } finally {
      localStorage.removeItem(USER_KEY)
    }
  },

  /**
   * Get the current user from the API
   * @returns {Promise<Object|null>} User data or null
   */
  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      // Token is invalid or expired
      this.clearStoredUser()
      return null
    }
  },

  /**
   * Get the stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a token
   */
  isAuthenticated() {
    return !!this.getStoredUser()
  },

  /**
   * Refresh user data from the API
   * @returns {Promise<Object|null>} Updated user data or null
   */
  async refreshUser() {
    const user = await this.getCurrentUser()
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    return user
  },

  clearStoredUser() {
    localStorage.removeItem(USER_KEY)
  }
}

export default authService

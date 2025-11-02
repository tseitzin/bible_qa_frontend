/**
 * Authentication composable for managing auth state across components
 */
import { ref, computed } from 'vue'
import authService from '../services/authService'
import { useRouter } from 'vue-router'

// Shared state across all components
const currentUser = ref(authService.getStoredUser())
const isAuthenticated = computed(() => !!currentUser.value)

export function useAuth() {
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Register a new user
   */
  const register = async (email, username, password) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.register(email, username, password)
      
      if (result.success) {
        // Auto-login after registration
        const loginResult = await authService.login(email, password)
        if (loginResult.success) {
          currentUser.value = loginResult.user
          return { success: true }
        }
      }
      
      error.value = result.message
      return result
    } catch (err) {
      error.value = 'Registration failed. Please try again.'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Log in a user
   */
  const login = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.login(email, password)
      
      if (result.success) {
        currentUser.value = result.user
        return { success: true }
      }
      
      error.value = result.message
      return result
    } catch (err) {
      error.value = 'Login failed. Please try again.'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Log out the current user
   */
  const logout = () => {
    authService.logout()
    currentUser.value = null
    router.push('/login')
  }

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    try {
      const user = await authService.refreshUser()
      currentUser.value = user
      return user
    } catch (err) {
      console.error('Failed to refresh user:', err)
      return null
    }
  }

  /**
   * Check if user is authenticated and refresh if needed
   */
  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      currentUser.value = null
      return false
    }

    if (!currentUser.value) {
      await refreshUser()
    }

    return !!currentUser.value
  }

  return {
    // State
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    register,
    login,
    logout,
    refreshUser,
    checkAuth
  }
}

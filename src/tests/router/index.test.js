import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import authService from '../../services/authService'

// Mock authService
vi.mock('../../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn()
  }
}))

// Mock components
const mockComponent = { template: '<div>Mock Component</div>' }

describe('Router Navigation Guards', () => {
  let router

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create router with the same configuration as the main router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/login',
          name: 'login',
          component: mockComponent,
          meta: {
            title: 'Login - Bible Q&A',
            requiresGuest: true
          }
        },
        {
          path: '/register',
          name: 'register',
          component: mockComponent,
          meta: {
            title: 'Register - Bible Q&A',
            requiresGuest: true
          }
        },
        {
          path: '/home',
          name: 'home',
          component: mockComponent,
          meta: {
            title: 'Home - Bible Q&A',
            requiresAuth: true
          }
        },
        {
          path: '/',
          name: 'main',
          component: mockComponent,
          meta: {
            title: 'Bible Q&A',
            requiresAuth: false
          }
        },
        {
          path: '/kids',
          name: 'kids',
          component: mockComponent,
          meta: {
            title: 'Kids Bible Q&A',
            requiresAuth: false
          }
        }
      ]
    })

    // Add the navigation guard
    router.beforeEach(async (to, from, next) => {
      document.title = to.meta.title || 'Bible Q&A'
      
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
      
      if (requiresAuth) {
        const user = await authService.getCurrentUser()
        if (!user) {
          next('/login')
          return
        }
      } else if (requiresGuest) {
        const user = await authService.getCurrentUser()
        if (user) {
          next('/home')
          return
        }
      }
      
      next()
    })

    router.push('/')
    return router.isReady()
  })

  describe('Protected Routes', () => {
    it('should navigate unauthenticated users to login for protected routes', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/home')

      expect(router.currentRoute.value.path).toBe('/login')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should allow authenticated users to access protected routes', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      
      authService.getCurrentUser.mockResolvedValue(mockUser)

      await router.push('/home')

      expect(router.currentRoute.value.path).toBe('/home')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should redirect to login when token is invalid', async () => {
      // First navigation - simulate valid token
      authService.getCurrentUser.mockResolvedValue({ id: 1, email: 'test@example.com' })
      await router.push('/home')
      expect(router.currentRoute.value.path).toBe('/home')

      // Navigate away first
      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/')

      // Second navigation - simulate expired token
      authService.getCurrentUser.mockResolvedValue(null)
      await router.push('/home')
      
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Guest Routes', () => {
    it('should redirect authenticated users from login to home', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      
      authService.getCurrentUser.mockResolvedValue(mockUser)

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/home')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should redirect authenticated users from register to home', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      
      authService.getCurrentUser.mockResolvedValue(mockUser)

      await router.push('/register')

      expect(router.currentRoute.value.path).toBe('/home')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should allow unauthenticated users to access login', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/login')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should allow unauthenticated users to access register', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/register')

      expect(router.currentRoute.value.path).toBe('/register')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })
  })

  describe('Public Routes', () => {
    it('should allow any user to access public routes', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/')

      expect(router.currentRoute.value.path).toBe('/')
    })

    it('should allow authenticated users to access public routes', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      
      authService.getCurrentUser.mockResolvedValue(mockUser)

      await router.push('/kids')

      expect(router.currentRoute.value.path).toBe('/kids')
    })

    it('should not call getCurrentUser for public routes', async () => {
      await router.push('/')

      expect(authService.getCurrentUser).not.toHaveBeenCalled()
    })
  })

  describe('Document Title', () => {
    it('should set document title from route meta', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/login')

      expect(document.title).toBe('Login - Bible Q&A')
    })

    it('should use default title when not specified in meta', async () => {
      // Create a route without title
      router.addRoute({
        path: '/no-title',
        name: 'noTitle',
        component: mockComponent,
        meta: {}
      })

      await router.push('/no-title')

      expect(document.title).toBe('Bible Q&A')
    })
  })
})

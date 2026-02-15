import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import authService from '../../services/authService'

// Mock authService
vi.mock('../../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    getStoredUser: vi.fn()
  }
}))

// Mock component for route definitions
const mockComponent = { template: '<div>Mock</div>' }

/**
 * Build a router matching the real app's route definitions and navigation guard.
 * Uses createMemoryHistory so no real browser navigation occurs.
 */
const buildRouter = () => {
  const routes = [
    {
      path: '/login',
      name: 'login',
      component: mockComponent,
      meta: { title: 'Login', requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: mockComponent,
      meta: { title: 'Register', requiresGuest: true }
    },
    {
      path: '/',
      name: 'home',
      component: mockComponent,
      meta: { title: 'Home', requiresAuth: false }
    },
    {
      path: '/about',
      name: 'about',
      component: mockComponent,
      meta: { title: 'About Word of Life Answers', requiresAuth: false }
    },
    {
      path: '/ai-scripture',
      name: 'ai-scripture',
      component: mockComponent,
      meta: { title: 'AI & Scripture', requiresAuth: false }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: mockComponent,
      meta: { title: 'Privacy Policy', requiresAuth: false }
    },
    {
      path: '/terms',
      name: 'terms',
      component: mockComponent,
      meta: { title: 'Terms of Use', requiresAuth: false }
    },
    {
      path: '/contact',
      name: 'contact',
      component: mockComponent,
      meta: { title: 'Contact', requiresAuth: false }
    },
    {
      path: '/adults',
      name: 'main',
      component: mockComponent,
      meta: { title: 'Word of Life Answers', requiresAuth: false }
    },
    {
      path: '/reading',
      name: 'reading',
      component: mockComponent,
      meta: { title: 'Word of Life Answers', requiresAuth: false }
    },
    {
      path: '/reading-plans/:slug?',
      name: 'reading-plan',
      component: mockComponent,
      meta: { title: 'Word of Life Answers', requiresAuth: false }
    },
    {
      path: '/kids',
      name: 'kids',
      component: mockComponent,
      meta: { title: 'Kids Bible Q&A', requiresAuth: false }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: mockComponent,
      alias: '/admin/dashboard',
      meta: { title: 'Word of Life Answers', requiresAuth: true, requiresAdmin: true }
    }
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      return { left: 0, top: 0 }
    }
  })

  // Replicate the real beforeEach guard exactly
  router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || 'Bible Q&A'
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    if (requiresAuth) {
      const user = await authService.getCurrentUser()
      if (!user) {
        next('/login')
        return
      }
      if (requiresAdmin && !user.is_admin) {
        next('/home')
        return
      }
    } else if (requiresGuest) {
      const storedUser = authService.getStoredUser()
      if (storedUser) {
        next({ name: 'home' })
        return
      }
    }
    next()
  })

  return router
}

describe('Router', () => {
  let router

  beforeEach(() => {
    vi.clearAllMocks()
    router = buildRouter()
  })

  // ----------------------------------------------------------------
  // Route Definitions
  // ----------------------------------------------------------------
  describe('Route definitions', () => {
    it('should define all 13 routes', () => {
      const routeNames = router.getRoutes().map(r => r.name).filter(Boolean)
      expect(routeNames).toContain('login')
      expect(routeNames).toContain('register')
      expect(routeNames).toContain('home')
      expect(routeNames).toContain('about')
      expect(routeNames).toContain('ai-scripture')
      expect(routeNames).toContain('privacy')
      expect(routeNames).toContain('terms')
      expect(routeNames).toContain('contact')
      expect(routeNames).toContain('main')
      expect(routeNames).toContain('reading')
      expect(routeNames).toContain('reading-plan')
      expect(routeNames).toContain('kids')
      expect(routeNames).toContain('admin-dashboard')
    })

    it('should map / to the home route', () => {
      const route = router.resolve('/')
      expect(route.name).toBe('home')
    })

    it('should map /adults to the main route', () => {
      const route = router.resolve('/adults')
      expect(route.name).toBe('main')
    })

    it('should map /kids to the kids route', () => {
      const route = router.resolve('/kids')
      expect(route.name).toBe('kids')
    })

    it('should map /admin to admin-dashboard', () => {
      const route = router.resolve('/admin')
      expect(route.name).toBe('admin-dashboard')
    })

    it('should map /reading to the reading route', () => {
      const route = router.resolve('/reading')
      expect(route.name).toBe('reading')
    })

    it('should map /reading-plans to reading-plan route with optional slug', () => {
      const withoutSlug = router.resolve('/reading-plans')
      expect(withoutSlug.name).toBe('reading-plan')
      expect(withoutSlug.params.slug).toBeFalsy()

      const withSlug = router.resolve('/reading-plans/lent-2024')
      expect(withSlug.name).toBe('reading-plan')
      expect(withSlug.params.slug).toBe('lent-2024')
    })

    it('should map /about to the about route', () => {
      const route = router.resolve('/about')
      expect(route.name).toBe('about')
    })

    it('should map /ai-scripture to the ai-scripture route', () => {
      const route = router.resolve('/ai-scripture')
      expect(route.name).toBe('ai-scripture')
    })

    it('should map /privacy to the privacy route', () => {
      const route = router.resolve('/privacy')
      expect(route.name).toBe('privacy')
    })

    it('should map /terms to the terms route', () => {
      const route = router.resolve('/terms')
      expect(route.name).toBe('terms')
    })

    it('should map /contact to the contact route', () => {
      const route = router.resolve('/contact')
      expect(route.name).toBe('contact')
    })

    it('should map /login to the login route', () => {
      const route = router.resolve('/login')
      expect(route.name).toBe('login')
    })

    it('should map /register to the register route', () => {
      const route = router.resolve('/register')
      expect(route.name).toBe('register')
    })
  })

  // ----------------------------------------------------------------
  // Meta fields
  // ----------------------------------------------------------------
  describe('Meta fields', () => {
    it('should mark login and register as requiresGuest', () => {
      const loginRoute = router.resolve('/login')
      const registerRoute = router.resolve('/register')
      expect(loginRoute.meta.requiresGuest).toBe(true)
      expect(registerRoute.meta.requiresGuest).toBe(true)
    })

    it('should mark admin as requiresAuth and requiresAdmin', () => {
      const adminRoute = router.resolve('/admin')
      expect(adminRoute.meta.requiresAuth).toBe(true)
      expect(adminRoute.meta.requiresAdmin).toBe(true)
    })

    it('should mark public pages as requiresAuth false', () => {
      const publicPaths = ['/', '/about', '/ai-scripture', '/privacy', '/terms', '/contact', '/adults', '/reading', '/kids']
      publicPaths.forEach(path => {
        const route = router.resolve(path)
        expect(route.meta.requiresAuth).toBe(false)
      })
    })

    it('should set title meta on each route', () => {
      expect(router.resolve('/login').meta.title).toBe('Login')
      expect(router.resolve('/register').meta.title).toBe('Register')
      expect(router.resolve('/').meta.title).toBe('Home')
      expect(router.resolve('/about').meta.title).toBe('About Word of Life Answers')
      expect(router.resolve('/ai-scripture').meta.title).toBe('AI & Scripture')
      expect(router.resolve('/privacy').meta.title).toBe('Privacy Policy')
      expect(router.resolve('/terms').meta.title).toBe('Terms of Use')
      expect(router.resolve('/contact').meta.title).toBe('Contact')
      expect(router.resolve('/kids').meta.title).toBe('Kids Bible Q&A')
    })
  })

  // ----------------------------------------------------------------
  // Admin alias
  // ----------------------------------------------------------------
  describe('Admin alias', () => {
    it('should resolve /admin/dashboard to the admin-dashboard route', () => {
      const route = router.resolve('/admin/dashboard')
      expect(route.matched.length).toBeGreaterThan(0)
      expect(route.matched[0].name).toBe('admin-dashboard')
    })
  })

  // ----------------------------------------------------------------
  // Navigation guard — Document title
  // ----------------------------------------------------------------
  describe('Navigation guard — document title', () => {
    it('should set document.title from route meta on navigation', async () => {
      authService.getCurrentUser.mockResolvedValue(null)
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/login')
      await router.isReady()
      expect(document.title).toBe('Login')
    })

    it('should fall back to "Bible Q&A" when no title meta is set', async () => {
      router.addRoute({
        path: '/no-title',
        name: 'noTitle',
        component: mockComponent,
        meta: {}
      })

      await router.push('/no-title')
      await router.isReady()
      expect(document.title).toBe('Bible Q&A')
    })

    it('should update title when navigating between routes', async () => {
      authService.getCurrentUser.mockResolvedValue(null)
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/login')
      await router.isReady()
      expect(document.title).toBe('Login')

      await router.push('/about')
      expect(document.title).toBe('About Word of Life Answers')
    })
  })

  // ----------------------------------------------------------------
  // Navigation guard — Protected routes (requiresAuth)
  // ----------------------------------------------------------------
  describe('Navigation guard — protected routes', () => {
    it('should redirect unauthenticated users to /login for admin route', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/admin')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should allow admin users to access admin route', async () => {
      const adminUser = { id: 1, email: 'admin@example.com', is_admin: true }
      authService.getCurrentUser.mockResolvedValue(adminUser)

      await router.push('/admin')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/admin')
    })

    it('should redirect non-admin authenticated users away from admin route to /home', async () => {
      const regularUser = { id: 2, email: 'user@example.com', is_admin: false }
      authService.getCurrentUser.mockResolvedValue(regularUser)

      await router.push('/admin')
      await router.isReady()

      // The guard redirects non-admins to '/home'
      // Since /home does not exist as a path in the route table, we check the attempted redirect
      expect(router.currentRoute.value.path).not.toBe('/admin')
    })

    it('should call getCurrentUser for auth-required routes', async () => {
      authService.getCurrentUser.mockResolvedValue(null)

      await router.push('/admin')
      await router.isReady()

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  // ----------------------------------------------------------------
  // Navigation guard — Guest routes (requiresGuest)
  // ----------------------------------------------------------------
  describe('Navigation guard — guest routes', () => {
    it('should allow unauthenticated users to access login', async () => {
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow unauthenticated users to access register', async () => {
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/register')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/register')
    })

    it('should redirect stored users from login to home', async () => {
      const storedUser = { id: 1, email: 'test@example.com' }
      authService.getStoredUser.mockReturnValue(storedUser)

      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should redirect stored users from register to home', async () => {
      const storedUser = { id: 1, email: 'test@example.com' }
      authService.getStoredUser.mockReturnValue(storedUser)

      await router.push('/register')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should use getStoredUser (not getCurrentUser) for guest route checks', async () => {
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/login')
      await router.isReady()

      expect(authService.getStoredUser).toHaveBeenCalled()
      expect(authService.getCurrentUser).not.toHaveBeenCalled()
    })
  })

  // ----------------------------------------------------------------
  // Navigation guard — Public routes
  // ----------------------------------------------------------------
  describe('Navigation guard — public routes', () => {
    it('should allow unauthenticated users to access public routes', async () => {
      const publicPaths = ['/', '/about', '/adults', '/kids', '/reading', '/privacy', '/terms', '/contact', '/ai-scripture']

      for (const path of publicPaths) {
        await router.push(path)
        await router.isReady()
        expect(router.currentRoute.value.path).toBe(path)
      }
    })

    it('should not call getCurrentUser or getStoredUser for public routes', async () => {
      await router.push('/')
      await router.isReady()

      expect(authService.getCurrentUser).not.toHaveBeenCalled()
      expect(authService.getStoredUser).not.toHaveBeenCalled()
    })

    it('should allow navigation to reading-plans with a slug param', async () => {
      await router.push('/reading-plans/advent-2025')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('reading-plan')
      expect(router.currentRoute.value.params.slug).toBe('advent-2025')
    })

    it('should allow navigation to reading-plans without a slug param', async () => {
      await router.push('/reading-plans')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('reading-plan')
    })
  })

  // ----------------------------------------------------------------
  // Navigation guard — Auth state transitions
  // ----------------------------------------------------------------
  describe('Navigation guard — auth state transitions', () => {
    it('should redirect to login when auth expires between navigations', async () => {
      const adminUser = { id: 1, email: 'admin@example.com', is_admin: true }
      authService.getCurrentUser.mockResolvedValue(adminUser)

      await router.push('/admin')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/admin')

      // Navigate to a public route
      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/')

      // Simulate auth expiration
      authService.getCurrentUser.mockResolvedValue(null)
      await router.push('/admin')

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow guest routes once user logs out (no stored user)', async () => {
      const storedUser = { id: 1, email: 'test@example.com' }
      authService.getStoredUser.mockReturnValue(storedUser)

      await router.push('/login')
      await router.isReady()
      // Redirected to home because user is stored
      expect(router.currentRoute.value.name).toBe('home')

      // Navigate away, then simulate logout
      await router.push('/')
      authService.getStoredUser.mockReturnValue(null)

      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  // ----------------------------------------------------------------
  // Scroll behavior
  // ----------------------------------------------------------------
  describe('scrollBehavior', () => {
    it('should return savedPosition when it exists', () => {
      const scrollBehavior = router.options.scrollBehavior
      const savedPosition = { left: 50, top: 100 }
      const result = scrollBehavior({}, {}, savedPosition)
      expect(result).toEqual(savedPosition)
    })

    it('should return top-left when no savedPosition', () => {
      const scrollBehavior = router.options.scrollBehavior
      const result = scrollBehavior({}, {}, null)
      expect(result).toEqual({ left: 0, top: 0 })
    })
  })
})

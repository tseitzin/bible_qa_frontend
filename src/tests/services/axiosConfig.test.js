import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock axios at the top level
vi.mock('axios', () => ({
  default: {
    defaults: { withCredentials: false },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock authService at the top level
vi.mock('../../services/authService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    clearStoredUser: vi.fn()
  }
}))

describe('axiosConfig', () => {
  let requestInterceptorFulfill
  let requestInterceptorReject
  let responseInterceptorFulfill
  let responseInterceptorReject
  let authService

  beforeEach(async () => {
    vi.clearAllMocks()

    // Reset cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    })

    // Reset modules to re-run side effects
    vi.resetModules()

    // Import the module under test -- this triggers interceptor registration
    await import('../../services/axiosConfig')

    // Now import axios and authService from the same module cache
    const axiosMod = await import('axios')
    const axiosMock = axiosMod.default

    const authMod = await import('../../services/authService')
    authService = authMod.default

    // Grab the callbacks that were registered
    const requestCalls = axiosMock.interceptors.request.use.mock.calls
    const responseCalls = axiosMock.interceptors.response.use.mock.calls

    if (requestCalls.length > 0) {
      const lastRequest = requestCalls[requestCalls.length - 1]
      requestInterceptorFulfill = lastRequest[0]
      requestInterceptorReject = lastRequest[1]
    }
    if (responseCalls.length > 0) {
      const lastResponse = responseCalls[responseCalls.length - 1]
      responseInterceptorFulfill = lastResponse[0]
      responseInterceptorReject = lastResponse[1]
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('global defaults', () => {
    it('sets withCredentials to true on axios defaults', async () => {
      const axiosMod = await import('axios')
      expect(axiosMod.default.defaults.withCredentials).toBe(true)
    })
  })

  describe('request interceptor', () => {
    it('registers a request interceptor', () => {
      expect(requestInterceptorFulfill).toBeDefined()
      expect(typeof requestInterceptorFulfill).toBe('function')
    })

    it('does not add CSRF header for GET requests', () => {
      document.cookie = 'bible_qa_csrf=test-token-123'
      const config = { method: 'get', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })

    it('does not add CSRF header for HEAD requests', () => {
      document.cookie = 'bible_qa_csrf=test-token-123'
      const config = { method: 'head', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })

    it('does not add CSRF header for OPTIONS requests', () => {
      document.cookie = 'bible_qa_csrf=test-token-123'
      const config = { method: 'options', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })

    it('adds CSRF header for POST requests when token cookie exists', () => {
      document.cookie = 'bible_qa_csrf=my-csrf-token'
      const config = { method: 'post', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBe('my-csrf-token')
    })

    it('adds CSRF header for PUT requests when token cookie exists', () => {
      document.cookie = 'bible_qa_csrf=put-token'
      const config = { method: 'put', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBe('put-token')
    })

    it('adds CSRF header for DELETE requests when token cookie exists', () => {
      document.cookie = 'bible_qa_csrf=delete-token'
      const config = { method: 'delete', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBe('delete-token')
    })

    it('does not add CSRF header when no CSRF cookie exists', () => {
      document.cookie = ''
      const config = { method: 'post', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })

    it('finds CSRF token among multiple cookies', () => {
      document.cookie = 'session=abc; bible_qa_csrf=multi-token; other=xyz'
      const config = { method: 'post', headers: {} }

      const result = requestInterceptorFulfill(config)

      expect(result.headers['X-CSRF-Token']).toBe('multi-token')
    })

    it('rejects on request interceptor error', async () => {
      const error = new Error('request setup failed')

      await expect(requestInterceptorReject(error)).rejects.toThrow('request setup failed')
    })
  })

  describe('response interceptor', () => {
    it('passes through successful responses unchanged', () => {
      const response = { status: 200, data: { ok: true } }

      const result = responseInterceptorFulfill(response)

      expect(result).toBe(response)
    })

    it('clears stored user and redirects on 401 when user was authenticated', async () => {
      authService.isAuthenticated.mockReturnValue(true)
      delete window.location
      window.location = { href: '' }

      const error = { response: { status: 401 } }

      await expect(responseInterceptorReject(error)).rejects.toBe(error)

      expect(authService.isAuthenticated).toHaveBeenCalled()
      expect(authService.clearStoredUser).toHaveBeenCalled()
      expect(window.location.href).toBe('/login')
    })

    it('clears stored user but does not redirect on 401 when no user was stored', async () => {
      authService.isAuthenticated.mockReturnValue(false)
      delete window.location
      window.location = { href: '/some-page' }

      const error = { response: { status: 401 } }

      await expect(responseInterceptorReject(error)).rejects.toBe(error)

      expect(authService.clearStoredUser).toHaveBeenCalled()
      expect(window.location.href).toBe('/some-page')
    })

    it('does not clear user or redirect for non-401 errors', async () => {
      const error = { response: { status: 500 } }

      await expect(responseInterceptorReject(error)).rejects.toBe(error)

      expect(authService.clearStoredUser).not.toHaveBeenCalled()
    })

    it('does not clear user when error has no response', async () => {
      const error = new Error('Network Error')

      await expect(responseInterceptorReject(error)).rejects.toThrow('Network Error')

      expect(authService.clearStoredUser).not.toHaveBeenCalled()
    })
  })
})

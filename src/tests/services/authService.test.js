import { describe, it, expect, beforeEach, vi } from 'vitest'
import authService from '../../services/authService'
import axios from 'axios'

vi.mock('axios')

describe('authService', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser'
  }

  const mockToken = 'mock-jwt-token-12345'

  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString() },
      removeItem: (key) => { delete store[key] },
      clear: () => { store = {} }
    }
  })()

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a user and return user data', async () => {
      const mockResponse = {
        data: mockUser
      }
      
      axios.post.mockResolvedValueOnce(mockResponse)

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'password123'
      )

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        }
      )
    })

    it('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: { detail: 'Email already exists' }
        }
      }
      
      axios.post.mockRejectedValueOnce(mockError)

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'password123'
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Email already exists')
    })

    it('should handle network errors during registration', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'password123'
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Registration failed')
    })
  })

  describe('login', () => {
    it('should successfully authenticate a user and store the token', async () => {
      const mockLoginResponse = {
        data: { access_token: mockToken }
      }
      
      const mockUserResponse = {
        data: mockUser
      }

      axios.post.mockResolvedValueOnce(mockLoginResponse)
      axios.get.mockResolvedValueOnce(mockUserResponse)

      const result = await authService.login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.token).toBe(mockToken)
      expect(result.user).toEqual(mockUser)
      
      // Verify token was stored in localStorage
      expect(localStorage.getItem('bible_qa_token')).toBe(mockToken)
      
      // Verify user data was stored in localStorage
      const storedUser = JSON.parse(localStorage.getItem('bible_qa_user'))
      expect(storedUser).toEqual(mockUser)

      // Verify API calls
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        {
          email: 'test@example.com',
          password: 'password123'
        }
      )
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      )
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockError = {
        response: {
          data: { detail: 'Invalid credentials' }
        }
      }
      
      axios.post.mockRejectedValueOnce(mockError)

      const result = await authService.login('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid credentials')
      expect(localStorage.getItem('bible_qa_token')).toBeNull()
    })

    it('should handle network errors during login', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.login('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Login failed')
    })
  })

  describe('logout', () => {
    it('should clear user data and token from storage', () => {
      // Setup: Store token and user data
      localStorage.setItem('bible_qa_token', mockToken)
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))

      // Verify data is stored
      expect(localStorage.getItem('bible_qa_token')).toBe(mockToken)
      expect(localStorage.getItem('bible_qa_user')).toBeTruthy()

      // Perform logout
      authService.logout()

      // Verify data is cleared
      expect(localStorage.getItem('bible_qa_token')).toBeNull()
      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })

    it('should not throw error when logging out without stored data', () => {
      expect(() => authService.logout()).not.toThrow()
      expect(localStorage.getItem('bible_qa_token')).toBeNull()
      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no token is stored', async () => {
      const user = await authService.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should fetch and return user data with valid token', async () => {
      localStorage.setItem('bible_qa_token', mockToken)
      
      const mockUserResponse = {
        data: mockUser
      }
      
      axios.get.mockResolvedValueOnce(mockUserResponse)

      const user = await authService.getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      )
    })

    it('should logout and return null on invalid token', async () => {
      localStorage.setItem('bible_qa_token', 'invalid-token')
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))
      
      axios.get.mockRejectedValueOnce(new Error('Unauthorized'))

      const user = await authService.getCurrentUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('bible_qa_token')).toBeNull()
      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })
  })

  describe('getToken', () => {
    it('should return stored token', () => {
      localStorage.setItem('bible_qa_token', mockToken)
      expect(authService.getToken()).toBe(mockToken)
    })

    it('should return null when no token is stored', () => {
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('bible_qa_token', mockToken)
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when no token exists', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })
})

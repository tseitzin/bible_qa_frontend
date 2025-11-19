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
    it('returns user data on success', async () => {
      axios.post.mockResolvedValueOnce({ data: mockUser })

      const result = await authService.register('test@example.com', 'testuser', 'password123')

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

    it('propagates server validation errors', async () => {
      axios.post.mockRejectedValueOnce({ response: { data: { detail: 'Email exists' } } })

      const result = await authService.register('test@example.com', 'testuser', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Email exists')
    })

    it('returns generic message on network failure', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.register('test@example.com', 'testuser', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Registration failed')
    })
  })

  describe('login', () => {
    it('stores user info and enables cookie session', async () => {
      axios.post.mockResolvedValueOnce({ data: mockUser })

      const result = await authService.login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(JSON.parse(localStorage.getItem('bible_qa_user'))).toEqual(mockUser)
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        { email: 'test@example.com', password: 'password123' },
        expect.objectContaining({ withCredentials: true })
      )
    })

    it('returns error details when login fails', async () => {
      axios.post.mockRejectedValueOnce({ response: { data: { detail: 'Invalid credentials' } } })

      const result = await authService.login('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid credentials')
      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })

    it('handles network failures gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('timeout'))

      const result = await authService.login('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Login failed')
    })
  })

  describe('logout', () => {
    it('clears stored user data even if request succeeds', async () => {
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))
      axios.post.mockResolvedValueOnce({ status: 204 })

      await authService.logout()

      expect(localStorage.getItem('bible_qa_user')).toBeNull()
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        null,
        expect.objectContaining({ withCredentials: true })
      )
    })

    it('still clears stored user data when request fails', async () => {
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))
      axios.post.mockRejectedValueOnce(new Error('Server down'))

      await authService.logout()

      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('returns user data when session is valid', async () => {
      axios.get.mockResolvedValueOnce({ data: mockUser })

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        expect.objectContaining({ withCredentials: true })
      )
    })

    it('clears stored user and returns null on failure', async () => {
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))
      axios.get.mockRejectedValueOnce(new Error('Unauthorized'))

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
      expect(localStorage.getItem('bible_qa_user')).toBeNull()
    })
  })

  describe('refreshUser', () => {
    it('updates local storage with latest user data', async () => {
      axios.get.mockResolvedValueOnce({ data: mockUser })

      const refreshed = await authService.refreshUser()

      expect(refreshed).toEqual(mockUser)
      expect(JSON.parse(localStorage.getItem('bible_qa_user'))).toEqual(mockUser)
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when user info is stored', () => {
      localStorage.setItem('bible_qa_user', JSON.stringify(mockUser))
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('returns false without stored user', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })
})

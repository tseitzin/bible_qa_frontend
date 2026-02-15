import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the axiosConfig module (which recentQuestionsService imports as axios)
vi.mock('../../services/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

import axios from '../../services/axiosConfig'
import { recentQuestionsService, RECENT_QUESTIONS_LIMIT } from '../../services/recentQuestionsService'

describe('recentQuestionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('RECENT_QUESTIONS_LIMIT', () => {
    it('exports a limit constant of 6', () => {
      expect(RECENT_QUESTIONS_LIMIT).toBe(6)
    })
  })

  describe('fetch', () => {
    it('returns recent questions from the API response', async () => {
      const questions = [
        { id: 1, question: 'Who is Jesus?', asked_at: '2024-01-01T00:00:00Z' },
        { id: 2, question: 'What is prayer?', asked_at: '2024-01-02T00:00:00Z' }
      ]
      axios.get.mockResolvedValueOnce({ data: { recent_questions: questions } })

      const result = await recentQuestionsService.fetch()

      expect(result).toEqual(questions)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me/recent-questions'),
        expect.anything()
      )
    })

    it('returns empty array when response has no recent_questions', async () => {
      axios.get.mockResolvedValueOnce({ data: {} })

      const result = await recentQuestionsService.fetch()

      expect(result).toEqual([])
    })

    it('returns empty array when response data is null', async () => {
      axios.get.mockResolvedValueOnce({ data: null })

      const result = await recentQuestionsService.fetch()

      expect(result).toEqual([])
    })

    it('returns empty array when response is null', async () => {
      axios.get.mockResolvedValueOnce(null)

      const result = await recentQuestionsService.fetch()

      expect(result).toEqual([])
    })

    it('returns empty array on API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await recentQuestionsService.fetch()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load recent questions:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('add', () => {
    it('returns empty array for unauthenticated users without making API call', async () => {
      const result = await recentQuestionsService.add('Who is God?', false)

      expect(result).toEqual([])
      expect(axios.post).not.toHaveBeenCalled()
    })

    it('returns empty array when isAuthenticated defaults to false', async () => {
      const result = await recentQuestionsService.add('test question')

      expect(result).toEqual([])
      expect(axios.post).not.toHaveBeenCalled()
    })

    it('posts the question when authenticated and returns updated list', async () => {
      const questions = [
        { id: 1, question: 'Who is God?', asked_at: '2024-01-01T00:00:00Z' }
      ]
      axios.post.mockResolvedValueOnce({ data: { recent_questions: questions } })

      const result = await recentQuestionsService.add('Who is God?', true)

      expect(result).toEqual(questions)
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me/recent-questions'),
        { question: 'Who is God?' }
      )
    })

    it('trims the question before posting', async () => {
      axios.post.mockResolvedValueOnce({ data: { recent_questions: [] } })

      await recentQuestionsService.add('  What is love?  ', true)

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        { question: 'What is love?' }
      )
    })

    it('falls back to fetch when question is empty string after trimming', async () => {
      const questions = [{ id: 1, question: 'old question', asked_at: '2024-01-01' }]
      axios.get.mockResolvedValueOnce({ data: { recent_questions: questions } })

      const result = await recentQuestionsService.add('   ', true)

      expect(axios.post).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
      expect(result).toEqual(questions)
    })

    it('falls back to fetch when question is not a string', async () => {
      axios.get.mockResolvedValueOnce({ data: { recent_questions: [] } })

      const result = await recentQuestionsService.add(123, true)

      expect(axios.post).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('falls back to fetch when question is null', async () => {
      axios.get.mockResolvedValueOnce({ data: { recent_questions: [] } })

      const result = await recentQuestionsService.add(null, true)

      expect(axios.post).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
    })

    it('returns empty array when API response has no recent_questions', async () => {
      axios.post.mockResolvedValueOnce({ data: {} })

      const result = await recentQuestionsService.add('test?', true)

      expect(result).toEqual([])
    })

    it('returns empty array on API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.post.mockRejectedValueOnce(new Error('Server error'))

      const result = await recentQuestionsService.add('test?', true)

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to record recent question:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('remove', () => {
    it('sends DELETE and returns updated list', async () => {
      const remaining = [{ id: 2, question: 'Still here', asked_at: '2024-01-02' }]
      axios.delete.mockResolvedValueOnce({ data: { recent_questions: remaining } })

      const result = await recentQuestionsService.remove(1)

      expect(result).toEqual(remaining)
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/users\/me\/recent-questions\/1$/),
        expect.anything()
      )
    })

    it('returns empty array when DELETE response has no recent_questions', async () => {
      axios.delete.mockResolvedValueOnce({ data: {} })

      const result = await recentQuestionsService.remove(5)

      expect(result).toEqual([])
    })

    it('falls back to fetch when recentQuestionId is falsy (0)', async () => {
      axios.get.mockResolvedValueOnce({ data: { recent_questions: [] } })

      await recentQuestionsService.remove(0)

      expect(axios.delete).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
    })

    it('falls back to fetch when recentQuestionId is null', async () => {
      axios.get.mockResolvedValueOnce({ data: { recent_questions: [] } })

      await recentQuestionsService.remove(null)

      expect(axios.delete).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
    })

    it('falls back to fetch when recentQuestionId is undefined', async () => {
      axios.get.mockResolvedValueOnce({ data: { recent_questions: [] } })

      await recentQuestionsService.remove(undefined)

      expect(axios.delete).not.toHaveBeenCalled()
      expect(axios.get).toHaveBeenCalled()
    })

    it('throws on API error (does not swallow errors)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const apiError = new Error('Delete failed')
      axios.delete.mockRejectedValueOnce(apiError)

      await expect(recentQuestionsService.remove(99)).rejects.toThrow('Delete failed')

      consoleSpy.mockRestore()
    })
  })
})

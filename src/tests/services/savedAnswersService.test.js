import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import { savedAnswersService } from '../../services/savedAnswersService'

vi.mock('axios')

describe('savedAnswersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('save', () => {
    it('returns success metadata when the API call succeeds', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 42 } })

      const result = await savedAnswersService.save(123, ['grace'])

      expect(result).toEqual({
        success: true,
        id: 42,
        message: 'Answer saved successfully!'
      })
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/saved-answers'),
        {
          question_id: 123,
          tags: ['grace']
        }
      )
    })

    it('propagates API error details when saving fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { detail: 'Already saved' } }
      })

      const result = await savedAnswersService.save(999)

      expect(result).toEqual({
        success: false,
        message: 'Already saved'
      })
    })

    it('falls back to a generic message on unexpected errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('network blew up'))

      const result = await savedAnswersService.save(1)

      expect(result).toEqual({
        success: false,
        message: 'Failed to save answer.'
      })
    })
  })

  describe('getAll', () => {
    it('returns saved answers from the API', async () => {
      const payload = [{ id: 1 }, { id: 2 }]
      axios.get.mockResolvedValueOnce({ data: { saved_answers: payload } })

      const results = await savedAnswersService.getAll()

      expect(results).toEqual(payload)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/saved-answers'),
        { params: {} }
      )
    })

    it('forwards filter params to the API', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })

      await savedAnswersService.getAll({ query: 'hope', tag: 'faith', limit: 5 })

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/saved-answers'),
        { params: { query: 'hope', tag: 'faith', limit: 5 } }
      )
    })

    it('returns an empty array when the API request fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('boom'))

      const results = await savedAnswersService.getAll()

      expect(results).toEqual([])
    })
  })

  describe('getById', () => {
    it('delegates to getAll and returns the matching entry', async () => {
      const saved = [{ id: 1 }, { id: 2 }]
      const getAllSpy = vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(saved)

      const result = await savedAnswersService.getById(2)

      expect(getAllSpy).toHaveBeenCalled()
      expect(result).toEqual({ id: 2 })
    })

    it('returns null when the entry is not found', async () => {
      vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce([])

      const result = await savedAnswersService.getById(999)

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('returns success metadata on successful deletion', async () => {
      axios.delete.mockResolvedValueOnce({})

      const result = await savedAnswersService.delete(55)

      expect(result).toEqual({
        success: true,
        message: 'Answer deleted successfully!'
      })
      expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/saved-answers/55'))
    })

    it('returns API error details when deletion fails', async () => {
      axios.delete.mockRejectedValueOnce({
        response: { data: { detail: 'Not found' } }
      })

      const result = await savedAnswersService.delete(404)

      expect(result).toEqual({
        success: false,
        message: 'Not found'
      })
    })

    it('falls back to a generic message on unexpected errors', async () => {
      axios.delete.mockRejectedValueOnce(new Error('timeout'))

      const result = await savedAnswersService.delete(2)

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete answer.'
      })
    })
  })

  describe('search helpers', () => {
    it('search delegates to getAll with the query', async () => {
      const spy = vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(['a'])

      const results = await savedAnswersService.search('grace')

      expect(spy).toHaveBeenCalledWith({ query: 'grace' })
      expect(results).toEqual(['a'])
    })

    it('getByTag delegates to getAll with the tag', async () => {
      const spy = vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(['b'])

      const results = await savedAnswersService.getByTag('faith')

      expect(spy).toHaveBeenCalledWith({ tag: 'faith' })
      expect(results).toEqual(['b'])
    })
  })

  describe('getAllTags', () => {
    it('returns tag data from the API', async () => {
      axios.get.mockResolvedValueOnce({ data: ['faith', 'hope'] })

      const tags = await savedAnswersService.getAllTags()

      expect(tags).toEqual(['faith', 'hope'])
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/saved-answers/tags'))
    })

    it('returns an empty array on failure', async () => {
      axios.get.mockRejectedValueOnce(new Error('nope'))

      const tags = await savedAnswersService.getAllTags()

      expect(tags).toEqual([])
    })
  })

  describe('getStats', () => {
    it('combines saved answers and tags into aggregate stats', async () => {
      const savedData = [
        { id: 1, answer: 'Love is patient.', saved_at: '2023-01-02T00:00:00Z' },
        { id: 2, answer: 'Faith moves mountains.', saved_at: '2023-01-01T00:00:00Z' }
      ]
      const tagsData = ['love', 'faith']
      vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(savedData)
      vi.spyOn(savedAnswersService, 'getAllTags').mockResolvedValueOnce(tagsData)

      const stats = await savedAnswersService.getStats()

      expect(stats).toEqual({
        totalSaved: 2,
        totalWords: 6,
        totalTags: 2,
        oldestSave: '2023-01-01T00:00:00Z',
        newestSave: '2023-01-02T00:00:00Z'
      })
    })

    it('returns zeroed stats when underlying calls fail', async () => {
      vi.spyOn(savedAnswersService, 'getAll').mockRejectedValueOnce(new Error('fail'))

      const stats = await savedAnswersService.getStats()

      expect(stats).toEqual({ totalSaved: 0, totalWords: 0, totalTags: 0 })
    })
  })

  describe('exportData', () => {
    it('returns JSON with metadata and saved entries', async () => {
      const saved = [{ id: 1 }, { id: 2 }]
      vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(saved)

      const exported = await savedAnswersService.exportData()
      const parsed = JSON.parse(exported)

      expect(parsed.version).toBe('1.0')
      expect(parsed.source).toBe('Bible Q&A App')
      expect(parsed.answers).toEqual(saved)
      expect(typeof parsed.exportDate).toBe('string')
    })
  })

  describe('getStorageInfo', () => {
    it('derives counts from getAll', async () => {
      vi.spyOn(savedAnswersService, 'getAll').mockResolvedValueOnce(new Array(3).fill({}))

      const info = await savedAnswersService.getStorageInfo()

      expect(info).toEqual({
        used: 3,
        total: 100,
        remaining: 97,
        percentage: 3
      })
    })
  })
})

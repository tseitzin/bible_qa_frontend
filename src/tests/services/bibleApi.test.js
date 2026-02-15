import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
  return {
    default: {
      create: vi.fn(() => instance),
      __instance: instance
    }
  }
})

// Get reference to the mock instance
const apiClient = axios.create()

describe('bibleApi', () => {
  let bibleApi

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset modules to get a fresh import
    vi.resetModules()

    // Re-mock axios before re-importing
    vi.doMock('axios', () => {
      const instance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      return {
        default: {
          create: vi.fn(() => instance),
          __instance: instance
        }
      }
    })

    const mod = await import('../../services/bibleApi')
    bibleApi = mod.bibleApi

    // Reset cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper to get the mocked apiClient instance
  async function getApiClient() {
    const axiosMod = await import('axios')
    return axiosMod.default.create()
  }

  describe('askQuestion', () => {
    it('sends a POST to /api/ask and returns response data', async () => {
      const client = await getApiClient()
      const mockData = { answer: 'God is love', question_id: 1 }
      client.post.mockResolvedValueOnce({ data: mockData })

      const result = await bibleApi.askQuestion('Who is God?')

      expect(client.post).toHaveBeenCalledWith('/api/ask', {
        question: 'Who is God?',
        user_id: 1
      })
      expect(result).toEqual(mockData)
    })

    it('trims the question before sending', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { answer: 'test' } })

      await bibleApi.askQuestion('  What is prayer?  ')

      expect(client.post).toHaveBeenCalledWith('/api/ask', {
        question: 'What is prayer?',
        user_id: 1
      })
    })

    it('uses custom userId when provided', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { answer: 'test' } })

      await bibleApi.askQuestion('test question', 42)

      expect(client.post).toHaveBeenCalledWith('/api/ask', {
        question: 'test question',
        user_id: 42
      })
    })

    it('throws an error for empty question', async () => {
      await expect(bibleApi.askQuestion('')).rejects.toThrow('Question cannot be empty')
    })

    it('throws an error for whitespace-only question', async () => {
      await expect(bibleApi.askQuestion('   ')).rejects.toThrow('Question cannot be empty')
    })

    it('throws an error for null question', async () => {
      await expect(bibleApi.askQuestion(null)).rejects.toThrow('Question cannot be empty')
    })

    it('throws an error for undefined question', async () => {
      await expect(bibleApi.askQuestion(undefined)).rejects.toThrow('Question cannot be empty')
    })

    it('propagates API errors', async () => {
      const client = await getApiClient()
      client.post.mockRejectedValueOnce(new Error('Server error'))

      await expect(bibleApi.askQuestion('test?')).rejects.toThrow('Server error')
    })
  })

  describe('askFollowUpQuestion', () => {
    it('sends a POST to /api/ask/followup with full payload', async () => {
      const client = await getApiClient()
      const mockData = { answer: 'Follow up answer', question_id: 2 }
      client.post.mockResolvedValueOnce({ data: mockData })

      const result = await bibleApi.askFollowUpQuestion({
        question: 'Tell me more',
        conversation_history: [{ role: 'user', content: 'first' }],
        parent_question_id: 1,
        userId: 5
      })

      expect(client.post).toHaveBeenCalledWith('/api/ask/followup', {
        question: 'Tell me more',
        conversation_history: [{ role: 'user', content: 'first' }],
        parent_question_id: 1,
        user_id: 5
      })
      expect(result).toEqual(mockData)
    })

    it('uses default empty conversation_history and null parent_question_id', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { answer: 'ok' } })

      await bibleApi.askFollowUpQuestion({ question: 'What next?' })

      expect(client.post).toHaveBeenCalledWith('/api/ask/followup', {
        question: 'What next?',
        conversation_history: [],
        parent_question_id: null,
        user_id: 1
      })
    })

    it('throws for empty follow-up question', async () => {
      await expect(
        bibleApi.askFollowUpQuestion({ question: '' })
      ).rejects.toThrow('Question cannot be empty')
    })

    it('throws for null follow-up question', async () => {
      await expect(
        bibleApi.askFollowUpQuestion({ question: null })
      ).rejects.toThrow('Question cannot be empty')
    })
  })

  describe('getVerse', () => {
    it('sends a GET to /api/bible/verse with reference param', async () => {
      const client = await getApiClient()
      const mockData = { text: 'In the beginning...', reference: 'Genesis 1:1' }
      client.get.mockResolvedValueOnce({ data: mockData })

      const result = await bibleApi.getVerse('Genesis 1:1')

      expect(client.get).toHaveBeenCalledWith('/api/bible/verse', {
        params: { ref: 'Genesis 1:1' }
      })
      expect(result).toEqual(mockData)
    })

    it('trims the reference', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { text: 'verse' } })

      await bibleApi.getVerse('  John 3:16  ')

      expect(client.get).toHaveBeenCalledWith('/api/bible/verse', {
        params: { ref: 'John 3:16' }
      })
    })

    it('throws for empty reference', async () => {
      await expect(bibleApi.getVerse('')).rejects.toThrow('Reference cannot be empty')
    })

    it('throws for null reference', async () => {
      await expect(bibleApi.getVerse(null)).rejects.toThrow('Reference cannot be empty')
    })
  })

  describe('getPassage', () => {
    it('sends a GET to /api/bible/passage with reference param', async () => {
      const client = await getApiClient()
      const mockData = { text: 'Psalm 23 text', reference: 'Psalm 23' }
      client.get.mockResolvedValueOnce({ data: mockData })

      const result = await bibleApi.getPassage('Psalm 23')

      expect(client.get).toHaveBeenCalledWith('/api/bible/passage', {
        params: { reference: 'Psalm 23' }
      })
      expect(result).toEqual(mockData)
    })

    it('throws for empty reference', async () => {
      await expect(bibleApi.getPassage('')).rejects.toThrow('Reference cannot be empty')
    })
  })

  describe('getChapter', () => {
    it('delegates to getPassage with book and chapter combined', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { text: 'chapter content' } })

      const result = await bibleApi.getChapter('Genesis', 1)

      expect(client.get).toHaveBeenCalledWith('/api/bible/passage', {
        params: { reference: 'Genesis 1' }
      })
      expect(result).toEqual({ text: 'chapter content' })
    })

    it('trims the book name', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { text: 'content' } })

      await bibleApi.getChapter('  Exodus  ', 3)

      expect(client.get).toHaveBeenCalledWith('/api/bible/passage', {
        params: { reference: 'Exodus 3' }
      })
    })

    it('throws when book is empty', async () => {
      await expect(bibleApi.getChapter('', 1)).rejects.toThrow('Book and chapter are required')
    })

    it('throws when chapter is falsy (0)', async () => {
      await expect(bibleApi.getChapter('Genesis', 0)).rejects.toThrow('Book and chapter are required')
    })

    it('throws when chapter is null', async () => {
      await expect(bibleApi.getChapter('Genesis', null)).rejects.toThrow('Book and chapter are required')
    })
  })

  describe('streamQuestion', () => {
    it('throws for empty question', async () => {
      const onChunk = vi.fn()
      await expect(bibleApi.streamQuestion('', onChunk)).rejects.toThrow('Question cannot be empty')
    })

    it('throws for null question', async () => {
      const onChunk = vi.fn()
      await expect(bibleApi.streamQuestion(null, onChunk)).rejects.toThrow('Question cannot be empty')
    })

    it('streams SSE events and calls onChunk for each data line', async () => {
      const onChunk = vi.fn()
      const ssePayload = 'data: {"type":"content","text":"Hello"}\n\ndata: {"type":"done","question_id":1}\n\n'
      const encoder = new TextEncoder()

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: encoder.encode(ssePayload) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      })

      await bibleApi.streamQuestion('What is love?', onChunk)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ask/stream'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ question: 'What is love?', user_id: 1 })
        })
      )

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenCalledWith({ type: 'content', text: 'Hello' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'done', question_id: 1 })
    })

    it('includes CSRF token in headers when cookie exists', async () => {
      document.cookie = 'bible_qa_csrf=stream-csrf-token'
      const onChunk = vi.fn()

      const mockReader = {
        read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined })
      }

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      })

      await bibleApi.streamQuestion('test?', onChunk)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-CSRF-Token': 'stream-csrf-token' })
        })
      )
    })

    it('throws when fetch response is not ok', async () => {
      const onChunk = vi.fn()

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce({ detail: 'Server error' })
      })

      await expect(bibleApi.streamQuestion('test?', onChunk)).rejects.toThrow('Server error')
    })

    it('throws with HTTP status when error JSON parse fails', async () => {
      const onChunk = vi.fn()

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValueOnce(new Error('not json'))
      })

      await expect(bibleApi.streamQuestion('test?', onChunk)).rejects.toThrow('HTTP 503')
    })

    it('handles SSE parse errors gracefully without crashing', async () => {
      const onChunk = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const encoder = new TextEncoder()

      const ssePayload = 'data: {invalid json}\n\ndata: {"type":"done"}\n\n'

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: encoder.encode(ssePayload) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      })

      await bibleApi.streamQuestion('test?', onChunk)

      // Only the valid JSON should have triggered onChunk
      expect(onChunk).toHaveBeenCalledTimes(1)
      expect(onChunk).toHaveBeenCalledWith({ type: 'done' })
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('streamFollowUpQuestion', () => {
    it('throws for empty question', async () => {
      const onChunk = vi.fn()
      await expect(
        bibleApi.streamFollowUpQuestion({ question: '' }, onChunk)
      ).rejects.toThrow('Question cannot be empty')
    })

    it('streams follow-up SSE events', async () => {
      const onChunk = vi.fn()
      const encoder = new TextEncoder()
      const ssePayload = 'data: {"type":"content","text":"More info"}\n\n'

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: encoder.encode(ssePayload) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      })

      await bibleApi.streamFollowUpQuestion(
        { question: 'Tell me more', conversation_history: [], parent_question_id: 1 },
        onChunk,
        2
      )

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ask/followup/stream'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            question: 'Tell me more',
            conversation_history: [],
            parent_question_id: 1,
            user_id: 2
          })
        })
      )
      expect(onChunk).toHaveBeenCalledWith({ type: 'content', text: 'More info' })
    })

    it('throws when follow-up stream response is not ok', async () => {
      const onChunk = vi.fn()

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce({ message: 'Bad request' })
      })

      await expect(
        bibleApi.streamFollowUpQuestion({ question: 'test' }, onChunk)
      ).rejects.toThrow('Bad request')
    })
  })

  describe('admin API methods', () => {
    it('getApiLogs sends GET to /api/admin/logs/', async () => {
      const client = await getApiClient()
      const mockData = { logs: [] }
      client.get.mockResolvedValueOnce({ data: mockData })

      const result = await bibleApi.getApiLogs({ limit: 10 })

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/', { params: { limit: 10 } })
      expect(result).toEqual(mockData)
    })

    it('getApiStats sends GET to /api/admin/logs/stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { total: 100 } })

      const result = await bibleApi.getApiStats({ start_date: '2024-01-01' })

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/stats', { params: { start_date: '2024-01-01' } })
      expect(result).toEqual({ total: 100 })
    })

    it('getEndpointStats sends GET to /api/admin/logs/endpoints', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: [] })

      await bibleApi.getEndpointStats()

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/endpoints', { params: {} })
    })

    it('getOpenAIStats sends GET to /api/admin/logs/openai/stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { total_cost: 5.0 } })

      const result = await bibleApi.getOpenAIStats()

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/openai/stats', { params: {} })
      expect(result).toEqual({ total_cost: 5.0 })
    })

    it('getOpenAICalls sends GET to /api/admin/logs/openai', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { calls: [] } })

      await bibleApi.getOpenAICalls({ limit: 5 })

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/openai', { params: { limit: 5 } })
    })

    it('getOpenAIUserUsage sends GET to /api/admin/logs/openai/users', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: [] })

      await bibleApi.getOpenAIUserUsage({ limit: 3 })

      expect(client.get).toHaveBeenCalledWith('/api/admin/logs/openai/users', { params: { limit: 3 } })
    })

    it('getUserStats sends GET to /api/admin/users/stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { total_users: 50 } })

      const result = await bibleApi.getUserStats()

      expect(client.get).toHaveBeenCalledWith('/api/admin/users/stats')
      expect(result).toEqual({ total_users: 50 })
    })

    it('listUsers sends GET to /api/admin/users/ with params', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { users: [] } })

      await bibleApi.listUsers({ search: 'john', limit: 10 })

      expect(client.get).toHaveBeenCalledWith('/api/admin/users/', { params: { search: 'john', limit: 10 } })
    })

    it('getUserDetail sends GET to /api/admin/users/:id', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { id: 5, email: 'test@test.com' } })

      const result = await bibleApi.getUserDetail(5)

      expect(client.get).toHaveBeenCalledWith('/api/admin/users/5')
      expect(result).toEqual({ id: 5, email: 'test@test.com' })
    })

    it('resetUserAccount sends POST to /api/admin/users/:id/reset-account', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { message: 'reset' } })

      await bibleApi.resetUserAccount(7)

      expect(client.post).toHaveBeenCalledWith('/api/admin/users/7/reset-account')
    })

    it('clearUserSavedAnswers sends POST to /api/admin/users/:id/clear-saved-answers', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { message: 'cleared' } })

      await bibleApi.clearUserSavedAnswers(3)

      expect(client.post).toHaveBeenCalledWith('/api/admin/users/3/clear-saved-answers')
    })

    it('toggleUserActive sends POST to /api/admin/users/:id/toggle-active', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { is_active: false } })

      await bibleApi.toggleUserActive(2)

      expect(client.post).toHaveBeenCalledWith('/api/admin/users/2/toggle-active')
    })

    it('deleteUser sends DELETE to /api/admin/users/:id', async () => {
      const client = await getApiClient()
      client.delete.mockResolvedValueOnce({ data: { message: 'deleted' } })

      await bibleApi.deleteUser(9)

      expect(client.delete).toHaveBeenCalledWith('/api/admin/users/9')
    })

    it('cleanupGuestUsers sends POST to /api/admin/users/cleanup-guest-users', async () => {
      const client = await getApiClient()
      client.post.mockResolvedValueOnce({ data: { cleaned: 5 } })

      const result = await bibleApi.cleanupGuestUsers()

      expect(client.post).toHaveBeenCalledWith('/api/admin/users/cleanup-guest-users')
      expect(result).toEqual({ cleaned: 5 })
    })

    it('propagates errors from admin methods', async () => {
      const client = await getApiClient()
      client.get.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(bibleApi.getApiLogs()).rejects.toThrow('Forbidden')
    })
  })

  describe('analytics methods', () => {
    it('logPageView sends POST to /api/analytics/page-view', async () => {
      const client = await getApiClient()
      const payload = { session_id: 'abc', page_path: '/app', page_title: 'App' }
      client.post.mockResolvedValueOnce({ data: { id: 1 } })

      const result = await bibleApi.logPageView(payload)

      expect(client.post).toHaveBeenCalledWith('/api/analytics/page-view', payload)
      expect(result).toEqual({ id: 1 })
    })

    it('updatePageMetrics sends PUT to /api/analytics/page-metrics', async () => {
      const client = await getApiClient()
      const payload = { page_analytics_id: 1, visit_duration_seconds: 30 }
      client.put.mockResolvedValueOnce({ data: { updated: true } })

      const result = await bibleApi.updatePageMetrics(payload)

      expect(client.put).toHaveBeenCalledWith('/api/analytics/page-metrics', payload)
      expect(result).toEqual({ updated: true })
    })

    it('logClickEvent sends POST to /api/analytics/click-event', async () => {
      const client = await getApiClient()
      const payload = { session_id: 'abc', element_type: 'button' }
      client.post.mockResolvedValueOnce({ data: { id: 5 } })

      await bibleApi.logClickEvent(payload)

      expect(client.post).toHaveBeenCalledWith('/api/analytics/click-event', payload)
    })

    it('getPageAnalyticsStats sends GET to /api/analytics/admin/stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { views: 100 } })

      const result = await bibleApi.getPageAnalyticsStats({ start_date: '2024-01-01' })

      expect(client.get).toHaveBeenCalledWith('/api/analytics/admin/stats', { params: { start_date: '2024-01-01' } })
      expect(result).toEqual({ views: 100 })
    })

    it('getPageViews sends GET to /api/analytics/admin/page-views', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: { page_views: [] } })

      await bibleApi.getPageViews({ limit: 20 })

      expect(client.get).toHaveBeenCalledWith('/api/analytics/admin/page-views', { params: { limit: 20 } })
    })

    it('getPagePathStats sends GET to /api/analytics/admin/page-path-stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: [] })

      await bibleApi.getPagePathStats()

      expect(client.get).toHaveBeenCalledWith('/api/analytics/admin/page-path-stats', { params: {} })
    })

    it('getClickEvents sends GET to /api/analytics/admin/click-events', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: [] })

      await bibleApi.getClickEvents({ element_type: 'button' })

      expect(client.get).toHaveBeenCalledWith('/api/analytics/admin/click-events', { params: { element_type: 'button' } })
    })

    it('getClickStats sends GET to /api/analytics/admin/click-stats', async () => {
      const client = await getApiClient()
      client.get.mockResolvedValueOnce({ data: [] })

      await bibleApi.getClickStats()

      expect(client.get).toHaveBeenCalledWith('/api/analytics/admin/click-stats', { params: {} })
    })
  })
})

/**
 * Unit tests for triviaApi.js
 *
 * Strategy: mock the apiClient (the axios instance from bibleApi.js) by
 * mocking the entire bibleApi.js module, then re-import triviaApi.js fresh
 * each test so it picks up the mock.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock bibleApi.js so triviaApi.js gets our controlled apiClient.
// vi.hoisted ensures mockApiClient is created before vi.mock's factory runs.
// ---------------------------------------------------------------------------

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../../services/bibleApi.js', () => ({
  default: mockApiClient,
}))

// ---------------------------------------------------------------------------
// Import the module under test AFTER the mock is registered
// ---------------------------------------------------------------------------

import { triviaApi } from '../../services/triviaApi.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockGet(data) {
  mockApiClient.get.mockResolvedValueOnce({ data })
}

function mockPost(data) {
  mockApiClient.post.mockResolvedValueOnce({ data })
}

function mockGetError(err) {
  mockApiClient.get.mockRejectedValueOnce(err)
}

function mockPostError(err) {
  mockApiClient.post.mockRejectedValueOnce(err)
}

// ---------------------------------------------------------------------------

describe('triviaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── getQuestions ───────────────────────────────────────────────────────

  describe('getQuestions', () => {
    it('calls GET /api/trivia/questions with category, difficulty and count', async () => {
      const mockData = {
        questions: [{ id: 1, question_text: 'Q?' }],
        total: 1,
        category: 'old_testament',
        difficulty: 'easy',
      }
      mockGet(mockData)

      const result = await triviaApi.getQuestions({
        category: 'old_testament',
        difficulty: 'easy',
        count: 10,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trivia/questions', {
        params: { category: 'old_testament', difficulty: 'easy', count: 10 },
      })
      expect(result).toEqual(mockData)
    })

    it('includes question_type param when provided', async () => {
      mockGet({ questions: [], total: 0, category: 'old_testament', difficulty: 'easy' })

      await triviaApi.getQuestions({
        category: 'old_testament',
        difficulty: 'easy',
        count: 5,
        questionType: 'true_false',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trivia/questions', {
        params: {
          category: 'old_testament',
          difficulty: 'easy',
          count: 5,
          question_type: 'true_false',
        },
      })
    })

    it('does not include question_type when null', async () => {
      mockGet({ questions: [], total: 0, category: 'new_testament', difficulty: 'medium' })

      await triviaApi.getQuestions({
        category: 'new_testament',
        difficulty: 'medium',
        count: 10,
        questionType: null,
      })

      const params = mockApiClient.get.mock.calls[0][1].params
      expect(params).not.toHaveProperty('question_type')
    })

    it('propagates API errors', async () => {
      mockGetError(new Error('Network error'))

      await expect(
        triviaApi.getQuestions({ category: 'old_testament', difficulty: 'easy', count: 5 })
      ).rejects.toThrow('Network error')
    })

    it('returns the data property of the axios response', async () => {
      const inner = { questions: [{ id: 99 }], total: 1, category: 'psalms_proverbs', difficulty: 'hard' }
      mockGet(inner)

      const result = await triviaApi.getQuestions({
        category: 'psalms_proverbs',
        difficulty: 'hard',
        count: 5,
      })

      expect(result).toBe(inner)
    })
  })

  // ── submitSession ──────────────────────────────────────────────────────

  describe('submitSession', () => {
    it('calls POST /api/trivia/sessions with sessionData', async () => {
      const sessionData = {
        category: 'old_testament',
        difficulty: 'easy',
        question_count: 5,
        answers: [{ question_id: 1, chosen_answer: 'Moses', is_correct: true }],
        timer_enabled: false,
      }
      const mockResult = { session_id: 42, score_breakdown: { total_score: 300 } }
      mockPost(mockResult)

      const result = await triviaApi.submitSession(sessionData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/trivia/sessions', sessionData)
      expect(result).toEqual(mockResult)
    })

    it('propagates POST errors', async () => {
      mockPostError(new Error('Server error'))

      await expect(
        triviaApi.submitSession({ category: 'old_testament', difficulty: 'easy' })
      ).rejects.toThrow('Server error')
    })

    it('returns raw data from the response', async () => {
      const inner = { session_id: 7, score_breakdown: { total_score: 0 } }
      mockPost(inner)

      const result = await triviaApi.submitSession({})

      expect(result).toBe(inner)
    })
  })

  // ── getLeaderboard ─────────────────────────────────────────────────────

  describe('getLeaderboard', () => {
    it('calls GET /api/trivia/leaderboard with period and limit defaults', async () => {
      const mockData = { entries: [], period: 'all_time' }
      mockGet(mockData)

      const result = await triviaApi.getLeaderboard()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trivia/leaderboard', {
        params: { period: 'all_time', limit: 10 },
      })
      expect(result).toEqual(mockData)
    })

    it('includes category param when provided', async () => {
      mockGet({ entries: [] })

      await triviaApi.getLeaderboard({ category: 'new_testament' })

      const params = mockApiClient.get.mock.calls[0][1].params
      expect(params.category).toBe('new_testament')
    })

    it('includes difficulty param when provided', async () => {
      mockGet({ entries: [] })

      await triviaApi.getLeaderboard({ difficulty: 'hard' })

      const params = mockApiClient.get.mock.calls[0][1].params
      expect(params.difficulty).toBe('hard')
    })

    it('omits category when null', async () => {
      mockGet({ entries: [] })

      await triviaApi.getLeaderboard({ category: null, difficulty: null })

      const params = mockApiClient.get.mock.calls[0][1].params
      expect(params).not.toHaveProperty('category')
      expect(params).not.toHaveProperty('difficulty')
    })

    it('uses provided period and limit', async () => {
      mockGet({ entries: [] })

      await triviaApi.getLeaderboard({ period: 'weekly', limit: 25 })

      const params = mockApiClient.get.mock.calls[0][1].params
      expect(params.period).toBe('weekly')
      expect(params.limit).toBe(25)
    })

    it('propagates GET errors', async () => {
      mockGetError(new Error('Forbidden'))

      await expect(triviaApi.getLeaderboard()).rejects.toThrow('Forbidden')
    })
  })

  // ── getDailyChallenge ──────────────────────────────────────────────────

  describe('getDailyChallenge', () => {
    it('calls GET /api/trivia/daily-challenge', async () => {
      const mockData = { id: 1, question_text: 'Daily Q?' }
      mockGet(mockData)

      const result = await triviaApi.getDailyChallenge()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trivia/daily-challenge')
      expect(result).toEqual(mockData)
    })

    it('returns data from response', async () => {
      const inner = { id: 5, question_text: 'Who built the ark?' }
      mockGet(inner)

      const result = await triviaApi.getDailyChallenge()

      expect(result).toBe(inner)
    })

    it('propagates errors', async () => {
      mockGetError(new Error('Service unavailable'))

      await expect(triviaApi.getDailyChallenge()).rejects.toThrow('Service unavailable')
    })
  })

  // ── submitDailyAnswer ─────────────────────────────────────────────────

  describe('submitDailyAnswer', () => {
    it('calls POST /api/trivia/daily-challenge/submit with correct body', async () => {
      const mockData = { is_correct: true, correct_answer: 'Noah', score: 150 }
      mockPost(mockData)

      const result = await triviaApi.submitDailyAnswer({
        questionId: 7,
        chosenAnswer: 'Noah',
      })

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/trivia/daily-challenge/submit',
        { question_id: 7, chosen_answer: 'Noah' }
      )
      expect(result).toEqual(mockData)
    })

    it('includes time_seconds in body when provided', async () => {
      mockPost({ is_correct: false, correct_answer: 'Noah', score: 0 })

      await triviaApi.submitDailyAnswer({
        questionId: 7,
        chosenAnswer: 'Moses',
        timeSeconds: 12,
      })

      const body = mockApiClient.post.mock.calls[0][1]
      expect(body.time_seconds).toBe(12)
    })

    it('omits time_seconds when null', async () => {
      mockPost({ is_correct: true, correct_answer: 'Noah', score: 100 })

      await triviaApi.submitDailyAnswer({
        questionId: 7,
        chosenAnswer: 'Noah',
        timeSeconds: null,
      })

      const body = mockApiClient.post.mock.calls[0][1]
      expect(body).not.toHaveProperty('time_seconds')
    })

    it('uses default timeSeconds of null when not provided', async () => {
      mockPost({ is_correct: true, correct_answer: 'David', score: 150 })

      await triviaApi.submitDailyAnswer({ questionId: 1, chosenAnswer: 'David' })

      const body = mockApiClient.post.mock.calls[0][1]
      expect(body).not.toHaveProperty('time_seconds')
    })

    it('propagates POST errors', async () => {
      mockPostError(new Error('Not found'))

      await expect(
        triviaApi.submitDailyAnswer({ questionId: 999, chosenAnswer: 'A' })
      ).rejects.toThrow('Not found')
    })
  })
})

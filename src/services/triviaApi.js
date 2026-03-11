import apiClient from './bibleApi.js'

/**
 * Trivia API client — reuses the shared apiClient from bibleApi.js
 * for CSRF token handling and cookie-based auth.
 */
export const triviaApi = {
  /**
   * Fetch trivia questions for a new game session.
   * @param {Object} params
   * @param {string} params.category - 'old_testament' | 'new_testament' | 'psalms_proverbs' | 'doctrine_theology'
   * @param {string} params.difficulty - 'easy' | 'medium' | 'hard'
   * @param {number} params.count - Number of questions (5 | 10 | 20)
   * @param {string|null} params.questionType - Optional question type filter
   * @returns {Promise<{ questions: Array }>}
   */
  async getQuestions({ category, difficulty, count, questionType = null }) {
    const params = { category, difficulty, count }
    if (questionType) params.question_type = questionType
    const { data } = await apiClient.get('/api/trivia/questions', { params })
    return data
  },

  /**
   * Submit a completed trivia session and receive authoritative scoring.
   * @param {Object} sessionData
   * @returns {Promise<Object>} Session result with score, breakdown, and leaderboard position
   */
  async submitSession(sessionData) {
    const { data } = await apiClient.post('/api/trivia/sessions', sessionData)
    return data
  },

  /**
   * Fetch leaderboard entries.
   * @param {Object} params
   * @param {string|null} params.category - Filter by category
   * @param {string|null} params.difficulty - Filter by difficulty
   * @param {string} params.period - 'all_time' | 'weekly'
   * @param {number} params.limit - Max entries to return
   * @returns {Promise<Array>}
   */
  async getLeaderboard({ category = null, difficulty = null, period = 'all_time', limit = 10 } = {}) {
    const params = { period, limit }
    if (category) params.category = category
    if (difficulty) params.difficulty = difficulty
    const { data } = await apiClient.get('/api/trivia/leaderboard', { params })
    return data
  },

  /**
   * Fetch today's daily challenge question.
   * @returns {Promise<Object>} Daily challenge question object
   */
  async getDailyChallenge() {
    const { data } = await apiClient.get('/api/trivia/daily-challenge')
    return data
  },

  /**
   * Submit an answer to the daily challenge question.
   * @param {Object} params
   * @param {number|string} params.questionId - The daily challenge question ID
   * @param {string} params.chosenAnswer - The answer the user selected
   * @param {number|null} params.timeSeconds - Time taken in seconds (optional)
   * @returns {Promise<Object>} Result with correctness and explanation
   */
  async submitDailyAnswer({ questionId, chosenAnswer, timeSeconds = null }) {
    const body = { question_id: questionId, chosen_answer: chosenAnswer }
    if (timeSeconds !== null) body.time_seconds = timeSeconds
    const { data } = await apiClient.post('/api/trivia/daily-challenge/submit', body)
    return data
  }
}

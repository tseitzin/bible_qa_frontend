/**
 * Service for retrieving a user's recent questions from the backend.
 */
import axios from './axiosConfig'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BASE_PATH = `${API_URL}/api/users/me/recent-questions`

export const recentQuestionsService = {
  /**
   * Fetch the most recent questions for the authenticated user.
   * @returns {Promise<Array<{ id: number, question: string, asked_at: string }>>}
   */
  async fetch() {
    try {
      const response = await axios.get(BASE_PATH, {
      })
      return response?.data?.recent_questions ?? []
    } catch (error) {
      console.error('Failed to load recent questions:', error)
      return []
    }
  },

  /**
   * Explicitly record a recent question (optional helper).
   * @param {string} question - Question text to record.
   * @returns {Promise<Array<{ id: number, question: string, asked_at: string }>>}
   */
  async add(question) {
    const trimmed = typeof question === 'string' ? question.trim() : ''
    if (!trimmed) {
      return this.fetch()
    }

    try {
      const response = await axios.post(
        BASE_PATH,
        { question: trimmed }
      )
      return response?.data?.recent_questions ?? []
    } catch (error) {
      console.error('Failed to record recent question:', error)
      return []
    }
  },

  /**
   * Delete a specific recent question for the authenticated user.
   * @param {number} recentQuestionId - ID of the recent question entry to remove.
   * @returns {Promise<Array<{ id: number, question: string, asked_at: string }>>}
   */
  async remove(recentQuestionId) {
    if (!recentQuestionId) {
      return this.fetch()
    }

    try {
      const response = await axios.delete(`${BASE_PATH}/${recentQuestionId}`, {
      })
      return response?.data?.recent_questions ?? []
    } catch (error) {
      console.error('Failed to delete recent question:', error)
      throw error
    }
  }
}

export const RECENT_QUESTIONS_LIMIT = 6
export default recentQuestionsService

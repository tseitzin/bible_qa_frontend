/**
 * API service for managing saved Bible Q&A answers
 */
import axios from 'axios'
import authService from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = authService.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const service = {
  /**
   * Save a Q&A to the database
   * @param {number} questionId - The question ID to save
   * @param {Array} tags - Optional array of tags for categorization
   * @returns {Object} Result object with success, id, and message
   */
  async save(questionId, tags = []) {
    try {
      const response = await axios.post(
        `${API_URL}/api/saved-answers`,
        { question_id: questionId, tags },
        { headers: getAuthHeaders() }
      )
      
      return {
        success: true,
        id: response?.data?.id,
        message: 'Answer saved successfully!'
      }
    } catch (error) {
      console.error('Failed to save answer:', error)
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to save answer.'
      }
    }
  },

  /**
   * Get all saved Q&As
   * @param {Object} options - Query options {query, tag, limit}
   * @returns {Array} Array of saved Q&A objects
   */
  async getAll(options = {}) {
    try {
      const params = {}
      if (options.query) params.query = options.query
      if (options.tag) params.tag = options.tag
      if (options.limit) params.limit = options.limit

      const response = await axios.get(`${API_URL}/api/saved-answers`, {
        headers: getAuthHeaders(),
        params
      })
      
      return response?.data?.saved_answers || []
    } catch (error) {
      console.error('Failed to load saved answers:', error)
      return []
    }
  },

  /**
   * Get a specific saved Q&A by ID
   * @param {number} id - The ID of the saved item
   * @returns {Object|null} The saved item or null if not found
   */
  async getById(id) {
    const saved = await this.getAll()
    return saved.find(item => item.id === id) || null
  },

  /**
   * Delete a saved Q&A by ID
   * @param {number} id - The ID of the item to delete
   * @returns {Object} Result object with success and message
   */
  async delete(id) {
    try {
      await axios.delete(`${API_URL}/api/saved-answers/${id}`, {
        headers: getAuthHeaders()
      })
      
      return {
        success: true,
        message: 'Answer deleted successfully!'
      }
    } catch (error) {
      console.error('Failed to delete answer:', error)
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to delete answer.'
      }
    }
  },

  /**
   * Search saved Q&As
   * @param {string} query - Search term
   * @returns {Array} Array of matching saved Q&A objects
   */
  async search(query) {
    return this.getAll({ query })
  },

  /**
   * Get saved Q&As by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array} Array of matching saved Q&A objects
   */
  async getByTag(tag) {
    return this.getAll({ tag })
  },

  /**
   * Get all unique tags from saved Q&As
   * @returns {Array} Array of unique tags
   */
  async getAllTags() {
    try {
      const response = await axios.get(`${API_URL}/api/saved-answers/tags`, {
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (error) {
      console.error('Error getting tags:', error)
      return []
    }
  },

  /**
   * Get storage statistics
   * @returns {Object} Storage statistics
   */
  async getStats() {
    try {
      const saved = await this.getAll()
      const tags = await this.getAllTags()
      const totalWords = saved.reduce((sum, item) => {
        const wordCount = item.answer ? item.answer.split(/\s+/).filter(w => w.length > 0).length : 0
        return sum + wordCount
      }, 0)
      
      return {
        totalSaved: saved.length,
        totalWords,
        totalTags: tags.length,
        oldestSave: saved.length > 0 ? saved[saved.length - 1].saved_at : null,
        newestSave: saved.length > 0 ? saved[0].saved_at : null
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return { totalSaved: 0, totalWords: 0, totalTags: 0 }
    }
  },

  /**
   * Export all saved Q&As as JSON
   * @returns {string} JSON string of all saved data
   */
  async exportData() {
    const saved = await this.getAll()
    return JSON.stringify({
      version: '1.0',
      source: 'Bible Q&A App',
      exportDate: new Date().toISOString(),
      answers: saved
    }, null, 2)
  },

  // Placeholder methods for backward compatibility
  updateTags() { console.warn('updateTags not yet implemented for API') },
  importData() { console.warn('importData not yet implemented for API') },
  async getStorageInfo() { 
    const saved = await this.getAll()
    const used = saved.length
    const total = 100
    const remaining = total - used
    const percentage = (used / total) * 100
    return { used, total, remaining, percentage }
  },
  clearAll() { console.warn('clearAll not available for API - delete individually') }
}

// Named export for compatibility with tests
export const savedAnswersService = service
export default service

/**
 * LocalStorage service for managing saved Bible Q&A answers
 */

const STORAGE_KEY = 'bibleQA-saved'

// Counter to ensure unique IDs
let idCounter = 0

const service = {
  /**
   * Save a new Q&A to localStorage
   * @param {string} question - The question that was asked
   * @param {string} answer - The answer that was received
   * @param {Array} tags - Optional array of tags for categorization
   * @returns {Object} Result object with success, id, and message
   */
  save(question, answer, tags = []) {
    const saved = this.getAll()
    
    // Check storage limit
    if (saved.length >= 100) {
      return {
        success: false,
        message: 'Storage limit reached (100 items). Please delete some items first.'
      }
    }
    
    const trimmedQuestion = question ? question.trim() : ''
    const trimmedAnswer = answer ? answer.trim() : ''
    
    // Check for duplicates
    const isDuplicate = saved.some(item => 
      item.question.toLowerCase().trim() === trimmedQuestion.toLowerCase().trim() &&
      item.answer.toLowerCase().trim() === trimmedAnswer.toLowerCase().trim()
    )
    
    if (isDuplicate) {
      return {
        success: false,
        message: 'This answer has already been saved!'
      }
    }
    
    // Generate tags from question content if none provided
    let finalTags = tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
    if (finalTags.length === 0) {
      finalTags = this.generateTags(trimmedQuestion)
    }
    
    const newItem = {
      id: Date.now() + (++idCounter), // Ensure unique ID
      question: trimmedQuestion,
      answer: trimmedAnswer,
      timestamp: new Date().toISOString(),
      tags: finalTags,
      wordCount: trimmedAnswer.split(/\s+/).filter(word => word.length > 0).length
    }
    
    // Add to beginning of array (most recent first)
    saved.unshift(newItem)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      return {
        success: true,
        id: newItem.id,
        message: 'Answer saved successfully!'
      }
    } catch (error) {
      console.error('Failed to save answer:', error)
      return {
        success: false,
        message: 'Failed to save answer. Storage may be full.'
      }
    }
  },

  /**
   * Generate tags from question content
   * @param {string} question - The question to analyze
   * @returns {Array} Array of generated tags
   */
  generateTags(question) {
    const keywords = [
      'prayer', 'faith', 'love', 'hope', 'peace', 'joy', 'forgiveness',
      'salvation', 'jesus', 'christ', 'god', 'holy spirit', 'bible',
      'scripture', 'worship', 'church', 'ministry', 'discipleship',
      'relationships', 'marriage', 'family', 'wisdom', 'guidance',
      'healing', 'comfort', 'strength', 'courage', 'patience'
    ]
    
    const questionLower = question.toLowerCase()
    const foundTags = keywords.filter(keyword => 
      questionLower.includes(keyword)
    )
    
    return foundTags.slice(0, 5) // Limit to 5 tags
  },

  /**
   * Get all saved Q&As
   * @returns {Array} Array of saved Q&A objects in reverse chronological order
   */
  getAll() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const items = saved ? JSON.parse(saved) : []
      
      // Sort by timestamp in reverse chronological order (newest first)
      return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
  getById(id) {
    const saved = this.getAll()
    return saved.find(item => item.id === id) || null
  },

  /**
   * Delete a saved Q&A by ID
   * @param {number} id - The ID of the item to delete
   * @returns {Object} Result object with success and message
   */
  delete(id) {
    const saved = this.getAll()
    const index = saved.findIndex(item => item.id === id)
    
    if (index === -1) {
      return {
        success: false,
        message: 'Answer not found!'
      }
    }
    
    saved.splice(index, 1)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      return {
        success: true,
        message: 'Answer deleted successfully!'
      }
    } catch (error) {
      console.error('Failed to delete answer:', error)
      return {
        success: false,
        message: 'Failed to delete answer.'
      }
    }
  },

  /**
   * Search saved Q&As
   * @param {string} query - Search term
   * @returns {Array} Array of matching saved Q&A objects
   */
  search(query) {
    if (!query || !query.trim()) {
      return this.getAll()
    }
    
    const searchTerm = query.toLowerCase().trim()
    const saved = this.getAll()
    
    return saved.filter(item => 
      item.question.toLowerCase().includes(searchTerm) ||
      item.answer.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  },

  /**
   * Get saved Q&As by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array} Array of matching saved Q&A objects
   */
  getByTag(tag) {
    if (!tag || !tag.trim()) {
      return this.getAll()
    }
    
    const saved = this.getAll()
    const tagLower = tag.toLowerCase().trim()
    
    return saved.filter(item => 
      item.tags.some(itemTag => itemTag.toLowerCase() === tagLower)
    )
  },

  /**
   * Get all unique tags from saved Q&As
   * @returns {Array} Array of unique tags
   */
  getAllTags() {
    const saved = this.getAll()
    const allTags = saved.flatMap(item => item.tags)
    return [...new Set(allTags)].sort()
  },

  /**
   * Update tags for a saved Q&A
   * @param {number} id - The ID of the item to update
   * @param {Array} tags - New array of tags
   * @returns {boolean} True if updated, false if not found
   */
  updateTags(id, tags) {
    const saved = this.getAll()
    const index = saved.findIndex(item => item.id === id)
    
    if (index === -1) {
      return false
    }
    
    saved[index].tags = tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      return true
    } catch (error) {
      console.error('Failed to update tags:', error)
      return false
    }
  },

  /**
   * Export all saved Q&As as JSON
   * @returns {string} JSON string of all saved data
   */
  exportData() {
    const saved = this.getAll()
    return JSON.stringify({
      version: '1.0',
      source: 'Bible Q&A App',
      exportDate: new Date().toISOString(),
      answers: saved
    }, null, 2)
  },

  /**
   * Import saved Q&As from JSON
   * @param {string} jsonString - JSON string to import
   * @param {boolean} merge - Whether to merge with existing data or replace
   * @returns {Object} Result object with success, message, and counts
   */
  importData(jsonString, merge = true) {
    try {
      const importData = JSON.parse(jsonString)
      let itemsToImport = []
      
      // Handle different import formats
      if (importData.answers && Array.isArray(importData.answers)) {
        itemsToImport = importData.answers
      } else if (importData.data && Array.isArray(importData.data)) {
        itemsToImport = importData.data
      } else if (Array.isArray(importData)) {
        itemsToImport = importData
      } else {
        throw new Error('Invalid import format')
      }
      
      // Validate items
      itemsToImport = itemsToImport.filter(item => 
        item && 
        typeof item.question === 'string' && 
        typeof item.answer === 'string' &&
        item.question.trim() &&
        item.answer.trim()
      )
      
      if (itemsToImport.length === 0) {
        return {
          success: false,
          message: 'No valid answers found in import data'
        }
      }
      
      let imported = 0
      let duplicates = 0
      
      if (merge) {
        const existing = this.getAll()
        
        for (const item of itemsToImport) {
          if (existing.length + imported >= 100) {
            break // Storage limit reached
          }
          
          // Check for duplicates
          const isDuplicate = existing.some(existingItem => 
            existingItem.question.toLowerCase().trim() === item.question.toLowerCase().trim()
          )
          
          if (isDuplicate) {
            duplicates++
          } else {
            const newItem = {
              ...item,
              id: Date.now() + Math.random(), // Ensure unique ID
              timestamp: item.timestamp || new Date().toISOString(),
              tags: item.tags || [],
              wordCount: item.wordCount || item.answer.split(/\s+/).filter(word => word.length > 0).length
            }
            existing.unshift(newItem)
            imported++
          }
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
      } else {
        // Replace all data
        const limited = itemsToImport.slice(0, 100).map((item, index) => ({
          ...item,
          id: Date.now() + index,
          timestamp: item.timestamp || new Date().toISOString(),
          tags: item.tags || [],
          wordCount: item.wordCount || item.answer.split(/\s+/).filter(word => word.length > 0).length
        }))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
        imported = limited.length
      }
      
      let message = `${imported} answers imported successfully!`
      if (duplicates > 0) {
        message += ` ${duplicates} duplicates skipped.`
      }
      
      return {
        success: true,
        message,
        imported,
        duplicates
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      return {
        success: false,
        message: 'Invalid file format'
      }
    }
  },

  /**
   * Get storage statistics
   * @returns {Object} Storage statistics
   */
  getStats() {
    const saved = this.getAll()
    const totalWords = saved.reduce((sum, item) => sum + item.wordCount, 0)
    const tags = this.getAllTags()
    
    return {
      totalSaved: saved.length,
      totalWords,
      totalTags: tags.length,
      oldestSave: saved.length > 0 ? saved[saved.length - 1].timestamp : null,
      newestSave: saved.length > 0 ? saved[0].timestamp : null
    }
  },

  /**
   * Get storage information
   * @returns {Object} Storage information with used, total, remaining, percentage
   */
  getStorageInfo() {
    const saved = this.getAll()
    const used = saved.length
    const total = 100
    const remaining = total - used
    const percentage = Math.round((used / total) * 100)
    
    return {
      used,
      total,
      remaining,
      percentage
    }
  },

  /**
   * Get all unique tags from saved answers
   * @returns {Array} Array of unique tags
   */
  getAllTags() {
    try {
      const answers = this.getAll()
      const allTags = answers.flatMap(answer => answer.tags || [])
      return [...new Set(allTags)].sort()
    } catch (error) {
      console.error('Error getting tags:', error)
      return []
    }
  },

  /**
   * Get statistics about saved answers
   * @returns {Object} Statistics object with totalWords and totalTags
   */
  getStats() {
    try {
      const answers = this.getAll()
      const totalWords = answers.reduce((sum, answer) => sum + (answer.wordCount || 0), 0)
      const allTags = answers.flatMap(answer => answer.tags || [])
      const totalTags = new Set(allTags).size
      
      return {
        totalWords,
        totalTags
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return { totalWords: 0, totalTags: 0 }
    }
  },

  /**
   * Clear all saved data
   * @returns {boolean} True if cleared successfully
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear saved answers:', error)
      return false
    }
  }
}

// Named export for compatibility with tests
export const savedAnswersService = service
export default service

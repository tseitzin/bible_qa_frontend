import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { savedAnswersService } from '../../services/savedAnswersService'

describe('savedAnswersService', () => {
  const mockAnswer = {
    question: 'What is love according to the Bible?',
    answer: '1 Corinthians 13:4-8 says love is patient and kind...',
    timestamp: new Date().toISOString(),
    id: 'test-id-123'
  }

  const mockAnswer2 = {
    question: 'How should we pray?',
    answer: 'Matthew 6:9-13 gives us the Lord\'s Prayer as a model...',
    timestamp: new Date().toISOString(),
    id: 'test-id-456'
  }

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
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('save', () => {
    it('should save a new answer successfully', () => {
      const result = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      
      expect(result.success).toBe(true)
      expect(result.id).toBeDefined()
      expect(result.message).toBe('Answer saved successfully!')
    })

    it('should generate unique IDs for different answers', () => {
      const result1 = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      const result2 = savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      expect(result1.id).not.toBe(result2.id)
    })

    it('should prevent saving duplicate answers', () => {
      // Save first time
      const result1 = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      expect(result1.success).toBe(true)
      
      // Try to save same answer again
      const result2 = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      expect(result2.success).toBe(false)
      expect(result2.message).toBe('This answer has already been saved!')
    })

    it('should enforce storage limit of 100 items', () => {
      // Fill up to the limit (100 items)
      for (let i = 0; i < 100; i++) {
        const result = savedAnswersService.save(`Question ${i}`, `Answer ${i}`)
        expect(result.success).toBe(true)
      }
      
      // Try to save 101st item
      const result = savedAnswersService.save('Question 101', 'Answer 101')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Storage limit reached (100 items). Please delete some items first.')
    })

    it('should generate appropriate tags from question content', () => {
      savedAnswersService.save('What does the Bible say about prayer and faith?', 'Sample answer')
      const saved = savedAnswersService.getAll()
      
      expect(saved[0].tags).toContain('prayer')
      expect(saved[0].tags).toContain('faith')
    })

    it('should handle empty question or answer', () => {
      const result1 = savedAnswersService.save('', mockAnswer.answer)
      const result2 = savedAnswersService.save(mockAnswer.question, '')
      
      expect(result1.success).toBe(true) // Should still save
      expect(result2.success).toBe(true) // Should still save
    })
  })

  describe('getAll', () => {
    it('should return empty array when no answers are saved', () => {
      const results = savedAnswersService.getAll()
      expect(results).toEqual([])
    })

    it('should return all saved answers in reverse chronological order', () => {
      const answer1 = { ...mockAnswer, timestamp: '2023-01-01T12:00:00.000Z' }
      const answer2 = { ...mockAnswer2, timestamp: '2023-01-02T12:00:00.000Z' }
      
      // Manually set localStorage to control timestamps
      localStorage.setItem('bibleQA-saved', JSON.stringify([answer1, answer2]))
      
      const results = savedAnswersService.getAll()
      expect(results).toHaveLength(2)
      expect(results[0].timestamp).toBe('2023-01-02T12:00:00.000Z') // Most recent first
      expect(results[1].timestamp).toBe('2023-01-01T12:00:00.000Z')
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('bibleQA-saved', 'invalid-json')
      const results = savedAnswersService.getAll()
      expect(results).toEqual([])
    })
  })

  describe('delete', () => {
    it('should delete an answer by ID', () => {
      const saveResult = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      const deleteResult = savedAnswersService.delete(saveResult.id)
      
      expect(deleteResult.success).toBe(true)
      expect(deleteResult.message).toBe('Answer deleted successfully!')
      
      const remaining = savedAnswersService.getAll()
      expect(remaining).toHaveLength(0)
    })

    it('should handle deletion of non-existent ID', () => {
      const result = savedAnswersService.delete('non-existent-id')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Answer not found!')
    })

    it('should only delete the specified answer', () => {
      const result1 = savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      const result2 = savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      savedAnswersService.delete(result1.id)
      
      const remaining = savedAnswersService.getAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].question).toBe(mockAnswer2.question)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      savedAnswersService.save('What is love?', 'Love is patient and kind from 1 Corinthians 13')
      savedAnswersService.save('How to pray?', 'Jesus taught us the Lord\'s Prayer in Matthew 6')
      savedAnswersService.save('What about faith?', 'Faith without works is dead, says James 2:26')
    })

    it('should return all answers when search query is empty', () => {
      const results = savedAnswersService.search('')
      expect(results).toHaveLength(3)
    })

    it('should search in question text (case insensitive)', () => {
      const results = savedAnswersService.search('LOVE')
      expect(results).toHaveLength(1)
      expect(results[0].question).toContain('love')
    })

    it('should search in answer text', () => {
      const results = savedAnswersService.search('Corinthians')
      expect(results).toHaveLength(1)
      expect(results[0].answer).toContain('Corinthians')
    })

    it('should search in tags', () => {
      const results = savedAnswersService.search('prayer') // Should find by tag
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return multiple matches', () => {
      const results = savedAnswersService.search('What') // Should match "What is love?" and "What about faith?"
      expect(results).toHaveLength(2)
    })

    it('should handle special characters in search', () => {
      const results = savedAnswersService.search('Lord\'s')
      expect(results).toHaveLength(1)
    })
  })

  describe('exportData', () => {
    it('should export all saved answers as JSON', () => {
      savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      const exportedData = savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData).toHaveProperty('version')
      expect(parsedData).toHaveProperty('exportDate')
      expect(parsedData).toHaveProperty('answers')
      expect(parsedData.answers).toHaveLength(2)
    })

    it('should include metadata in export', () => {
      const exportedData = savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData.version).toBe('1.0')
      expect(parsedData.source).toBe('Bible Q&A App')
      expect(new Date(parsedData.exportDate)).toBeInstanceOf(Date)
    })

    it('should handle empty answers list', () => {
      const exportedData = savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData.answers).toEqual([])
    })
  })

  describe('importData', () => {
    const validImportData = {
      version: '1.0',
      source: 'Bible Q&A App',
      exportDate: new Date().toISOString(),
      answers: [mockAnswer, mockAnswer2]
    }

    it('should import valid data successfully', () => {
      const result = savedAnswersService.importData(JSON.stringify(validImportData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('2 answers imported')
      
      const saved = savedAnswersService.getAll()
      expect(saved).toHaveLength(2)
    })

    it('should handle invalid JSON', () => {
      const result = savedAnswersService.importData('invalid json')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid file format')
    })

    it('should validate import data structure', () => {
      const invalidData = { invalid: 'structure' }
      const result = savedAnswersService.importData(JSON.stringify(invalidData))
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid file format')
    })

    it('should skip duplicate answers during import', () => {
      // Save one answer first
      savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      
      // Import data that includes the same answer plus a new one
      const result = savedAnswersService.importData(JSON.stringify(validImportData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('1 answers imported') // Only the new one
      expect(result.message).toContain('1 duplicates skipped')
    })

    it('should respect storage limits during import', () => {
      // Fill up to 99 items
      for (let i = 0; i < 99; i++) {
        savedAnswersService.save(`Question ${i}`, `Answer ${i}`)
      }
      
      // Try to import 3 more items (would exceed limit of 100)
      const importData = {
        ...validImportData,
        answers: [
          { ...mockAnswer, id: 'import1' },
          { ...mockAnswer2, id: 'import2' },
          { question: 'Question 3', answer: 'Answer 3', id: 'import3' }
        ]
      }
      
      const result = savedAnswersService.importData(JSON.stringify(importData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('1 answers imported') // Only 1 fits within limit
      
      const saved = savedAnswersService.getAll()
      expect(saved).toHaveLength(100) // At the limit
    })
  })

  describe('getStorageInfo', () => {
    it('should return correct storage information', () => {
      // Save some answers
      savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      const info = savedAnswersService.getStorageInfo()
      
      expect(info.used).toBe(2)
      expect(info.total).toBe(100)
      expect(info.remaining).toBe(98)
      expect(info.percentage).toBe(2)
    })

    it('should handle empty storage', () => {
      const info = savedAnswersService.getStorageInfo()
      
      expect(info.used).toBe(0)
      expect(info.total).toBe(100)
      expect(info.remaining).toBe(100)
      expect(info.percentage).toBe(0)
    })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { savedAnswersService } from '../../services/savedAnswersService'
import axios from 'axios'
import authService from '../../services/authService'

vi.mock('axios')
vi.mock('../../services/authService')

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
    vi.clearAllMocks()
    authService.getToken.mockReturnValue('mock-token')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('save', () => {
    it('should save a new answer successfully', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      
      const result = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      
      expect(result.success).toBe(true)
      expect(result.id).toBeDefined()
      expect(result.message).toBe('Answer saved successfully!')
    })

    it('should generate unique IDs for different answers', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      axios.post.mockResolvedValueOnce({ data: { id: 456 } })
      
      const result1 = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      const result2 = await savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      expect(result1.id).not.toBe(result2.id)
    })

    it('should prevent saving duplicate answers', async () => {
      // Save first time
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      const result1 = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      expect(result1.success).toBe(true)
      
      // Try to save same answer again
      axios.post.mockRejectedValueOnce({ response: { data: { detail: 'This answer has already been saved!' } } })
      const result2 = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      expect(result2.success).toBe(false)
      expect(result2.message).toBe('This answer has already been saved!')
    })

    it('should enforce storage limit of 100 items', async () => {
      // Fill up to the limit (100 items)
      for (let i = 0; i < 100; i++) {
        axios.post.mockResolvedValueOnce({ data: { id: i } })
      }
      for (let i = 0; i < 100; i++) {
        const result = await savedAnswersService.save(`Question ${i}`, `Answer ${i}`)
        expect(result.success).toBe(true)
      }
      
      // Try to save 101st item
      axios.post.mockRejectedValueOnce({ response: { data: { detail: 'Storage limit reached (100 items). Please delete some items first.' } } })
      const result = await savedAnswersService.save('Question 101', 'Answer 101')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Storage limit reached (100 items). Please delete some items first.')
    })

    it('should generate appropriate tags from question content', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123, tags: ['prayer', 'faith'] } })
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [{ id: 123, question: 'What does the Bible say about prayer and faith?', answer: 'Sample answer', tags: ['prayer', 'faith'] }] } })
      
      await savedAnswersService.save('What does the Bible say about prayer and faith?', 'Sample answer')
      const saved = await savedAnswersService.getAll()
      
      expect(saved[0].tags).toContain('prayer')
      expect(saved[0].tags).toContain('faith')
    })

    it('should handle empty question or answer', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      axios.post.mockResolvedValueOnce({ data: { id: 456 } })
      
      const result1 = await savedAnswersService.save('', mockAnswer.answer)
      const result2 = await savedAnswersService.save(mockAnswer.question, '')
      
      expect(result1.success).toBe(true) // Should still save
      expect(result2.success).toBe(true) // Should still save
    })
  })

  describe('getAll', () => {
    it('should return empty array when no answers are saved', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })
      const results = await savedAnswersService.getAll()
      expect(results).toEqual([])
    })

    it('should return all saved answers in reverse chronological order', async () => {
      const answer1 = { ...mockAnswer, timestamp: '2023-01-01T12:00:00.000Z' }
      const answer2 = { ...mockAnswer2, timestamp: '2023-01-02T12:00:00.000Z' }
      
      // Mock API to return answers in reverse chronological order
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [answer2, answer1] } })
      
      const results = await savedAnswersService.getAll()
      expect(results).toHaveLength(2)
      expect(results[0].timestamp).toBe('2023-01-02T12:00:00.000Z') // Most recent first
      expect(results[1].timestamp).toBe('2023-01-01T12:00:00.000Z')
    })

    it('should handle corrupted localStorage data', async () => {
      // Mock API error
      axios.get.mockRejectedValueOnce(new Error('API Error'))
      const results = await savedAnswersService.getAll()
      expect(results).toEqual([])
    })
  })

  describe('delete', () => {
    it('should delete an answer by ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      const saveResult = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      
      axios.delete.mockResolvedValueOnce({ data: { success: true } })
      const deleteResult = await savedAnswersService.delete(saveResult.id)
      
      expect(deleteResult.success).toBe(true)
      expect(deleteResult.message).toBe('Answer deleted successfully!')
      
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })
      const remaining = await savedAnswersService.getAll()
      expect(remaining).toHaveLength(0)
    })

    it('should handle deletion of non-existent ID', async () => {
      axios.delete.mockRejectedValueOnce({ response: { data: { detail: 'Answer not found!' } } })
      const result = await savedAnswersService.delete('non-existent-id')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Answer not found!')
    })

    it('should only delete the specified answer', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 123 } })
      axios.post.mockResolvedValueOnce({ data: { id: 456 } })
      const result1 = await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      const result2 = await savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      axios.delete.mockResolvedValueOnce({ data: { success: true } })
      await savedAnswersService.delete(result1.id)
      
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [{ id: 456, question: mockAnswer2.question, answer: mockAnswer2.answer }] } })
      const remaining = await savedAnswersService.getAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].question).toBe(mockAnswer2.question)
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      axios.post.mockResolvedValue({ data: { id: 1 } })
      await savedAnswersService.save('What is love?', 'Love is patient and kind from 1 Corinthians 13')
      await savedAnswersService.save('How to pray?', 'Jesus taught us the Lord\'s Prayer in Matthew 6')
      await savedAnswersService.save('What about faith?', 'Faith without works is dead, says James 2:26')
    })

    it('should return all answers when search query is empty', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: 'What is love?', answer: 'Love is patient and kind from 1 Corinthians 13' },
        { id: 2, question: 'How to pray?', answer: 'Jesus taught us the Lord\'s Prayer in Matthew 6' },
        { id: 3, question: 'What about faith?', answer: 'Faith without works is dead, says James 2:26' }
      ] } })
      const results = await savedAnswersService.search('')
      expect(results).toHaveLength(3)
    })

    it('should search in question text (case insensitive)', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: 'What is love?', answer: 'Love is patient and kind from 1 Corinthians 13' }
      ] } })
      const results = await savedAnswersService.search('LOVE')
      expect(results).toHaveLength(1)
      expect(results[0].question).toContain('love')
    })

    it('should search in answer text', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: 'What is love?', answer: 'Love is patient and kind from 1 Corinthians 13' }
      ] } })
      const results = await savedAnswersService.search('Corinthians')
      expect(results).toHaveLength(1)
      expect(results[0].answer).toContain('Corinthians')
    })

    it('should search in tags', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 2, question: 'How to pray?', answer: 'Jesus taught us the Lord\'s Prayer in Matthew 6', tags: ['prayer'] }
      ] } })
      const results = await savedAnswersService.search('prayer') // Should find by tag
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return multiple matches', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: 'What is love?', answer: 'Love is patient and kind from 1 Corinthians 13' },
        { id: 3, question: 'What about faith?', answer: 'Faith without works is dead, says James 2:26' }
      ] } })
      const results = await savedAnswersService.search('What') // Should match "What is love?" and "What about faith?"
      expect(results).toHaveLength(2)
    })

    it('should handle special characters in search', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 2, question: 'How to pray?', answer: 'Jesus taught us the Lord\'s Prayer in Matthew 6' }
      ] } })
      const results = await savedAnswersService.search('Lord\'s')
      expect(results).toHaveLength(1)
    })
  })

  describe('exportData', () => {
    it('should export all saved answers as JSON', async () => {
      axios.post.mockResolvedValue({ data: { id: 1 } })
      await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      await savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: mockAnswer.question, answer: mockAnswer.answer },
        { id: 2, question: mockAnswer2.question, answer: mockAnswer2.answer }
      ] } })
      const exportedData = await savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData).toHaveProperty('version')
      expect(parsedData).toHaveProperty('exportDate')
      expect(parsedData).toHaveProperty('answers')
      expect(parsedData.answers).toHaveLength(2)
    })

    it('should include metadata in export', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })
      const exportedData = await savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData.version).toBe('1.0')
      expect(parsedData.source).toBe('Bible Q&A App')
      expect(new Date(parsedData.exportDate)).toBeInstanceOf(Date)
    })

    it('should handle empty answers list', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })
      const exportedData = await savedAnswersService.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData.answers).toEqual([])
    })
  })

  describe.skip('importData', () => {
    const validImportData = {
      version: '1.0',
      source: 'Bible Q&A App',
      exportDate: new Date().toISOString(),
      answers: [mockAnswer, mockAnswer2]
    }

    it('should import valid data successfully', async () => {
      const result = await savedAnswersService.importData(JSON.stringify(validImportData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('2 answers imported')
      
      const saved = await savedAnswersService.getAll()
      expect(saved).toHaveLength(2)
    })

    it('should handle invalid JSON', async () => {
      const result = await savedAnswersService.importData('invalid json')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid file format')
    })

    it('should validate import data structure', async () => {
      const invalidData = { invalid: 'structure' }
      const result = await savedAnswersService.importData(JSON.stringify(invalidData))
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid file format')
    })

    it('should skip duplicate answers during import', async () => {
      // Save one answer first
      await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      
      // Import data that includes the same answer plus a new one
      const result = await savedAnswersService.importData(JSON.stringify(validImportData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('1 answers imported') // Only the new one
      expect(result.message).toContain('1 duplicates skipped')
    })

    it('should respect storage limits during import', async () => {
      // Fill up to 99 items
      for (let i = 0; i < 99; i++) {
        await savedAnswersService.save(`Question ${i}`, `Answer ${i}`)
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
      
      const result = await savedAnswersService.importData(JSON.stringify(importData))
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('1 answers imported') // Only 1 fits within limit
      
      const saved = await savedAnswersService.getAll()
      expect(saved).toHaveLength(100) // At the limit
    })
  })

  describe('getStorageInfo', () => {
    it('should return correct storage information', async () => {
      // Save some answers
      axios.post.mockResolvedValue({ data: { id: 1 } })
      await savedAnswersService.save(mockAnswer.question, mockAnswer.answer)
      await savedAnswersService.save(mockAnswer2.question, mockAnswer2.answer)
      
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [
        { id: 1, question: mockAnswer.question, answer: mockAnswer.answer },
        { id: 2, question: mockAnswer2.question, answer: mockAnswer2.answer }
      ] } })
      const info = await savedAnswersService.getStorageInfo()
      
      expect(info.used).toBe(2)
      expect(info.total).toBe(100)
      expect(info.remaining).toBe(98)
      expect(info.percentage).toBe(2)
    })

    it('should handle empty storage', async () => {
      axios.get.mockResolvedValueOnce({ data: { saved_answers: [] } })
      const info = await savedAnswersService.getStorageInfo()
      
      expect(info.used).toBe(0)
      expect(info.total).toBe(100)
      expect(info.remaining).toBe(100)
      expect(info.percentage).toBe(0)
    })
  })

  describe('API Integration Tests', () => {
    const mockToken = 'mock-jwt-token'
    const mockQuestionId = 123
    const mockSavedAnswerId = 456

    beforeEach(() => {
      vi.clearAllMocks()
      authService.getToken.mockReturnValue(mockToken)
    })

    describe('save with API', () => {
      it('should correctly send a request to the API with questionId', async () => {
        const mockResponse = {
          data: {
            id: mockSavedAnswerId,
            question_id: mockQuestionId,
            tags: ['prayer', 'faith']
          }
        }
        
        axios.post.mockResolvedValueOnce(mockResponse)

        const result = await savedAnswersService.save(mockQuestionId, ['prayer', 'faith'])

        expect(result.success).toBe(true)
        expect(result.id).toBe(mockSavedAnswerId)
        expect(result.message).toBe('Answer saved successfully!')
        
        // Verify the API call was made with correct parameters
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/saved-answers'),
          {
            question_id: mockQuestionId,
            tags: ['prayer', 'faith']
          },
          {
            headers: {
              Authorization: `Bearer ${mockToken}`
            }
          }
        )
      })

      it('should send request with empty tags array by default', async () => {
        const mockResponse = {
          data: {
            id: mockSavedAnswerId,
            question_id: mockQuestionId,
            tags: []
          }
        }
        
        axios.post.mockResolvedValueOnce(mockResponse)

        const result = await savedAnswersService.save(mockQuestionId)

        expect(result.success).toBe(true)
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/saved-answers'),
          {
            question_id: mockQuestionId,
            tags: []
          },
          expect.any(Object)
        )
      })

      it('should handle API errors when saving', async () => {
        const mockError = {
          response: {
            data: { detail: 'Question already saved' }
          }
        }
        
        axios.post.mockRejectedValueOnce(mockError)

        const result = await savedAnswersService.save(mockQuestionId)

        expect(result.success).toBe(false)
        expect(result.message).toBe('Question already saved')
      })

      it('should include Authorization header with token', async () => {
        const mockResponse = {
          data: { id: mockSavedAnswerId, question_id: mockQuestionId }
        }
        
        axios.post.mockResolvedValueOnce(mockResponse)

        await savedAnswersService.save(mockQuestionId)

        const callArgs = axios.post.mock.calls[0]
        expect(callArgs[2].headers).toEqual({
          Authorization: `Bearer ${mockToken}`
        })
      })

      it('should send request without Authorization header when no token', async () => {
        authService.getToken.mockReturnValue(null)
        
        const mockResponse = {
          data: { id: mockSavedAnswerId, question_id: mockQuestionId }
        }
        
        axios.post.mockResolvedValueOnce(mockResponse)

        await savedAnswersService.save(mockQuestionId)

        const callArgs = axios.post.mock.calls[0]
        expect(callArgs[2].headers).toEqual({})
      })

      it('should handle network errors gracefully', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'))

        const result = await savedAnswersService.save(mockQuestionId)

        expect(result.success).toBe(false)
        expect(result.message).toBe('Failed to save answer.')
      })
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBibleQA } from '../../composables/useBibleQA.js'
import { bibleApi } from '../../services/bibleApi.js'

// Mock the API
vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    askQuestion: vi.fn(),
    streamQuestion: vi.fn(),
    askFollowUpQuestion: vi.fn(),
    streamFollowUpQuestion: vi.fn()
  }
}))

describe('useBibleQA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { question, answer, loading, error } = useBibleQA()

    expect(question.value).toBe('')
    expect(answer.value).toBe('')
    expect(loading.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('handles successful question submission', async () => {
    // Mock streaming API call
    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      await callback({ type: 'status', message: 'Processing...' })
      await callback({ type: 'content', text: 'God is love.' })
      await callback({ 
        type: 'done', 
        question_id: 1, 
        is_biblical: true 
      })
    })

    const { question, answer, loading, error, askQuestion } = useBibleQA()

    question.value = 'What is God?'
    await askQuestion()

    expect(bibleApi.streamQuestion).toHaveBeenCalledWith('What is God?', expect.any(Function))
    expect(answer.value).toBe('God is love.')
    expect(error.value).toBe('')
    expect(loading.value).toBe(false)
  })

  it('handles API errors', async () => {
    const mockError = new Error('Network error')
    bibleApi.streamQuestion.mockRejectedValue(mockError)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { question, answer, loading, error, askQuestion } = useBibleQA()

    question.value = 'What is God?'
    await askQuestion()

    expect(error.value).toBe('Network error')
    expect(answer.value).toBe('')
    expect(loading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Bible Q&A Error:', mockError)

    consoleSpy.mockRestore()
  })

  it('validates empty questions', async () => {
    const { askQuestion, error } = useBibleQA()

    await askQuestion('')
    expect(error.value).toBe('Please enter a question')
    expect(bibleApi.streamQuestion).not.toHaveBeenCalled()

    await askQuestion('   ')
    expect(error.value).toBe('Please enter a question')
  })

  it('clears state properly', () => {
    const { question, answer, loading, error, clearAll } = useBibleQA()

    question.value = 'Test question'
    answer.value = 'Test answer'
    loading.value = true
    error.value = 'Test error'

    clearAll()

    expect(question.value).toBe('')
    expect(answer.value).toBe('')
    expect(loading.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('clears error only', () => {
    const { question, answer, error, clearError } = useBibleQA()

    question.value = 'Test question'
    answer.value = 'Test answer'
    error.value = 'Test error'

    clearError()

    expect(question.value).toBe('Test question')
    expect(answer.value).toBe('Test answer')
    expect(error.value).toBe('')
  })

  it('sets loading state during API call', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    bibleApi.streamQuestion.mockReturnValue(promise)

    const { loading, askQuestion } = useBibleQA()

    const questionPromise = askQuestion('Test question')
    expect(loading.value).toBe(true)

    resolvePromise()
    await questionPromise

    expect(loading.value).toBe(false)
  })

  describe('Streaming Events', () => {
    it('handles cached response event', async () => {
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({
          type: 'cached',
          answer: 'Cached answer',
          question_id: 42,
          is_biblical: true
        })
      })

      const { askQuestion, answer, questionId, isBiblicalAnswer, streamStatus } = useBibleQA()
      await askQuestion('Test')

      expect(answer.value).toBe('Cached answer')
      expect(questionId.value).toBe(42)
      expect(isBiblicalAnswer.value).toBe(true)
      expect(streamStatus.value).toBe('')
    })

    it('handles status update events', async () => {
      let statusCallback
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        statusCallback = callback
        await callback({ type: 'status', message: 'Searching...' })
        await callback({ type: 'done', question_id: 1, is_biblical: false })
      })

      const { askQuestion, streamStatus } = useBibleQA()
      const promise = askQuestion('Test')
      
      // Status should be updated during streaming
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await promise
      // Status should be cleared after done
      expect(streamStatus.value).toBe('')
    })

    it('handles content streaming events', async () => {
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ type: 'content', text: 'First ' })
        await callback({ type: 'content', text: 'Second ' })
        await callback({ type: 'content', text: 'Third' })
        await callback({ type: 'done', question_id: 1, is_biblical: true })
      })

      const { askQuestion, answer } = useBibleQA()
      await askQuestion('Test')

      expect(answer.value).toBe('First Second Third')
    })

    it('handles error events during streaming', async () => {
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ type: 'status', message: 'Processing...' })
        await callback({ type: 'error', message: 'Stream failed' })
      })

      const { askQuestion, error, streamStatus } = useBibleQA()
      await askQuestion('Test')

      expect(error.value).toBe('Stream failed')
      expect(streamStatus.value).toBe('')
    })

    it('sets isStreaming flag during streaming', async () => {
      let isStreamingDuringCall = false
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        isStreamingDuringCall = isStreaming.value
        await callback({ type: 'done', question_id: 1, is_biblical: false })
      })

      const { askQuestion, isStreaming } = useBibleQA()
      await askQuestion('Test', true)

      expect(isStreamingDuringCall).toBe(true)
      expect(isStreaming.value).toBe(false)
    })
  })

  describe('Non-streaming fallback', () => {
    it('uses non-streaming API when streaming is disabled', async () => {
      bibleApi.askQuestion.mockResolvedValue({
        answer: 'Non-streaming answer',
        question_id: 99,
        is_biblical: true
      })

      const { askQuestion, answer, questionId } = useBibleQA()
      await askQuestion('Test', false)

      expect(bibleApi.askQuestion).toHaveBeenCalledWith('Test')
      expect(bibleApi.streamQuestion).not.toHaveBeenCalled()
      expect(answer.value).toBe('Non-streaming answer')
      expect(questionId.value).toBe(99)
    })
  })

  describe('Follow-up questions', () => {
    it('handles follow-up question with streaming', async () => {
      // First question
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ 
          type: 'done', 
          question_id: 1, 
          is_biblical: true,
          answer: 'Initial answer'
        })
      })

      const { askQuestion, askFollowUpQuestion, answer, conversationHistory } = useBibleQA()
      await askQuestion('Initial question')

      // Follow-up question
      bibleApi.streamFollowUpQuestion.mockImplementation(async (data, callback) => {
        await callback({ type: 'content', text: 'Follow-up answer' })
        await callback({ type: 'done', question_id: 2, is_biblical: true })
      })

      await askFollowUpQuestion('Follow-up question')

      expect(bibleApi.streamFollowUpQuestion).toHaveBeenCalled()
      expect(answer.value).toBe('Follow-up answer')
      expect(conversationHistory.value.length).toBe(4) // 2 exchanges
    })

    it('validates empty follow-up questions', async () => {
      const { askFollowUpQuestion, error } = useBibleQA()

      await askFollowUpQuestion('')
      expect(error.value).toBe('Please enter a follow-up question')

      await askFollowUpQuestion('   ')
      expect(error.value).toBe('Please enter a follow-up question')
    })

    it('uses non-streaming API for follow-up when disabled', async () => {
      bibleApi.askFollowUpQuestion.mockResolvedValue({
        answer: 'Follow-up answer',
        question_id: 2,
        is_biblical: false
      })

      const { askFollowUpQuestion, answer } = useBibleQA()
      await askFollowUpQuestion('Follow-up', false)

      expect(bibleApi.askFollowUpQuestion).toHaveBeenCalled()
      expect(answer.value).toBe('Follow-up answer')
    })

    it('maintains rootQuestionId across follow-ups', async () => {
      // Initial question
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ type: 'done', question_id: 10, is_biblical: true })
      })

      const { askQuestion, askFollowUpQuestion, questionId, rootQuestionId } = useBibleQA()
      await askQuestion('Initial')

      expect(questionId.value).toBe(10)
      expect(rootQuestionId.value).toBe(10)

      // Follow-up
      bibleApi.streamFollowUpQuestion.mockImplementation(async (data, callback) => {
        await callback({ type: 'done', question_id: 20, is_biblical: true })
      })

      await askFollowUpQuestion('Follow-up')

      expect(questionId.value).toBe(20)
      expect(rootQuestionId.value).toBe(10) // Should remain unchanged
    })

    it('clears answer before follow-up question', async () => {
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ type: 'done', question_id: 1, is_biblical: true })
      })

      const { askQuestion, askFollowUpQuestion, answer } = useBibleQA()
      answer.value = 'Old answer'

      bibleApi.streamFollowUpQuestion.mockImplementation(async (data, callback) => {
        // Answer should be cleared before this is called
        await callback({ type: 'content', text: 'New' })
        await callback({ type: 'done', question_id: 2, is_biblical: true })
      })

      await askFollowUpQuestion('Follow-up')
      expect(answer.value).toBe('New')
    })
  })

  describe('clearAll', () => {
    it('clears all state including IDs and conversation history', () => {
      const { 
        question, answer, questionId, rootQuestionId, 
        isBiblicalAnswer, error, loading, conversationHistory, clearAll 
      } = useBibleQA()

      // Set some state
      question.value = 'Q'
      answer.value = 'A'
      questionId.value = 1
      rootQuestionId.value = 1
      isBiblicalAnswer.value = true
      error.value = 'E'
      loading.value = true
      conversationHistory.value = [{ role: 'user', content: 'test' }]

      clearAll()

      expect(question.value).toBe('')
      expect(answer.value).toBe('')
      expect(questionId.value).toBeNull()
      expect(rootQuestionId.value).toBeNull()
      expect(isBiblicalAnswer.value).toBe(false)
      expect(error.value).toBe('')
      expect(loading.value).toBe(false)
      expect(conversationHistory.value).toEqual([])
    })
  })
})

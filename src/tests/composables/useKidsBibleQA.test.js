import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKidsBibleQA } from '../../composables/useKidsBibleQA.js'
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

describe('useKidsBibleQA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const {
      question, answer, questionId, rootQuestionId,
      isBiblicalAnswer, loading, error, conversationHistory,
      streamStatus, isStreaming
    } = useKidsBibleQA()

    expect(question.value).toBe('')
    expect(answer.value).toBe('')
    expect(questionId.value).toBeNull()
    expect(rootQuestionId.value).toBeNull()
    expect(isBiblicalAnswer.value).toBe(false)
    expect(loading.value).toBe(false)
    expect(error.value).toBe('')
    expect(conversationHistory.value).toEqual([])
    expect(streamStatus.value).toBe('')
    expect(isStreaming.value).toBe(false)
  })

  it('validates empty questions', async () => {
    const { askQuestion, error } = useKidsBibleQA()

    await askQuestion('')
    expect(error.value).toContain('Please type a question first')
    expect(bibleApi.streamQuestion).not.toHaveBeenCalled()

    await askQuestion('   ')
    expect(error.value).toContain('Please type a question first')
  })

  it('validates null/undefined questions', async () => {
    const { askQuestion, error } = useKidsBibleQA()

    await askQuestion(null)
    expect(error.value).toContain('Please type a question first')
    expect(bibleApi.streamQuestion).not.toHaveBeenCalled()
  })

  it('handles successful streaming question', async () => {
    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      await callback({ type: 'status', message: 'Searching the Bible...' })
      await callback({ type: 'content', text: 'Jesus loves ' })
      await callback({ type: 'content', text: 'the little children.' })
      await callback({
        type: 'done',
        question_id: 5,
        is_biblical: true
      })
    })

    const { askQuestion, answer, questionId, rootQuestionId, isBiblicalAnswer, loading, conversationHistory } = useKidsBibleQA()
    await askQuestion('Who does Jesus love?')

    expect(bibleApi.streamQuestion).toHaveBeenCalledWith('Who does Jesus love?', expect.any(Function))
    expect(answer.value).toBe('Jesus loves the little children.')
    expect(questionId.value).toBe(5)
    expect(rootQuestionId.value).toBe(5)
    expect(isBiblicalAnswer.value).toBe(true)
    expect(loading.value).toBe(false)
    expect(conversationHistory.value).toHaveLength(2)
    expect(conversationHistory.value[0]).toEqual({ role: 'user', content: 'Who does Jesus love?' })
  })

  it('handles cached response event', async () => {
    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      await callback({
        type: 'cached',
        answer: 'Cached kids answer',
        question_id: 10,
        is_biblical: true
      })
    })

    const { askQuestion, answer, questionId, isBiblicalAnswer, conversationHistory } = useKidsBibleQA()
    await askQuestion('What is prayer?')

    expect(answer.value).toBe('Cached kids answer')
    expect(questionId.value).toBe(10)
    expect(isBiblicalAnswer.value).toBe(true)
    expect(conversationHistory.value).toHaveLength(2)
  })

  it('handles error event during streaming', async () => {
    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      await callback({ type: 'error', message: 'Stream error occurred' })
    })

    const { askQuestion, error, streamStatus } = useKidsBibleQA()
    await askQuestion('Test question')

    // Should get a kid-friendly error
    expect(error.value).toContain('Oops!')
    expect(streamStatus.value).toBe('')
  })

  it('handles API exception with kid-friendly error', async () => {
    bibleApi.streamQuestion.mockRejectedValue(new Error('Network timeout'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { askQuestion, error, loading } = useKidsBibleQA()
    await askQuestion('Test question')

    expect(error.value).toContain('internet')
    expect(loading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Kids Bible Q&A Error:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('uses non-streaming API when streaming is disabled', async () => {
    bibleApi.askQuestion.mockResolvedValue({
      answer: 'Non-streaming answer',
      question_id: 99,
      is_biblical: false
    })

    const { askQuestion, answer, questionId, isBiblicalAnswer, conversationHistory } = useKidsBibleQA()
    await askQuestion('Test', false)

    expect(bibleApi.askQuestion).toHaveBeenCalledWith('Test')
    expect(bibleApi.streamQuestion).not.toHaveBeenCalled()
    expect(answer.value).toBe('Non-streaming answer')
    expect(questionId.value).toBe(99)
    expect(isBiblicalAnswer.value).toBe(false)
    expect(conversationHistory.value).toHaveLength(2)
  })

  it('sets loading and isStreaming states during streaming call', async () => {
    let loadingDuringCall = false
    let isStreamingDuringCall = false

    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      loadingDuringCall = loading.value
      isStreamingDuringCall = isStreaming.value
      await callback({ type: 'done', question_id: 1, is_biblical: false })
    })

    const { askQuestion, loading, isStreaming } = useKidsBibleQA()
    await askQuestion('Test', true)

    expect(loadingDuringCall).toBe(true)
    expect(isStreamingDuringCall).toBe(true)
    expect(loading.value).toBe(false)
    expect(isStreaming.value).toBe(false)
  })

  it('converts status messages to kid-friendly versions', async () => {
    const capturedStatuses = []

    bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
      await callback({ type: 'status', message: 'Searching Bible...' })
      capturedStatuses.push(streamStatus.value)
      await callback({ type: 'status', message: 'Thinking about answer...' })
      capturedStatuses.push(streamStatus.value)
      await callback({ type: 'status', message: 'Finding Bible verses...' })
      capturedStatuses.push(streamStatus.value)
      await callback({ type: 'status', message: 'Generating response...' })
      capturedStatuses.push(streamStatus.value)
      await callback({ type: 'status', message: 'Unknown status' })
      capturedStatuses.push(streamStatus.value)
      await callback({ type: 'done', question_id: 1, is_biblical: true })
    })

    const { askQuestion, streamStatus } = useKidsBibleQA()
    await askQuestion('Test')

    expect(capturedStatuses[0]).toContain('Looking through the Bible')
    expect(capturedStatuses[1]).toContain('Thinking about your question')
    expect(capturedStatuses[2]).toContain('Finding Bible verses')
    expect(capturedStatuses[3]).toContain('Writing your answer')
    expect(capturedStatuses[4]).toContain('Working on your answer')
  })

  describe('Follow-up questions', () => {
    it('validates empty follow-up questions', async () => {
      const { askFollowUpQuestion, error } = useKidsBibleQA()

      await askFollowUpQuestion('')
      expect(error.value).toContain('follow-up question')

      await askFollowUpQuestion('   ')
      expect(error.value).toContain('follow-up question')
    })

    it('handles streaming follow-up question', async () => {
      // Set up initial question
      bibleApi.streamQuestion.mockImplementation(async (questionText, callback) => {
        await callback({ type: 'done', question_id: 1, is_biblical: true })
      })

      const { askQuestion, askFollowUpQuestion, answer, questionId, rootQuestionId, conversationHistory } = useKidsBibleQA()
      await askQuestion('Initial question')

      // Follow-up
      bibleApi.streamFollowUpQuestion.mockImplementation(async (data, callback) => {
        await callback({ type: 'content', text: 'Follow-up answer' })
        await callback({ type: 'done', question_id: 2, is_biblical: true })
      })

      await askFollowUpQuestion('Follow-up question')

      expect(bibleApi.streamFollowUpQuestion).toHaveBeenCalled()
      expect(answer.value).toBe('Follow-up answer')
      expect(questionId.value).toBe(2)
      expect(rootQuestionId.value).toBe(1) // Remains unchanged
      expect(conversationHistory.value).toHaveLength(4)
    })

    it('handles non-streaming follow-up question', async () => {
      bibleApi.askFollowUpQuestion.mockResolvedValue({
        answer: 'Non-streaming follow-up',
        question_id: 3,
        is_biblical: false
      })

      const { askFollowUpQuestion, answer, questionId } = useKidsBibleQA()
      await askFollowUpQuestion('Follow-up', false)

      expect(bibleApi.askFollowUpQuestion).toHaveBeenCalled()
      expect(answer.value).toBe('Non-streaming follow-up')
      expect(questionId.value).toBe(3)
    })

    it('handles cached follow-up response', async () => {
      bibleApi.streamFollowUpQuestion.mockImplementation(async (data, callback) => {
        await callback({
          type: 'cached',
          answer: 'Cached follow-up',
          question_id: 7,
          is_biblical: true
        })
      })

      const { askFollowUpQuestion, answer, questionId, conversationHistory } = useKidsBibleQA()
      await askFollowUpQuestion('Cached follow-up question')

      expect(answer.value).toBe('Cached follow-up')
      expect(questionId.value).toBe(7)
      expect(conversationHistory.value.length).toBeGreaterThan(0)
    })

    it('handles error during streaming follow-up', async () => {
      bibleApi.streamFollowUpQuestion.mockRejectedValue(new Error('Server error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { askFollowUpQuestion, error, loading } = useKidsBibleQA()
      await askFollowUpQuestion('Follow-up')

      expect(error.value).toContain('Oops!')
      expect(loading.value).toBe(false)

      consoleSpy.mockRestore()
    })
  })

  describe('clearAll', () => {
    it('resets all state to defaults', () => {
      const {
        question, answer, questionId, rootQuestionId,
        isBiblicalAnswer, loading, error, conversationHistory,
        streamStatus, isStreaming, clearAll
      } = useKidsBibleQA()

      // Set state
      question.value = 'Q'
      answer.value = 'A'
      questionId.value = 1
      rootQuestionId.value = 1
      isBiblicalAnswer.value = true
      error.value = 'E'
      loading.value = true
      conversationHistory.value = [{ role: 'user', content: 'test' }]
      streamStatus.value = 'status'
      isStreaming.value = true

      clearAll()

      expect(question.value).toBe('')
      expect(answer.value).toBe('')
      expect(questionId.value).toBeNull()
      expect(rootQuestionId.value).toBeNull()
      expect(isBiblicalAnswer.value).toBe(false)
      expect(error.value).toBe('')
      expect(loading.value).toBe(false)
      expect(conversationHistory.value).toEqual([])
      expect(streamStatus.value).toBe('')
      expect(isStreaming.value).toBe(false)
    })
  })

  describe('clearError', () => {
    it('clears only the error state', () => {
      const { question, answer, error, clearError } = useKidsBibleQA()

      question.value = 'Test question'
      answer.value = 'Test answer'
      error.value = 'Test error'

      clearError()

      expect(question.value).toBe('Test question')
      expect(answer.value).toBe('Test answer')
      expect(error.value).toBe('')
    })
  })
})

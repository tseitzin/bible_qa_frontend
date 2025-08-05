import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBibleQA } from '../../composables/useBibleQA.js'
import { bibleApi } from '../../services/bibleApi.js'

// Mock the API
vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    askQuestion: vi.fn()
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
    const mockResponse = { answer: 'God is love.' }
    bibleApi.askQuestion.mockResolvedValue(mockResponse)

    const { question, answer, loading, error, askQuestion } = useBibleQA()

    question.value = 'What is God?'
    await askQuestion()

    expect(bibleApi.askQuestion).toHaveBeenCalledWith('What is God?')
    expect(answer.value).toBe('God is love.')
    expect(error.value).toBe('')
    expect(loading.value).toBe(false)
  })

  it('handles API errors', async () => {
    const mockError = new Error('Network error')
    bibleApi.askQuestion.mockRejectedValue(mockError)
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
    expect(bibleApi.askQuestion).not.toHaveBeenCalled()

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
    bibleApi.askQuestion.mockReturnValue(promise)

    const { loading, askQuestion } = useBibleQA()

    const questionPromise = askQuestion('Test question')
    expect(loading.value).toBe(true)

    resolvePromise({ answer: 'Test answer' })
    await questionPromise

    expect(loading.value).toBe(false)
  })
})

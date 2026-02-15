import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Store reference to the mock constructor so tests can access event handlers
let mockRecognitionInstance
let MockSpeechRecognition

function createMockSpeechRecognition() {
  mockRecognitionInstance = {
    continuous: false,
    interimResults: false,
    lang: '',
    maxAlternatives: 1,
    onstart: null,
    onresult: null,
    onend: null,
    onerror: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn()
  }
  MockSpeechRecognition = vi.fn(() => mockRecognitionInstance)
}

describe('useSpeechToText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    createMockSpeechRecognition()

    // Set up SpeechRecognition on window before importing the composable
    globalThis.SpeechRecognition = MockSpeechRecognition
    globalThis.webkitSpeechRecognition = undefined
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
    delete globalThis.SpeechRecognition
    delete globalThis.webkitSpeechRecognition
  })

  // Helper to dynamically import with fresh module state
  async function loadComposable() {
    const module = await import('../../composables/useSpeechToText.js')
    return module.useSpeechToText()
  }

  it('returns expected properties and methods', async () => {
    const result = await loadComposable()

    expect(result).toHaveProperty('isListening')
    expect(result).toHaveProperty('isSupported')
    expect(result).toHaveProperty('transcript')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('startListening')
    expect(result).toHaveProperty('stopListening')
    expect(result).toHaveProperty('clearTranscript')
  })

  it('detects SpeechRecognition support', async () => {
    const { isSupported } = await loadComposable()
    expect(isSupported.value).toBe(true)
  })

  it('detects webkit SpeechRecognition support', async () => {
    delete globalThis.SpeechRecognition
    globalThis.webkitSpeechRecognition = MockSpeechRecognition

    const { isSupported } = await loadComposable()
    expect(isSupported.value).toBe(true)
  })

  it('reports unsupported when SpeechRecognition is unavailable', async () => {
    delete globalThis.SpeechRecognition
    delete globalThis.webkitSpeechRecognition

    const { isSupported, isListening } = await loadComposable()
    expect(isSupported.value).toBe(false)
    expect(isListening.value).toBe(false)
  })

  it('initializes with default values', async () => {
    const { isListening, transcript, error } = await loadComposable()

    expect(isListening.value).toBe(false)
    expect(transcript.value).toBe('')
    expect(error.value).toBe('')
  })

  it('configures recognition with correct settings', async () => {
    await loadComposable()

    expect(mockRecognitionInstance.continuous).toBe(false)
    expect(mockRecognitionInstance.interimResults).toBe(true)
    expect(mockRecognitionInstance.lang).toBe('en-US')
    expect(mockRecognitionInstance.maxAlternatives).toBe(1)
  })

  it('starts listening and sets isListening on start event', async () => {
    const { startListening, isListening } = await loadComposable()

    startListening()

    expect(mockRecognitionInstance.start).toHaveBeenCalled()

    // Simulate the onstart event
    mockRecognitionInstance.onstart()
    expect(isListening.value).toBe(true)
  })

  it('does not start if already listening', async () => {
    const { startListening, isListening } = await loadComposable()

    // Simulate already listening
    startListening()
    mockRecognitionInstance.onstart()
    expect(isListening.value).toBe(true)

    mockRecognitionInstance.start.mockClear()
    startListening()
    expect(mockRecognitionInstance.start).not.toHaveBeenCalled()
  })

  it('handles final transcript result', async () => {
    const { startListening, transcript } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    // Simulate a final result
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: 'What is the Bible about' },
          length: 1
        }
      ]
    })

    expect(transcript.value).toBe('What is the Bible about')
  })

  it('handles interim transcript result', async () => {
    const { startListening, transcript } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    // Simulate an interim result
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: [
        {
          isFinal: false,
          0: { transcript: 'What is' },
          length: 1
        }
      ]
    })

    expect(transcript.value).toBe('What is')
  })

  it('prefers final transcript over interim', async () => {
    const { startListening, transcript } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    // Simulate both final and interim results
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: 'Final text' },
          length: 1
        },
        {
          isFinal: false,
          0: { transcript: 'Interim text' },
          length: 1
        }
      ]
    })

    expect(transcript.value).toBe('Final text')
  })

  it('stops listening and clears timeout', async () => {
    const { startListening, stopListening, isListening } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()
    expect(isListening.value).toBe(true)

    stopListening()

    expect(mockRecognitionInstance.stop).toHaveBeenCalled()
  })

  it('does not stop if not currently listening', async () => {
    const { stopListening } = await loadComposable()

    stopListening()
    expect(mockRecognitionInstance.stop).not.toHaveBeenCalled()
  })

  it('auto-stops after 10 seconds', async () => {
    const { startListening, isListening } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()
    expect(isListening.value).toBe(true)

    // Advance time by 10 seconds
    vi.advanceTimersByTime(10000)

    // stopListening should have called recognition.stop()
    expect(mockRecognitionInstance.stop).toHaveBeenCalled()
  })

  it('handles no-speech error', async () => {
    const { startListening, error, isListening } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    mockRecognitionInstance.onerror({ error: 'no-speech' })

    expect(isListening.value).toBe(false)
    expect(error.value).toContain('No speech detected')
  })

  it('handles audio-capture error', async () => {
    const { startListening, error } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    mockRecognitionInstance.onerror({ error: 'audio-capture' })

    expect(error.value).toContain('Microphone not available')
  })

  it('handles not-allowed error', async () => {
    const { startListening, error } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    mockRecognitionInstance.onerror({ error: 'not-allowed' })

    expect(error.value).toContain('Microphone access denied')
  })

  it('handles network error', async () => {
    const { startListening, error } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    mockRecognitionInstance.onerror({ error: 'network' })

    expect(error.value).toContain('Network error')
  })

  it('handles unknown error', async () => {
    const { startListening, error } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    mockRecognitionInstance.onerror({ error: 'unknown-error' })

    expect(error.value).toContain('Speech recognition error')
  })

  it('sets isListening to false on end event', async () => {
    const { startListening, isListening } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()
    expect(isListening.value).toBe(true)

    mockRecognitionInstance.onend()
    expect(isListening.value).toBe(false)
  })

  it('clears transcript and error', async () => {
    const { startListening, transcript, error, clearTranscript } = await loadComposable()

    startListening()
    mockRecognitionInstance.onstart()

    // Set some values
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: 'Some text' }, length: 1 }]
    })
    mockRecognitionInstance.onerror({ error: 'no-speech' })

    clearTranscript()

    expect(transcript.value).toBe('')
    expect(error.value).toBe('')
  })

  it('handles start error gracefully', async () => {
    mockRecognitionInstance.start.mockImplementation(() => {
      throw new Error('Recognition start failed')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { startListening, error } = await loadComposable()

    startListening()

    expect(error.value).toContain('Failed to start speech recognition')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('does nothing when unsupported and startListening is called', async () => {
    delete globalThis.SpeechRecognition
    delete globalThis.webkitSpeechRecognition

    const { startListening, isListening } = await loadComposable()

    startListening()
    expect(isListening.value).toBe(false)
  })
})

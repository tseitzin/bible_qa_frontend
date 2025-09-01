import { ref, onUnmounted } from 'vue'

export function useSpeechToText() {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref('')
  
  let recognition = null
  let timeoutId = null

  // Check if speech recognition is supported
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (SpeechRecognition) {
    isSupported.value = true
    recognition = new SpeechRecognition()
    
    // Configure recognition
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1
    
    // Event handlers
    recognition.onstart = () => {
      isListening.value = true
      error.value = ''
      transcript.value = ''
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      transcript.value = finalTranscript || interimTranscript
    }
    
    recognition.onend = () => {
      isListening.value = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
    
    recognition.onerror = (event) => {
      isListening.value = false
      
      switch (event.error) {
        case 'no-speech':
          error.value = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          error.value = 'Microphone not available. Please check your microphone settings.'
          break
        case 'not-allowed':
          error.value = 'Microphone access denied. Please allow microphone access and try again.'
          break
        case 'network':
          error.value = 'Network error. Please check your internet connection.'
          break
        default:
          error.value = 'Speech recognition error. Please try again.'
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }

  const startListening = () => {
    if (!recognition || isListening.value) return
    
    try {
      recognition.start()
      
      // Auto-stop after 10 seconds
      timeoutId = setTimeout(() => {
        if (isListening.value) {
          stopListening()
        }
      }, 10000)
    } catch (err) {
      error.value = 'Failed to start speech recognition. Please try again.'
      console.error('Speech recognition error:', err)
    }
  }

  const stopListening = () => {
    if (!recognition || !isListening.value) return
    
    try {
      recognition.stop()
    } catch (err) {
      console.error('Error stopping speech recognition:', err)
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const clearTranscript = () => {
    transcript.value = ''
    error.value = ''
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript
  }
}
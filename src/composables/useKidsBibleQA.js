import { ref } from 'vue'
import { bibleApi } from '../services/bibleApi.js'
import { openaiService } from '../services/openaiService.js'

export function useKidsBibleQA() {
  const question = ref('')
  const answer = ref('')
  const image = ref('')
  const loading = ref(false)
  const imageLoading = ref(false)
  const error = ref('')

  const askQuestion = async (questionText = question.value) => {
    if (!questionText?.trim()) {
      error.value = 'Please enter a question'
      return
    }

    loading.value = true
    answer.value = ''
    image.value = ''
    error.value = ''

    try {
      // Get the biblical answer first
      const response = await bibleApi.askQuestion(questionText)
      answer.value = response.answer
      
      // Generate a relevant image based on the question and answer
      try {
        imageLoading.value = true
        const imageUrl = await openaiService.generateKidsImage(questionText, response.answer)
        image.value = imageUrl
      } catch (imageError) {
        console.warn('Failed to generate image:', imageError)
        // Don't show image error to kids, just continue without image
        image.value = ''
      } finally {
        imageLoading.value = false
      }
      
    } catch (err) {
      error.value = err.message
      console.error('Kids Bible Q&A Error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearAll = () => {
    question.value = ''
    answer.value = ''
    image.value = ''
    error.value = ''
    loading.value = false
    imageLoading.value = false
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    // State
    question,
    answer,
    image,
    loading,
    imageLoading,
    error,
    
    // Actions
    askQuestion,
    clearAll,
    clearError
  }
}
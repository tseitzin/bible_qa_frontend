import { ref } from 'vue'
import { bibleApi } from '../services/bibleApi.js'

export function useBibleQA() {
  const question = ref('')
  const answer = ref('')
  const questionId = ref(null)
  const loading = ref(false)
  const error = ref('')

  const askQuestion = async (questionText = question.value) => {
    if (!questionText?.trim()) {
      error.value = 'Please enter a question'
      return
    }

    loading.value = true
    answer.value = ''
    error.value = ''

    try {
      const response = await bibleApi.askQuestion(questionText)
      answer.value = response.answer
      questionId.value = response.question_id
    } catch (err) {
      error.value = err.message
      console.error('Bible Q&A Error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearAll = () => {
    question.value = ''
    answer.value = ''
    questionId.value = null
    error.value = ''
    loading.value = false
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    // State
    question,
    answer,
    questionId,
    loading,
    error,
    
    // Actions
    askQuestion,
    clearAll,
    clearError
  }
}

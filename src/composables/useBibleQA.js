import { ref } from 'vue'
import { bibleApi } from '../services/bibleApi.js'

export function useBibleQA() {
  const question = ref('')
  const answer = ref('')
  const questionId = ref(null)
  const rootQuestionId = ref(null) // Track the root question ID for conversation threading
  const isBiblicalAnswer = ref(false)
  const loading = ref(false)
  const error = ref('')
  const conversationHistory = ref([])

  const askQuestion = async (questionText = question.value) => {
    if (!questionText?.trim()) {
      error.value = 'Please enter a question'
      return
    }

    loading.value = true
    answer.value = ''
    isBiblicalAnswer.value = false
    error.value = ''

    try {
      const response = await bibleApi.askQuestion(questionText)
      answer.value = response.answer
      questionId.value = response.question_id
      rootQuestionId.value = response.question_id // Set root for new conversation
      isBiblicalAnswer.value = Boolean(response.is_biblical)
      
      // Reset conversation history for a new question
      conversationHistory.value = [
        { role: 'user', content: questionText },
        { role: 'assistant', content: response.answer }
      ]
    } catch (err) {
      const message = err?.message === 'Network Error'
        ? 'The request took too long. Please try again.'
        : err?.message || 'Unable to process your question right now.'
      error.value = message
      console.error('Bible Q&A Error:', err)
    } finally {
      loading.value = false
    }
  }

  const askFollowUpQuestion = async (followUpText) => {
    if (!followUpText?.trim()) {
      error.value = 'Please enter a follow-up question'
      return
    }

    loading.value = true
    error.value = ''

    try {
      const response = await bibleApi.askFollowUpQuestion({
        question: followUpText,
        conversation_history: conversationHistory.value,
        parent_question_id: rootQuestionId.value // Pass the root question ID
      })
      
      // Update conversation history
      conversationHistory.value.push(
        { role: 'user', content: followUpText },
        { role: 'assistant', content: response.answer }
      )
      
      // Update current answer and question ID (but keep rootQuestionId unchanged)
      answer.value = response.answer
      questionId.value = response.question_id
      isBiblicalAnswer.value = Boolean(response.is_biblical)
    } catch (err) {
      const message = err?.message === 'Network Error'
        ? 'The follow-up request timed out. Please try again in a moment.'
        : err?.message || 'Unable to process your follow-up question right now.'
      error.value = message
      console.error('Follow-up Question Error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearAll = () => {
    question.value = ''
    answer.value = ''
    questionId.value = null
    rootQuestionId.value = null
    isBiblicalAnswer.value = false
    error.value = ''
    loading.value = false
    conversationHistory.value = []
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    // State
    question,
    answer,
    questionId,
    rootQuestionId,
    isBiblicalAnswer,
    loading,
    error,
    conversationHistory,
    
    // Actions
    askQuestion,
    askFollowUpQuestion,
    clearAll,
    clearError
  }
}

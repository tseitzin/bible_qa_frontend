import { ref, nextTick } from 'vue'
import { bibleApi } from '../services/bibleApi.js'

export function useKidsBibleQA() {
  const question = ref('')
  const answer = ref('')
  const questionId = ref(null)
  const rootQuestionId = ref(null) // Track the root question ID for conversation threading
  const isBiblicalAnswer = ref(false)
  const loading = ref(false)
  const error = ref('')
  const conversationHistory = ref([])
  const streamStatus = ref('') // Status message during streaming
  const isStreaming = ref(false) // Whether currently streaming

  const askQuestion = async (questionText = question.value, useStreaming = true) => {
    if (!questionText?.trim()) {
      error.value = 'Oops! Please type a question first! 🤔'
      return
    }

    loading.value = true
    answer.value = ''
    isBiblicalAnswer.value = false
    error.value = ''
    streamStatus.value = ''
    isStreaming.value = useStreaming

    try {
      if (useStreaming) {
        // Use streaming API - same as the adult version
        await bibleApi.streamQuestion(questionText, async (event) => {
          switch (event.type) {
            case 'cached':
              // Cached response - instant complete answer
              answer.value = event.answer
              questionId.value = event.question_id
              rootQuestionId.value = event.question_id
              isBiblicalAnswer.value = Boolean(event.is_biblical)
              streamStatus.value = ''
              
              // Set conversation history
              conversationHistory.value = [
                { role: 'user', content: questionText },
                { role: 'assistant', content: event.answer }
              ]
              break
              
            case 'status':
              // Progress update - use kid-friendly messages
              streamStatus.value = getKidFriendlyStatus(event.message)
              break
              
            case 'content':
              // Streaming text chunk - typewriter effect
              answer.value += event.text
              // Force immediate DOM update for typewriter effect
              await nextTick()
              break
              
            case 'done':
              // Streaming complete
              questionId.value = event.question_id
              rootQuestionId.value = event.question_id
              isBiblicalAnswer.value = Boolean(event.is_biblical)
              streamStatus.value = ''
              
              // Set conversation history
              conversationHistory.value = [
                { role: 'user', content: questionText },
                { role: 'assistant', content: answer.value }
              ]
              break
              
            case 'error':
              error.value = getKidFriendlyError(event.message)
              streamStatus.value = ''
              break
          }
        })
      } else {
        // Use non-streaming API (fallback)
        const response = await bibleApi.askQuestion(questionText)
        answer.value = response.answer
        questionId.value = response.question_id
        rootQuestionId.value = response.question_id
        isBiblicalAnswer.value = Boolean(response.is_biblical)
        
        // Reset conversation history for a new question
        conversationHistory.value = [
          { role: 'user', content: questionText },
          { role: 'assistant', content: response.answer }
        ]
      }
    } catch (err) {
      error.value = getKidFriendlyError(err?.message || 'Something went wrong')
      console.error('Kids Bible Q&A Error:', err)
    } finally {
      loading.value = false
      isStreaming.value = false
      streamStatus.value = ''
    }
  }

  const askFollowUpQuestion = async (followUpText, useStreaming = true) => {
    if (!followUpText?.trim()) {
      error.value = 'Please ask a follow-up question! 🤔'
      return
    }

    loading.value = true
    error.value = ''
    streamStatus.value = ''
    isStreaming.value = useStreaming
    
    // Clear current answer to prepare for new one
    answer.value = ''

    try {
      if (useStreaming) {
        // Use streaming API for follow-up
        await bibleApi.streamFollowUpQuestion(
          {
            question: followUpText,
            conversation_history: conversationHistory.value,
            parent_question_id: rootQuestionId.value
          },
          async (event) => {
            switch (event.type) {
              case 'cached':
                // Cached response - instant complete answer
                answer.value = event.answer
                questionId.value = event.question_id
                isBiblicalAnswer.value = Boolean(event.is_biblical)
                streamStatus.value = ''
                
                // Update conversation history
                conversationHistory.value.push(
                  { role: 'user', content: followUpText },
                  { role: 'assistant', content: event.answer }
                )
                break
                
              case 'status':
                // Progress update
                streamStatus.value = getKidFriendlyStatus(event.message)
                break
                
              case 'content':
                // Streaming text chunk - typewriter effect
                answer.value += event.text
                // Force immediate DOM update for typewriter effect
                await nextTick()
                break
                
              case 'done':
                // Streaming complete
                questionId.value = event.question_id
                isBiblicalAnswer.value = Boolean(event.is_biblical)
                streamStatus.value = ''
                
                // Update conversation history
                conversationHistory.value.push(
                  { role: 'user', content: followUpText },
                  { role: 'assistant', content: answer.value }
                )
                break
                
              case 'error':
                error.value = getKidFriendlyError(event.message)
                streamStatus.value = ''
                break
            }
          }
        )
      } else {
        // Use non-streaming API (fallback)
        const response = await bibleApi.askFollowUpQuestion({
          question: followUpText,
          conversation_history: conversationHistory.value,
          parent_question_id: rootQuestionId.value
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
      }
    } catch (err) {
      error.value = getKidFriendlyError(err?.message || 'Something went wrong')
      console.error('Kids Follow-up Question Error:', err)
    } finally {
      loading.value = false
      isStreaming.value = false
      streamStatus.value = ''
    }
  }

  // Convert technical status messages to kid-friendly versions
  const getKidFriendlyStatus = (message) => {
    if (!message) return ''
    
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('searching') || lowerMessage.includes('looking')) {
      return '🔍 Looking through the Bible for you...'
    }
    if (lowerMessage.includes('thinking') || lowerMessage.includes('processing')) {
      return '🤔 Thinking about your question...'
    }
    if (lowerMessage.includes('finding') || lowerMessage.includes('bible')) {
      return '📖 Finding Bible verses...'
    }
    if (lowerMessage.includes('generating') || lowerMessage.includes('writing')) {
      return '✍️ Writing your answer...'
    }
    
    // Default kid-friendly status
    return '✨ Working on your answer...'
  }

  // Convert technical errors to kid-friendly messages
  const getKidFriendlyError = (message) => {
    if (!message) return 'Oops! Something went wrong. Try again! 😊'
    
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
      return 'Hmm, the internet is being slow! Try again in a moment. 🐢'
    }
    if (lowerMessage.includes('empty') || lowerMessage.includes('question')) {
      return 'Please type a question first! 🤔'
    }
    
    // Default kid-friendly error
    return 'Oops! Something went wrong, but that\'s okay! Try again! 😊'
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
    streamStatus.value = ''
    isStreaming.value = false
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
    streamStatus,
    isStreaming,
    
    // Actions
    askQuestion,
    askFollowUpQuestion,
    clearAll,
    clearError
  }
}
<template>
  <transition name="answer-appear" appear>
    <div v-if="answer" class="answer-display animate-fade-in">
      <div class="answer-header">
        <div class="answer-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="header-content">
          <h3 class="answer-title">Biblical Answer</h3>
          <p class="answer-subtitle">Scripture-based response</p>
        </div>
        <div class="answer-badge">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Verified</span>
        </div>
      </div>
      
      <div class="answer-content">
        <div class="answer-text-wrapper">
          <div class="answer-text">{{ answer }}</div>
          
          <!-- Reading time estimate -->
          <div class="reading-info">
            <svg class="reading-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>
        
        <div class="answer-footer">
          <div class="answer-actions">
            <BaseButton
              @click="copyAnswer"
              variant="secondary"
              size="sm"
              class="action-button"
              :class="{ 'action-button--success': copySuccess }"
            >
              <svg v-if="!copySuccess" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ copySuccess ? 'Copied!' : 'Copy' }}
            </BaseButton>
            
            <BaseButton
              @click="shareAnswer"
              variant="secondary"
              size="sm"
              class="action-button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
              Share
            </BaseButton>
            
            <BaseButton
              @click="saveAnswer"
              variant="ghost"
              size="sm"
              class="action-button"
              :class="{ 'action-button--success': saveSuccess }"
              :disabled="saving"
            >
              <svg v-if="!saveSuccess" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ saveSuccess ? 'Saved!' : 'Save' }}
            </BaseButton>
          </div>
          
          <div class="answer-meta">
            <div class="timestamp">
              <svg class="timestamp-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span>{{ formattedTime }}</span>
            </div>
            <div class="word-count">
              <span>{{ wordCount }} words</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Follow-up Question Section -->
      <div class="followup-section">
        <div class="followup-header">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
          </svg>
          <span class="followup-title">Want to know more?</span>
        </div>
        <p class="followup-description">Ask a follow-up question to dive deeper into this topic</p>
        <div class="followup-input-group">
          <input
            v-model="followUpQuestion"
            type="text"
            class="followup-input"
            placeholder="e.g., Tell me more about King David's reign..."
            @keyup.enter="submitFollowUp"
            :disabled="loading"
          />
          <BaseButton
            @click="submitFollowUp"
            :disabled="!followUpQuestion.trim() || loading"
            variant="primary"
            class="followup-button"
          >
            <svg v-if="!loading" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
            <span v-if="loading">Asking...</span>
            <span v-else>Ask Follow-up</span>
          </BaseButton>
        </div>
      </div>

      <!-- Feedback section -->
      <div class="feedback-section">
        <div class="feedback-header">
          <span class="feedback-title">Was this answer helpful?</span>
        </div>
        <div class="feedback-buttons">
          <button @click="provideFeedback('helpful')" class="feedback-button feedback-button--positive">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
            </svg>
            Helpful
          </button>
          <button @click="provideFeedback('not-helpful')" class="feedback-button feedback-button--negative">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
            </svg>
            Not helpful
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from './ui/BaseButton.vue'
import { savedAnswersService } from '../services/savedAnswersService.js'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['answerSaved', 'followUpQuestion'])
const router = useRouter()
const { currentUser } = useAuth()

const props = defineProps({
  answer: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    default: ''
  },
  questionId: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const copySuccess = ref(false)
const saveSuccess = ref(null)
const saveMessage = ref('')
const saving = ref(false)
const followUpQuestion = ref('')
const answerElement = ref(null)

const formattedTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
})

const wordCount = computed(() => {
  return props.answer.split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return Math.max(1, minutes)
})

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.answer)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const shareAnswer = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Bible Q&A Answer',
        text: props.answer,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  } else {
    // Fallback to copying to clipboard
    copyAnswer()
  }
}

const saveAnswer = async () => {
  if (saving.value) return // Prevent multiple saves
  
  // Check if user is logged in
  if (!currentUser.value) {
    if (confirm('You need to be logged in to save answers. Would you like to create an account or log in?')) {
      router.push('/login')
    }
    return
  }
  
  if (!props.questionId) {
    console.error('Cannot save: questionId is missing')
    saveSuccess.value = false
    saveMessage.value = 'Cannot save answer without a question ID'
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
    return
  }
  
  try {
    saving.value = true
    
    // Small delay to allow tests to see the saving state
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const result = await savedAnswersService.save(props.questionId)
    
    if (result.success) {
      // Show success feedback
      saveSuccess.value = true
      saveMessage.value = result.message
      
      // Emit event with the ID for parent components
      emit('answerSaved', result.id)
      
      console.log('Answer saved successfully:', result.id)
    } else {
      // Show error feedback
      saveSuccess.value = false
      saveMessage.value = result.message
      console.warn('Failed to save answer:', result.message)
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to save answer:', error)
    saveSuccess.value = false
    saveMessage.value = 'An error occurred while saving'
    
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
  } finally {
    saving.value = false
  }
}

const provideFeedback = (type) => {
  // Placeholder for feedback functionality
  console.log(`Feedback provided: ${type}`)
}

const submitFollowUp = () => {
  if (!followUpQuestion.value.trim() || props.loading) return
  
  emit('followUpQuestion', followUpQuestion.value)
  followUpQuestion.value = ''
}

// Auto-scroll to answer when it changes
watch(() => props.answer, async (newAnswer) => {
  if (newAnswer) {
    await nextTick()
    // Small delay to ensure animations have started
    setTimeout(() => {
      const element = document.querySelector('.answer-display')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
})
</script>

<style scoped>
.answer-display {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  margin-top: var(--spacing-xl);
  position: relative;
}

.answer-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-secondary);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-inverse);
  position: relative;
}

.answer-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.answer-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.answer-icon svg {
  width: 24px;
  height: 24px;
}

.header-content {
  flex: 1;
}

.answer-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
}

.answer-subtitle {
  font-size: var(--font-size-sm);
  margin: 0;
  opacity: 0.9;
}

.answer-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.answer-badge svg {
  width: 16px;
  height: 16px;
}

.answer-content {
  padding: var(--spacing-2xl);
}

.answer-text-wrapper {
  margin-bottom: var(--spacing-xl);
}

.answer-text {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: #1a202c;
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
}

.reading-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.reading-icon {
  width: 16px;
  height: 16px;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.answer-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button--success {
  background: var(--color-success) !important;
  color: var(--color-text-inverse) !important;
  border-color: var(--color-success) !important;
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.timestamp-icon {
  width: 14px;
  height: 14px;
}

.word-count {
  font-weight: var(--font-weight-medium);
}

.followup-section {
  padding: var(--spacing-xl);
  background: rgba(37, 99, 235, 0.05);
  border-top: 1px solid rgba(37, 99, 235, 0.1);
}

.followup-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.followup-header svg {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.followup-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.followup-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.followup-input-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.followup-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-normal);
  background: white;
}

.followup-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.followup-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.05);
}

.followup-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
}

.followup-button svg {
  width: 16px;
  height: 16px;
}

.feedback-section {
  padding: var(--spacing-xl);
  background: rgba(245, 158, 11, 0.05);
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.feedback-header {
  margin-bottom: var(--spacing-md);
}

.feedback-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feedback-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.feedback-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.feedback-button:hover {
  background: var(--color-background-muted);
}

.feedback-button--positive:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--color-success);
  color: var(--color-success);
}

.feedback-button--negative:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.feedback-button svg {
  width: 16px;
  height: 16px;
}

/* Animations */
.answer-appear-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-appear-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.answer-appear-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .answer-header {
    padding: var(--spacing-lg);
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .answer-content {
    padding: var(--spacing-xl);
  }
  
  .answer-footer {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .answer-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .answer-meta {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .feedback-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .answer-text {
    font-size: var(--font-size-base);
  }
  
  .answer-actions {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>
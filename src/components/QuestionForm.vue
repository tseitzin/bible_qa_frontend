<template>
  <div class="question-form animate-scale-in">
    <div class="form-header">
      <div class="form-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div class="form-title-section">
        <h2 class="form-title">Ask or Explore Bible Topics</h2>
          <p class="form-subtitle">
          Enter one or more questions or request information you’d like to research — from Bible verses to explanations of biblical themes.
          </p>
      </div>

    </div>
    
    <form @submit.prevent="handleSubmit" class="form" :key="formKey">
      <BaseTextarea
        v-model="localQuestion"
        label="Your Bible Question"
        placeholder="Ask anything about the Bible... What does love mean in 1 Corinthians 13? Who was Moses? What is the meaning of faith? etc."
        :rows="5"
        :disabled="loading"
        :max-length="500"
        :show-char-count="true"
        :floating-label="false"
        :auto-resize="true"
        :speech-supported="speechSupported"
        :is-listening="isListening"
        help-text="💡 Ask clear, specific questions for the most accurate and helpful biblical answers"
        class="question-input"
      />
      
      <!-- Speech Error Display -->
      <div v-if="speechError" class="speech-error">
        <svg class="speech-error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ speechError }}
        <button @click="speechError = ''" class="speech-error-dismiss">×</button>
      </div>
      
      <div class="form-actions">
        <div class="action-buttons">
          <BaseButton
            type="submit"
            :disabled="loading || !localQuestion.trim()"
            :loading="loading"
            size="md"
            class="submit-button"
          >
            <template v-if="!loading">
              <svg class="submit-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              Ask Question
            </template>
          </BaseButton>
          
          <BaseButton
            v-if="localQuestion.trim()"
            type="button"
            variant="ghost"
            size="md"
            @click="clearQuestion"
            :disabled="loading"
            class="clear-button"
          >
            <svg class="clear-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Clear
          </BaseButton>
        </div>
        
        <div v-if="loading" class="loading-section">
          <LoadingSpinner :show="true" size="md" class="form-spinner" />
          <div class="loading-text">
            <p class="loading-primary">Searching Scripture...</p>
            <p class="loading-secondary">Finding the perfect biblical answer for you</p>
          </div>
        </div>
      </div>
    </form>
    
    <!-- Quick suggestions -->
    <div v-if="!localQuestion.trim() && !loading" class="quick-suggestions">
      <h3 class="suggestions-title">Popular Questions</h3>
      <div class="suggestions-grid">
        <button
          v-for="suggestion in quickSuggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="suggestion-button"
          type="button"
        >
          <svg class="suggestion-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, provide } from 'vue'
import BaseTextarea from './ui/BaseTextarea.vue'
import BaseButton from './ui/BaseButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import { useSpeechToText } from '../composables/useSpeechToText.js'

const props = defineProps({
  question: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:question', 'submit'])

const localQuestion = ref(props.question)
const formKey = ref(0)
const speechError = ref('')

// Speech-to-text functionality
const {
  isListening,
  isSupported: speechSupported,
  transcript,
  error: speechApiError,
  startListening,
  stopListening,
  clearTranscript
} = useSpeechToText()


const toggleSpeech = () => {
  if (isListening.value) {
    stopListening()
  } else {
    speechError.value = ''
    startListening()
  }
}

// Provide speech function to BaseTextarea
provide('toggleSpeech', toggleSpeech)

const quickSuggestions = [
  "What is love according to the Bible?",
  "Who was Jesus Christ?",
  "What is the meaning of faith?",
  "How should Christians pray?",
  "What does the Bible say about forgiveness?",
  "What is salvation?"
]

// Watch for speech transcript
watch(transcript, (newTranscript) => {
  if (newTranscript) {
    localQuestion.value = newTranscript
    clearTranscript()
  }
})

// Watch for speech errors
watch(speechApiError, (error) => {
  if (error) {
    speechError.value = error
  }
})

// Keep local state in sync with prop
watch(() => props.question, (newVal) => {
  localQuestion.value = newVal
})

// Emit changes back to parent
watch(localQuestion, (newVal) => {
  emit('update:question', newVal)
})

const handleSubmit = () => {
  if (!localQuestion.value.trim() || props.loading) return
  emit('submit', localQuestion.value)
}

const clearQuestion = () => {
  localQuestion.value = ''
}

const selectSuggestion = (suggestion) => {
  localQuestion.value = suggestion
}

const handleSpeechResult = (transcript) => {
  // For adults, append speech to existing text
  if (localQuestion.value.trim()) {
    localQuestion.value += ' ' + transcript
  } else {
    localQuestion.value = transcript
  }
  speechError.value = ''
}

const handleSpeechError = (error) => {
  speechError.value = error
}
</script>

<style scoped>
.question-form {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.form-icon svg {
  width: 24px;
  height: 24px;
}

.form-title-section {
  flex: 1;
}

.form-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: #1a202c;
  margin: 0 0 var(--spacing-xs) 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  font-size: var(--font-size-base);
  color: #1a202c;
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.question-input {
  position: relative;
}

.speech-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-lg);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  position: relative;
}

.speech-error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.speech-error-dismiss {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color var(--transition-fast);
}

.speech-error-dismiss:hover {
  background: rgba(239, 68, 68, 0.1);
}
.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.submit-button {
  flex: 1;
  min-width: 160px;
}

.submit-icon {
  width: 20px;
  height: 20px;
}

.clear-button {
  flex-shrink: 0;
}

.clear-icon {
  width: 18px;
  height: 18px;
}

.loading-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: var(--border-radius-lg);
}

.form-spinner {
  flex-shrink: 0;
}

.loading-text {
  flex: 1;
}

.loading-primary {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.loading-secondary {
  font-size: var(--font-size-sm);
  color: #1a202c;
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.quick-suggestions {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.suggestions-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
  margin: 0 0 var(--spacing-sm) 0;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.375rem; /* 6px - custom tighter spacing */
}

.suggestion-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-lg);
  color: #1a202c;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
  font-family: inherit;
  font-weight: var(--font-weight-semibold);
}

.suggestion-button:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .question-form {
    padding: var(--spacing-xl);
  }
  
  .form-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .form-title {
    font-size: var(--font-size-xl);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .submit-button,
  .clear-button {
    width: 100%;
  }
  
  .loading-section {
    flex-direction: column;
    text-align: center;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .question-form {
    padding: var(--spacing-lg);
  }
  
  .form-icon {
    width: 40px;
    height: 40px;
  }
  
  .form-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>
<template>
  <Transition name="answer-appear" appear>
    <section v-if="answer" class="answer-display animate-fade-in">
      <header class="answer-header">
        <div class="answer-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div class="header-content">
          <h3 class="answer-title">Biblical Answer</h3>
          <p class="answer-subtitle">Rooted in Scripture</p>
        </div>
        <div class="answer-badge">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Verified</span>
        </div>
      </header>

      <div class="answer-content">
        <div class="answer-text-wrapper">
          <ScriptureText :text="answer" text-class="answer-text" />

          <div class="reading-info">
            <svg class="reading-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>

        <footer class="answer-footer">
          <div class="answer-actions">
            <BaseButton
              class="action-button"
              size="sm"
              variant="secondary"
              :class="{ 'action-button--success': copySuccess }"
              @click="copyAnswer"
            >
              <svg v-if="!copySuccess" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ copySuccess ? 'Copied!' : 'Copy' }}
            </BaseButton>

            <BaseButton class="action-button" size="sm" variant="secondary" @click="shareAnswer">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </BaseButton>

            <BaseButton
              class="action-button"
              size="sm"
              variant="ghost"
              :disabled="saving"
              :class="{ 'action-button--success': saveSuccess }"
              @click="saveAnswer"
            >
              <svg v-if="!saveSuccess" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ saveSuccess ? 'Saved!' : 'Save' }}
            </BaseButton>
          </div>

          <div class="answer-meta">
            <div class="timestamp">
              <svg class="timestamp-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ formattedTime }}</span>
            </div>
            <div class="word-count">{{ wordCount }} words</div>
          </div>
        </footer>
      </div>

      <section class="followup-section">
        <div class="followup-header">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.84 8.84 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="followup-title">Want to know more?</span>
        </div>
        <p class="followup-description">Ask a follow-up question to explore this topic further.</p>
        <div class="followup-input-group">
          <input
            v-model="followUpQuestion"
            class="followup-input"
            type="text"
            :disabled="loading"
            placeholder="e.g., Tell me more about King David's reign..."
            @keyup.enter="submitFollowUp"
          />
          <BaseButton
            class="followup-button"
            variant="primary"
            :disabled="loading || !followUpQuestion.trim()"
            @click="submitFollowUp"
          >
            <svg v-if="!loading" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-if="loading">Asking...</span>
            <span v-else>Ask Follow-up</span>
          </BaseButton>
        </div>
      </section>

      <section class="feedback-section">
        <div class="feedback-header">
          <span class="feedback-title">Was this answer helpful?</span>
        </div>
        <div class="feedback-buttons">
          <button class="feedback-button feedback-button--positive" type="button" @click="provideFeedback('helpful')">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            Helpful
          </button>
          <button class="feedback-button feedback-button--negative" type="button" @click="provideFeedback('not-helpful')">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            Not helpful
          </button>
        </div>
      </section>
    </section>
  </Transition>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from './ui/BaseButton.vue'
import ScriptureText from './ScriptureText.vue'
import { savedAnswersService } from '../services/savedAnswersService.js'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['answerSaved', 'followUpQuestion'])
const router = useRouter()
const { currentUser } = useAuth()

const props = defineProps({
  answer: {
    type: String,
    default: '',
  },
  question: {
    type: String,
    default: '',
  },
  questionId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const copySuccess = ref(false)
const saveSuccess = ref(null)
const saving = ref(false)
const followUpQuestion = ref('')

const formattedTime = computed(() => new Date().toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
}))

const wordCount = computed(() => props.answer.split(/\s+/).filter(Boolean).length)
const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.answer)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

const shareAnswer = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Bible Q&A Answer',
        text: props.answer,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
    return
  }

  copyAnswer()
}

const saveAnswer = async () => {
  if (saving.value) {
    return
  }

  if (!currentUser.value) {
    const shouldLogin = confirm('You need to be logged in to save answers. Would you like to create an account or log in?')
    if (shouldLogin) {
      router.push('/login')
    }
    return
  }

  if (!props.questionId) {
    console.error('Cannot save answer without a questionId.')
    saveSuccess.value = false
    setTimeout(() => {
      saveSuccess.value = null
    }, 3000)
    return
  }

  try {
    saving.value = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    const result = await savedAnswersService.save(props.questionId)

    if (result.success) {
      saveSuccess.value = true
      emit('answerSaved', result.id)
    } else {
      saveSuccess.value = false
      console.warn('Failed to save answer:', result.message)
    }

    setTimeout(() => {
      saveSuccess.value = null
    }, 3000)
  } catch (error) {
    console.error('Failed to save answer:', error)
    saveSuccess.value = false
    setTimeout(() => {
      saveSuccess.value = null
    }, 3000)
  } finally {
    saving.value = false
  }
}

const provideFeedback = (type) => {
  // Placeholder for future feedback handling
  console.log(`Feedback provided: ${type}`)
}

const submitFollowUp = () => {
  if (!followUpQuestion.value.trim() || props.loading) {
    return
  }

  emit('followUpQuestion', followUpQuestion.value)
  followUpQuestion.value = ''
}

watch(
  () => props.answer,
  async (newAnswer) => {
    if (!newAnswer) {
      return
    }

    await nextTick()
    setTimeout(() => {
      const element = document.querySelector('.answer-display')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  },
)
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
}

.answer-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding-bottom: var(--spacing-xl);
}

.answer-text-wrapper {
  margin-bottom: var(--spacing-lg);
  position: relative;
}

:deep(.answer-text) {
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
  padding-top: 0;
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
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button--success {
  background: rgba(34, 197, 94, 0.12) !important;
  color: #16a34a !important;
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.timestamp,
.word-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.timestamp-icon {
  width: 16px;
  height: 16px;
}

.followup-section {
  padding: 0 var(--spacing-2xl) var(--spacing-xs);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
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
  display: block;
  flex-shrink: 0;
  color: var(--color-primary);
}

.followup-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: black;
}

.followup-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-muted);
}

.followup-input-group {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.followup-input {
  flex: 1;
  min-width: 240px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #0f172a;
}

.followup-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.followup-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.feedback-section {
  padding: 0 var(--spacing-2xl) var(--spacing-xl);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.12);
}

.feedback-header {
  margin-bottom: var(--spacing-md);
}

.feedback-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: black;
}

.feedback-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.feedback-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.85);
  color: #0f172a;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: transform var(--transition-fast), box-shadow var(--transition-normal), border-color var(--transition-normal);
}

.feedback-button svg {
  width: 16px;
  height: 16px;
}

.feedback-button--positive {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
  color: #f0fdf4;
  border-color: rgba(22, 101, 52, 0.6);
}

.feedback-button--positive:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.35);
  border-color: rgba(22, 101, 52, 0.8);
}

.feedback-button--negative {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.95), rgba(239, 68, 68, 0.95));
  color: #fff5f5;
  border-color: rgba(185, 28, 28, 0.65);
}

.feedback-button--negative:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.35);
  border-color: rgba(185, 28, 28, 0.85);
}

.answer-appear-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.answer-appear-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.animate-fade-in {
  animation: fadeIn 0.35s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .answer-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .followup-input-group {
    flex-direction: column;
  }

  .followup-button {
    width: 100%;
    justify-content: center;
  }
}
</style>

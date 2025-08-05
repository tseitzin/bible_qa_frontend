<template>
  <transition name="answer-appear" appear>
    <div v-if="answer" class="answer-display">
      <div class="answer-header">
        <div class="answer-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 class="answer-title">Biblical Answer</h3>
      </div>
      
      <div class="answer-content">
        <div class="answer-text">{{ answer }}</div>
        
        <div class="answer-footer">
          <div class="answer-actions">
            <button @click="copyAnswer" class="action-button" title="Copy answer">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
              Copy
            </button>
            
            <button @click="shareAnswer" class="action-button" title="Share answer">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
              Share
            </button>
          </div>
          
          <div class="answer-meta">
            <span class="timestamp">{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  answer: {
    type: String,
    default: ''
  }
})

const copySuccess = ref(false)

const formattedTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
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
</script>

<style scoped>
.answer-display {
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background-alt) 100%);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-top: var(--spacing-md);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-inverse);
}

.answer-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.answer-icon svg {
  width: 100%;
  height: 100%;
}

.answer-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.answer-content {
  padding: var(--spacing-lg);
}

.answer-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.answer-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
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
  transition: all var(--transition-fast);
}

.action-button:hover {
  background: var(--color-background-muted);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.timestamp {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Animations */
.answer-appear-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-appear-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.answer-appear-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  .answer-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .answer-content {
    padding: var(--spacing-lg);
  }
  
  .answer-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
  
  .answer-actions {
    order: 2;
    width: 100%;
    justify-content: space-evenly;
  }
  
  .answer-meta {
    order: 1;
  }
}
</style>

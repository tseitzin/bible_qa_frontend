<template>
  <transition name="error-appear">
    <div v-if="error" class="error-message" role="alert" aria-live="polite">
      <div class="error-content">
        <div class="error-icon-wrapper">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
        
        <div class="error-text-content">
          <h4 class="error-title">Something went wrong</h4>
          <p class="error-text">{{ error }}</p>
          
          <div class="error-suggestions">
            <p class="suggestions-title">Try these solutions:</p>
            <ul class="suggestions-list">
              <li>Check your internet connection</li>
              <li>Refresh the page and try again</li>
              <li>Make sure your question is clear and specific</li>
            </ul>
          </div>
        </div>
        
        <div class="error-actions">
          <BaseButton
            @click="$emit('dismiss')"
            variant="ghost"
            size="sm"
            class="dismiss-button"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Dismiss
          </BaseButton>
          
          <BaseButton
            @click="retryAction"
            variant="secondary"
            size="sm"
            class="retry-button"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            Try Again
          </BaseButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import BaseButton from './ui/BaseButton.vue'

defineProps({
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dismiss', 'retry'])

const retryAction = () => {
  emit('retry')
  emit('dismiss')
}
</script>

<style scoped>
.error-message {
  margin-top: var(--spacing-xl);
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.05) 0%, 
    rgba(252, 165, 165, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  position: relative;
}

.error-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--color-danger) 0%, #f87171 100%);
}

.error-content {
  padding: var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.error-icon-wrapper {
  flex-shrink: 0;
}

.error-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-danger) 0%, #f87171 100%);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
  position: relative;
}

.error-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--color-danger) 0%, #f87171 100%);
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.error-icon svg {
  width: 24px;
  height: 24px;
  transform: rotate(45deg);
}

.error-text-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-danger-dark);
}

.error-text {
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-danger);
  line-height: var(--line-height-relaxed);
  font-weight: var(--font-weight-medium);
}

.error-suggestions {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.suggestions-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
  margin: 0 0 var(--spacing-sm) 0;
}

.suggestions-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: #1a202c;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.suggestions-list li {
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-normal);
}

.suggestions-list li:last-child {
  margin-bottom: 0;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.dismiss-button,
.retry-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 100px;
  justify-content: center;
}

.dismiss-button svg,
.retry-button svg {
  width: 16px;
  height: 16px;
}

.retry-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.retry-button:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
}

/* Animations */
.error-appear-enter-active,
.error-appear-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-appear-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.error-appear-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Pulse animation for error icon */
.error-icon {
  animation: error-pulse 2s ease-in-out infinite;
}

@keyframes error-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-xl);
  }
  
  .error-actions {
    flex-direction: row;
    justify-content: center;
    margin-top: var(--spacing-lg);
  }
  
  .dismiss-button,
  .retry-button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .error-content {
    padding: var(--spacing-lg);
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .dismiss-button,
  .retry-button {
    width: 100%;
  }
}
</style>
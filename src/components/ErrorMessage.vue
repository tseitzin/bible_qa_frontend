<template>
  <transition name="error-appear">
    <div v-if="error" class="error-message" role="alert" aria-live="polite">
      <div class="error-icon">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="error-content">
        <h4 class="error-title">Something went wrong</h4>
        <p class="error-text">{{ error }}</p>
      </div>
      <button @click="$emit('dismiss')" class="error-dismiss" title="Dismiss error">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: ''
  }
})

defineEmits(['dismiss'])
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
  border: 1px solid #fecaca;
  border-radius: var(--border-radius-lg);
  color: var(--color-danger-dark);
  box-shadow: var(--shadow-sm);
}

.error-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-danger);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-danger-dark);
}

.error-text {
  font-size: var(--font-size-sm);
  margin: 0;
  color: #b91c1c;
  line-height: var(--line-height-normal);
}

.error-dismiss {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  padding: 0;
}

.error-dismiss:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger-dark);
}

.error-dismiss svg {
  width: 100%;
  height: 100%;
}

/* Animations */
.error-appear-enter-active,
.error-appear-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-appear-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.error-appear-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .error-message {
    padding: var(--spacing-md);
  }
}
</style>

<template>
  <div v-if="show" :class="spinnerClasses">
    <div :class="['spinner', `spinner--${size}`]"></div>
    <span v-if="message" class="loading-message">{{ message }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  center: {
    type: Boolean,
    default: false
  }
})

const spinnerClasses = computed(() => ({
  'loading-spinner': true,
  'loading-spinner--center': props.center
}))
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-spinner--center {
  justify-content: center;
  padding: var(--spacing-xl);
}

.spinner {
  border: 2px solid var(--color-background-muted);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner--md {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner--lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.loading-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

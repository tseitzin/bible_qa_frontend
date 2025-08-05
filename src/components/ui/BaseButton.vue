<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => ({
  'btn': true,
  [`btn--${props.variant}`]: true,
  [`btn--${props.size}`]: true,
  'btn--loading': props.loading,
  'btn--disabled': props.disabled,
  'btn--full-width': props.fullWidth
}))
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Sizes */
.btn--sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  min-height: 2rem;
}

.btn--md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  min-height: 2.5rem;
}

.btn--lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  min-height: 3rem;
}

/* Variants */
.btn--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn--secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-background-muted);
  border-color: var(--color-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border-color: transparent;
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-background-muted);
  color: var(--color-primary-dark);
}

.btn--danger {
  background: linear-gradient(135deg, var(--color-danger) 0%, #f87171 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-danger);
  box-shadow: var(--shadow-sm);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-danger-dark) 0%, var(--color-danger) 100%);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* States */
.btn--disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn--loading {
  cursor: wait;
  color: transparent;
}

.btn--full-width {
  width: 100%;
}

/* Loading spinner */
.loading-spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ripple effect */
.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.btn:active:not(:disabled)::before {
  width: 300px;
  height: 300px;
}
</style>

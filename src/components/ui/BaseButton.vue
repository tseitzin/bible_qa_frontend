<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
    <span :class="{ 'content-hidden': loading }" class="button-content">
      <slot />
    </span>
    <div class="button-ripple" ref="ripple"></div>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
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
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const ripple = ref(null)

const buttonClasses = computed(() => ({
  'btn': true,
  [`btn--${props.variant}`]: true,
  [`btn--${props.size}`]: true,
  'btn--loading': props.loading,
  'btn--disabled': props.disabled,
  'btn--full-width': props.fullWidth,
  'btn--rounded': props.rounded
}))

const handleClick = (event) => {
  if (props.disabled || props.loading) return
  
  // Create ripple effect
  createRipple(event)
  emit('click', event)
}

const createRipple = (event) => {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  const rippleElement = document.createElement('span')
  rippleElement.className = 'ripple-effect'
  rippleElement.style.width = rippleElement.style.height = size + 'px'
  rippleElement.style.left = x + 'px'
  rippleElement.style.top = y + 'px'
  
  if (ripple.value) {
    ripple.value.appendChild(rippleElement)
    
    setTimeout(() => {
      if (rippleElement.parentNode) {
        rippleElement.parentNode.removeChild(rippleElement)
      }
    }, 600)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  border: 2px solid transparent;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
  font-family: inherit;
  letter-spacing: 0.025em;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* Sizes */
.btn--sm {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  min-height: 2.25rem;
  gap: var(--spacing-xs);
}

.btn--md {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-base);
  min-height: 2.75rem;
}

.btn--lg {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  min-height: 3.25rem;
}

.btn--xl {
  padding: var(--spacing-xl) var(--spacing-3xl);
  font-size: var(--font-size-xl);
  min-height: 3.75rem;
}

/* Variants */
.btn--primary {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  position: relative;
}

.btn--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  border-radius: inherit;
  pointer-events: none;
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-primary-dark);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.btn--secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border-muted);
  box-shadow: var(--shadow-sm);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-background-muted);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border-color: transparent;
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary-dark);
  border-color: rgba(37, 99, 235, 0.2);
}

.btn--danger {
  background: var(--gradient-secondary);
  background: linear-gradient(135deg, var(--color-danger) 0%, #f87171 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-danger);
  box-shadow: var(--shadow-md);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-danger-dark) 0%, var(--color-danger) 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.btn--success {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-success);
  box-shadow: var(--shadow-md);
}

.btn--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, var(--color-success) 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
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
  pointer-events: none;
}

.btn--full-width {
  width: 100%;
}

.btn--rounded {
  border-radius: 9999px;
}

/* Loading spinner */
.loading-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
}

.content-hidden {
  opacity: 0;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: opacity var(--transition-fast);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ripple effect */
.button-ripple {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
}

:deep(.ripple-effect) {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Enhanced focus styles */
.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Gradient animation for primary button */
.btn--primary {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn--primary:hover {
  animation-play-state: paused;
}
</style>
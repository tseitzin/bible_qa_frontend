<template>
  <div class="textarea-wrapper">
    <div v-if="label" class="textarea-label-wrapper">
      <label :for="inputId" class="textarea-label">
        {{ label }}
        <span v-if="required" class="required-indicator">*</span>
      </label>
      <div v-if="showCharCount && maxLength" class="char-count-header">
        <span :class="charCountClasses">{{ modelValue.length }}/{{ maxLength }}</span>
      </div>
    </div>
    
    <div class="textarea-container">
      <div class="textarea-inner">
        <textarea
          :id="inputId"
          :value="modelValue"
          :placeholder="placeholder"
          :rows="rows"
          :disabled="disabled"
          :maxlength="maxLength"
          :aria-label="label || placeholder || 'Text input field'"
          :aria-describedby="helpText ? `${inputId}-help` : undefined"
          :aria-invalid="error ? 'true' : 'false'"
          :class="textareaClasses"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
        
        <!-- Floating placeholder effect -->
        <div v-if="floatingLabel && label" :class="floatingLabelClasses">
          {{ label }}
        </div>
        
        <!-- Focus indicator -->
        <div class="focus-indicator" :class="{ 'focus-indicator--active': isFocused }"></div>
      </div>
      
      <!-- Character count (bottom right) -->
      <div v-if="showCharCount && maxLength && !label" class="char-count-bottom">
        <span :class="charCountClasses">{{ modelValue.length }}/{{ maxLength }}</span>
      </div>
    </div>
    
    <div v-if="helpText" :id="`${inputId}-help`" class="help-text">
      <svg class="help-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      {{ helpText }}
    </div>
    
    <div v-if="error" class="error-text">
      <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  rows: {
    type: [Number, String],
    default: 4
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: false
  },
  floatingLabel: {
    type: Boolean,
    default: false
  },
  autoResize: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown'])

const isFocused = ref(false)
const inputId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const textareaClasses = computed(() => ({
  'base-textarea': true,
  'base-textarea--focused': isFocused.value,
  'base-textarea--error': props.error,
  'base-textarea--disabled': props.disabled,
  'base-textarea--floating': props.floatingLabel && props.label,
  'base-textarea--has-value': props.modelValue.length > 0
}))

const floatingLabelClasses = computed(() => ({
  'floating-label': true,
  'floating-label--active': isFocused.value || props.modelValue.length > 0,
  'floating-label--error': props.error
}))

const charCountClasses = computed(() => {
  const percentage = props.maxLength ? (props.modelValue.length / props.maxLength) * 100 : 0
  return {
    'char-count': true,
    'char-count--warning': percentage >= 80 && percentage < 100,
    'char-count--danger': percentage >= 100
  }
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  
  if (props.autoResize) {
    autoResizeTextarea(event.target)
  }
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

const autoResizeTextarea = (textarea) => {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}
</script>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.textarea-label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.textarea-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.required-indicator {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.char-count-header {
  font-size: var(--font-size-xs);
}

.textarea-container {
  position: relative;
}

.textarea-inner {
  position: relative;
  display: flex;
  flex-direction: column;
}

.base-textarea {
  width: 100%;
  padding: var(--spacing-lg);
  font-size: var(--font-size-base);
  font-family: inherit;
  line-height: var(--line-height-relaxed);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-background);
  color: #6b7280;
  resize: vertical;
  transition: all var(--transition-normal);
  min-height: 2.5rem;
  position: relative;
  z-index: 1;
  font-weight: var(--font-weight-medium);
}

.base-textarea::placeholder {
  color: #9ca3af;
  transition: all var(--transition-fast);
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: var(--color-background);
  color: #4b5563;
}

.base-textarea:focus::placeholder {
  opacity: 0.7;
  transform: translateY(-2px);
}

.base-textarea--floating {
  padding-top: calc(var(--spacing-lg) + var(--spacing-md));
}

.base-textarea--focused {
  border-color: var(--color-border-focus);
}

.base-textarea--error {
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.02);
}

.base-textarea--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-textarea--disabled {
  background-color: var(--color-background-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
  border-color: var(--color-border-muted);
}

.floating-label {
  position: absolute;
  left: var(--spacing-lg);
  top: var(--spacing-lg);
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  pointer-events: none;
  transition: all var(--transition-normal);
  background: var(--color-background);
  padding: 0 var(--spacing-xs);
  z-index: 2;
}

.floating-label--active {
  top: -8px;
  font-size: var(--font-size-xs);
  color: var(--color-border-focus);
  font-weight: var(--font-weight-medium);
}

.floating-label--error {
  color: var(--color-danger);
}

.focus-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: all var(--transition-normal);
  transform: translateX(-50%);
  border-radius: 1px;
}

.focus-indicator--active {
  width: 100%;
}

.char-count-bottom {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  font-size: var(--font-size-xs);
  z-index: 2;
}

.char-count {
  background: var(--color-background);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-xs);
}

.char-count--warning {
  color: var(--color-warning);
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.1);
}

.char-count--danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

.help-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: #2d3748;
  padding: var(--spacing-xs) 0;
  font-weight: var(--font-weight-semibold);
}

.help-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.error-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs) 0;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Enhanced animations */
.base-textarea {
  background-image: linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.02) 100%);
}

.base-textarea:focus {
  background-image: linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(37, 99, 235, 0.05) 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-textarea {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
  }
  
  .base-textarea--floating {
    padding-top: calc(var(--spacing-md) + var(--spacing-sm));
  }
  
  .floating-label {
    left: var(--spacing-md);
    top: var(--spacing-md);
  }
}
</style>
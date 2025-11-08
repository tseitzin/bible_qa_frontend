<template>
  <div :class="['textarea-wrapper', { 'textarea-wrapper--dense': dense }]">
    <div v-if="label" class="textarea-label-wrapper">
      <label :for="inputId" class="textarea-label">
        {{ label }}
        <span v-if="required" class="required-indicator">*</span>
      </label>
      <div v-if="showCharCount && maxLength" class="char-count-header">
        <span :class="charCountClasses">Characters: {{ modelValue.length }}/{{ maxLength }}</span>
      </div>
    </div>
    
    <div class="textarea-container">
      <div :class="['textarea-inner', { 'textarea-inner--dense': dense }]">
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
        
        <!-- Speech-to-text button -->
        <button
          v-if="speechSupported"
          @click="toggleSpeech"
          :disabled="disabled"
          type="button"
          class="speech-button"
          :class="{ 'speech-button--listening': isListening }"
          :title="isListening ? 'Stop listening' : 'Start voice input'"
        >
          <svg v-if="!isListening" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
          </svg>
        </button>
        
        <!-- Floating placeholder effect -->
        <div v-if="floatingLabel && label" :class="floatingLabelClasses">
          {{ label }}
        </div>
        
        <!-- Focus indicator -->
        <div class="focus-indicator" :class="{ 'focus-indicator--active': isFocused }"></div>
      </div>
      
      <!-- Character count (bottom right) -->
      <div v-if="showCharCount && maxLength && !label" :class="['char-count-bottom', { 'char-count-bottom--dense': dense }]">
        <span :class="charCountClasses">Characters: {{ modelValue.length }}/{{ maxLength }}</span>
      </div>
    </div>
    
    <div v-if="helpText" :id="`${inputId}-help`" :class="['help-text', { 'help-text--dense': dense }]">
      <svg class="help-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      {{ helpText }}
    </div>
    
    <div v-if="error" :class="['error-text', { 'error-text--dense': dense }]">
      <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

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
  },
  speechSupported: {
    type: Boolean,
    default: false
  },
  isListening: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown'])

const isFocused = ref(false)
const inputId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

// Inject speech functions from parent
const toggleSpeech = inject('toggleSpeech', () => {})

const textareaClasses = computed(() => ({
  'base-textarea': true,
  'base-textarea--focused': isFocused.value,
  'base-textarea--error': props.error,
  'base-textarea--disabled': props.disabled,
  'base-textarea--floating': props.floatingLabel && props.label,
  'base-textarea--has-value': props.modelValue.length > 0,
  'base-textarea--dense': props.dense
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

.textarea-wrapper--dense {
  gap: 1px;
}

.textarea-wrapper--dense .textarea-label {
  font-size: 0.72rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.15;
}

.textarea-wrapper--dense .char-count-header {
  font-size: 0.62rem;
}

.textarea-wrapper--dense .char-count-header span {
  font-weight: var(--font-weight-medium);
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

.textarea-inner--dense {
  gap: 0;
}

.base-textarea {
  width: 100%;
  padding: var(--spacing-lg);
  padding-right: 60px; /* Make room for speech button */
  font-size: var(--font-size-base);
  font-family: inherit;
  line-height: var(--line-height-relaxed);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background-color: rgba(15, 23, 42, 0.92);
  background-image: none;
  color: var(--color-text-inverse);
  -webkit-text-fill-color: var(--color-text-inverse);
  caret-color: var(--color-text-inverse);
  color-scheme: dark;
  resize: vertical;
  transition: all var(--transition-normal);
  min-height: 2.5rem;
  position: relative;
  z-index: 1;
  font-weight: var(--font-weight-medium);
}

.base-textarea--dense {
  padding: 5px 36px 5px 6px;
  font-size: 0.82rem;
  line-height: 1.2;
}

.textarea-wrapper--dense .speech-button {
  top: 5px;
  right: 5px;
  width: 26px;
  height: 26px;
}

.speech-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  z-index: 2;
}

.speech-button:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(37, 99, 235, 0.05);
  transform: scale(1.05);
}

.speech-button--listening {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--color-text-inverse);
  animation: pulse-recording 1s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.speech-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.speech-button svg {
  width: 20px;
  height: 20px;
}

.textarea-wrapper--dense .speech-button svg {
  width: 15px;
  height: 15px;
}

.base-textarea::placeholder {
  color: #9ca3af;
  opacity: 0.6;
  transition: all var(--transition-fast);
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background-color: rgba(15, 23, 42, 0.95);
  background-image: none;
  color: var(--color-text-inverse);
  -webkit-text-fill-color: var(--color-text-inverse);
  caret-color: var(--color-text-inverse);
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

.char-count-bottom--dense {
  bottom: 3px;
  right: 5px;
}

.char-count {
  background: var(--color-background);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-light);
  color: white;
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-xs);
}

.textarea-wrapper--dense .char-count {
  padding: 2px 4px;
  font-size: 0.62rem;
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

.help-text--dense {
  font-size: 0.64rem;
  padding: 2px 0 3px;
  gap: 3px;
}

.help-icon {
  width: 15px;
  height: 15px;
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

.error-text--dense {
  font-size: 0.64rem;
  padding: 2px 0 3px;
  gap: 3px;
}
.error-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* Enhanced animations */
.base-textarea {
  background-image: none;
}

.base-textarea:focus {
  background-image: none;
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
<template>
  <div class="textarea-wrapper">
    <label v-if="label" :for="inputId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <div class="textarea-container">
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
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div v-if="showCharCount && maxLength" class="char-count">
        {{ modelValue.length }}/{{ maxLength }}
      </div>
    </div>
    <div v-if="helpText" :id="`${inputId}-help`" class="help-text">{{ helpText }}</div>
    <div v-if="error" class="error-text">{{ error }}</div>
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
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const isFocused = ref(false)
const inputId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const textareaClasses = computed(() => ({
  'base-textarea': true,
  'base-textarea--focused': isFocused.value,
  'base-textarea--error': props.error,
  'base-textarea--disabled': props.disabled
}))

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.textarea-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.required-indicator {
  color: var(--color-danger);
  margin-left: 2px;
}

.textarea-container {
  position: relative;
}

.base-textarea {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  line-height: var(--line-height-normal);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
  color: var(--color-text-primary);
  resize: vertical;
  transition: all var(--transition-fast);
  min-height: 2.5rem;
}

.base-textarea::placeholder {
  color: var(--color-text-muted);
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.base-textarea--focused {
  border-color: var(--color-border-focus);
}

.base-textarea--error {
  border-color: var(--color-danger);
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
}

.char-count {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-background);
  padding: 2px 4px;
  border-radius: var(--border-radius-sm);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.error-text {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
}
</style>

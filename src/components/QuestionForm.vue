<template>
  <div class="question-form">
    <form @submit.prevent="handleSubmit" class="form">
      <BaseTextarea
        v-model="localQuestion"
        label="Your Bible Question"
        placeholder="Ask anything about the Bible... What does love mean in 1 Corinthians 13? Who was Moses? etc."
        :rows="4"
        :disabled="loading"
        :max-length="500"
        :show-char-count="true"
        help-text="Ask clear, specific questions for the best answers"
      />
      <div class="form-actions">
        <BaseButton
          type="submit"
          :disabled="loading || !localQuestion.trim()"
          :loading="loading"
          size="md"
          class="submit-button"
        >
          <template v-if="!loading">
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
            Ask Question
          </template>
          <template v-else>
            <LoadingSpinner :show="true" message="Searching Scripture..." size="sm" />
          </template>
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseTextarea from './ui/BaseTextarea.vue'
import BaseButton from './ui/BaseButton.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const props = defineProps({
  question: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:question', 'submit'])

const localQuestion = ref(props.question)

// Keep local state in sync with prop
watch(() => props.question, (newVal) => {
  localQuestion.value = newVal
})

// Emit changes back to parent
watch(localQuestion, (newVal) => {
  emit('update:question', newVal)
})

const handleSubmit = () => {
  if (!localQuestion.value.trim() || props.loading) return
  emit('submit', localQuestion.value)
}
</script>

<style scoped>
.question-form {
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(214, 220, 230, 0.6);
  backdrop-filter: blur(10px);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  min-width: 100px;
}

.icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .question-form {
    padding: var(--spacing-lg);
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .submit-button {
    width: 100%;
  }
}
</style>

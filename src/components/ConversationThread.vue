<template>
  <div class="conversation-thread">
    <div
      v-for="(item, index) in thread"
      :key="item.id"
      class="thread-item"
      :class="{ 'follow-up': index > 0 }"
    >
      <div class="thread-header">
        <span class="thread-icon">
          {{ index === 0 ? '💬' : '↳' }}
        </span>
        <span class="thread-label">
          {{ index === 0 ? 'Original Question' : `Follow-up ${index}` }}
        </span>
      </div>
      
      <div class="question-section">
        <h4>Question:</h4>
        <div class="question-text">
          <ScriptureText :text="item.question" />
        </div>
      </div>
      
      <div class="answer-section">
        <h4>Answer:</h4>
        <div class="answer-text">
          <ScriptureText :text="item.answer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ScriptureText from './ScriptureText.vue'

defineProps({
  thread: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
.conversation-thread {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.thread-item {
  background: var(--card-bg-alt, var(--color-background-alt));
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.thread-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.thread-item.follow-up {
  margin-left: 2rem;
  border-left: 3px solid var(--color-primary);
}

.thread-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.thread-icon {
  font-size: 1.25rem;
}

.thread-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-section,
.answer-section {
  margin-bottom: 1rem;
}

.question-section h4,
.answer-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-text {
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

.answer-text {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

@media (max-width: 768px) {
  .thread-item.follow-up {
    margin-left: 1rem;
  }
  
  .thread-item {
    padding: 1rem;
  }
}
</style>

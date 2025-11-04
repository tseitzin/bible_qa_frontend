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
        <p class="question-text">{{ item.question }}</p>
      </div>
      
      <div class="answer-section">
        <h4>Answer:</h4>
        <p class="answer-text">{{ item.answer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.thread-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.thread-item.follow-up {
  margin-left: 2rem;
  border-left: 3px solid #3b82f6;
}

.thread-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.thread-icon {
  font-size: 1.25rem;
}

.thread-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
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
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-text {
  color: #1a202c;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

.answer-text {
  color: #4a5568;
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

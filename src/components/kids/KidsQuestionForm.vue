<template>
  <div class="kids-question-form animate-bounce-in">
    <div class="form-header">
      <div class="form-mascot">
        <div class="mascot-character">🦁</div>
        <div class="mascot-speech">
          <div class="speech-bubble">
            {{ mascotMessage }}
          </div>
        </div>
      </div>
      <div class="form-title-section">
        <h2 class="kids-form-title">What do you want to know?</h2>
        <p class="kids-form-subtitle">Ask me anything about God, Jesus, or the Bible! 🌟</p>
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit" class="kids-form">
      <div class="question-input-wrapper">
        <label class="kids-label">
          <span class="label-text">
            <span class="label-emoji">💭</span>
            Your Question
          </span>
        </label>
        <textarea
          v-model="localQuestion"
          :placeholder="currentPlaceholder"
          :disabled="loading"
          :maxlength="300"
          rows="4"
          class="kids-textarea"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <div class="char-count">
          <span :class="charCountClasses">{{ localQuestion.length }}/300</span>
        </div>
      </div>
      
      <div class="form-actions">
        <button
          type="submit"
          :disabled="loading || !localQuestion.trim()"
          :class="['kids-submit-button', { 'kids-submit-button--loading': loading }]"
        >
          <span v-if="!loading" class="button-content">
            <span class="button-emoji">🚀</span>
            Ask My Question!
          </span>
          <span v-else class="loading-content">
            <span class="loading-emoji">🔍</span>
            Looking for answers...
          </span>
        </button>
        
        <button
          v-if="localQuestion.trim()"
          type="button"
          @click="clearQuestion"
          :disabled="loading"
          class="kids-clear-button"
        >
          <span class="button-emoji">🗑️</span>
          Clear
        </button>
      </div>
      
      <!-- Loading animation -->
      <div v-if="loading" class="kids-loading">
        <div class="loading-characters">
          <span class="loading-char loading-char--1">📖</span>
          <span class="loading-char loading-char--2">✨</span>
          <span class="loading-char loading-char--3">🔍</span>
        </div>
        <p class="loading-text">Looking through the Bible for you...</p>
      </div>
    </form>
    
    <!-- Fun question suggestions -->
    <div v-if="!localQuestion.trim() && !loading" class="question-suggestions">
      <h3 class="suggestions-title">
        <span class="title-emoji">💡</span>
        Try asking about these!
      </h3>
      <div class="suggestions-grid">
        <button
          v-for="suggestion in kidsSuggestions"
          :key="suggestion.text"
          @click="selectSuggestion(suggestion.text)"
          class="suggestion-card"
          type="button"
        >
          <div class="suggestion-emoji">{{ suggestion.emoji }}</div>
          <div class="suggestion-text">{{ suggestion.text }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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
const isFocused = ref(false)

const kidsSuggestions = [
  { emoji: '❤️', text: 'How much does God love me?' },
  { emoji: '🙏', text: 'How should I pray to God?' },
  { emoji: '👶', text: 'Who is baby Jesus?' },
  { emoji: '🌈', text: 'Why did God make rainbows?' },
  { emoji: '😇', text: 'How can I be good like Jesus?' },
  { emoji: '🐑', text: 'Why does Jesus call us sheep?' },
  { emoji: '🌟', text: 'What happened when Jesus was born?' },
  { emoji: '🕊️', text: 'What is the Holy Spirit?' }
]

const placeholders = [
  "Who is God? 🤔",
  "Why did Jesus come to Earth? 🌍",
  "How can I pray? 🙏",
  "What is heaven like? ☁️",
  "Why should I be kind? 💝"
]

const mascotMessages = [
  "I'm here to help you learn about God! 🦁",
  "Ask me anything about the Bible! 📖",
  "God loves curious kids like you! ❤️",
  "Let's discover God's amazing stories! ✨",
  "I can't wait to share Bible truths with you! 🌟"
]

const currentPlaceholder = ref(placeholders[0])
const mascotMessage = ref(mascotMessages[0])

// Rotate placeholders and mascot messages
let placeholderIndex = 0
let mascotIndex = 0

const rotatePlaceholder = () => {
  if (!isFocused.value && !localQuestion.value.trim()) {
    placeholderIndex = (placeholderIndex + 1) % placeholders.length
    currentPlaceholder.value = placeholders[placeholderIndex]
  }
}

const rotateMascotMessage = () => {
  mascotIndex = (mascotIndex + 1) % mascotMessages.length
  mascotMessage.value = mascotMessages[mascotIndex]
}

// Set up intervals for rotation
setInterval(rotatePlaceholder, 3000)
setInterval(rotateMascotMessage, 5000)

const charCountClasses = computed(() => {
  const percentage = (localQuestion.value.length / 300) * 100
  return {
    'char-count-text': true,
    'char-count--warning': percentage >= 80 && percentage < 100,
    'char-count--danger': percentage >= 100
  }
})

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

const clearQuestion = () => {
  localQuestion.value = ''
}

const selectSuggestion = (suggestion) => {
  localQuestion.value = suggestion
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}
</script>

<style scoped>
.kids-question-form {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: var(--spacing-2xl);
  box-shadow: 0 20px 40px rgba(255, 107, 157, 0.2);
  border: 3px solid rgba(255, 107, 157, 0.3);
  position: relative;
  overflow: hidden;
}

.kids-question-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #ff6b9d, #c44569, #f8b500, #ff6b9d);
  background-size: 200% 100%;
  animation: rainbow-border 3s linear infinite;
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.form-mascot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.mascot-character {
  font-size: 3rem;
  animation: mascot-bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 157, 0.3));
}

@keyframes mascot-bounce {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

.mascot-speech {
  position: relative;
}

.speech-bubble {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border: 2px solid #ff6b9d;
  border-radius: 15px;
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: #2d3748;
  font-weight: var(--font-weight-semibold);
  max-width: 200px;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
}

.speech-bubble::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #ff6b9d;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}

.form-title-section {
  flex: 1;
}

.kids-form-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  color: #2d3748;
  margin: 0 0 var(--spacing-sm) 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.kids-form-subtitle {
  font-size: var(--font-size-base);
  color: #2d3748;
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.kids-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.question-input-wrapper {
  position: relative;
}

.kids-label {
  display: block;
  margin-bottom: var(--spacing-md);
}

.label-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
}

.label-emoji {
  font-size: 1.2rem;
  animation: emoji-pulse 2s ease-in-out infinite;
}

@keyframes emoji-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.kids-textarea {
  width: 100%;
  padding: var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-family: inherit;
  line-height: var(--line-height-relaxed);
  border: 3px solid #ff6b9d;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff 0%, #fef7ff 100%);
  color: #2d3748;
  resize: vertical;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.1);
}

.kids-textarea::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.kids-textarea:focus {
  outline: none;
  border-color: #c44569;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.2), 0 8px 25px rgba(255, 107, 157, 0.2);
  background: #fff;
  transform: translateY(-2px);
}

.kids-textarea:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.char-count {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.char-count-text {
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 15px;
  border: 2px solid #ff6b9d;
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.2);
}

.char-count--warning {
  border-color: #f8b500;
  color: #d69e2e;
  background: rgba(248, 181, 0, 0.1);
}

.char-count--danger {
  border-color: #e53e3e;
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
}

.kids-submit-button {
  flex: 1;
  max-width: 300px;
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.kids-submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.kids-submit-button:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 107, 157, 0.5);
}

.kids-submit-button:hover:not(:disabled)::before {
  left: 100%;
}

.kids-submit-button:active:not(:disabled) {
  transform: translateY(-1px) scale(0.98);
}

.kids-submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.2);
}

.button-content,
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.button-emoji {
  font-size: 1.3rem;
  animation: button-emoji-bounce 2s ease-in-out infinite;
}

@keyframes button-emoji-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.loading-emoji {
  font-size: 1.3rem;
  animation: loading-spin 2s linear infinite;
}

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.kids-clear-button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #4a5568;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.kids-clear-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(160, 174, 192, 0.3);
}

.kids-loading {
  text-align: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(196, 69, 105, 0.1) 100%);
  border-radius: 20px;
  border: 2px solid rgba(255, 107, 157, 0.2);
}

.loading-characters {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.loading-char {
  font-size: 2rem;
  animation: loading-bounce 1.5s ease-in-out infinite;
}

.loading-char--1 { animation-delay: 0s; }
.loading-char--2 { animation-delay: 0.3s; }
.loading-char--3 { animation-delay: 0.6s; }

@keyframes loading-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.loading-text {
  font-size: var(--font-size-base);
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.question-suggestions {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 3px dashed rgba(255, 107, 157, 0.3);
}

.suggestions-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.title-emoji {
  font-size: 1.5rem;
  animation: title-emoji-glow 2s ease-in-out infinite;
}

@keyframes title-emoji-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 2px solid rgba(255, 107, 157, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.1);
}

.suggestion-card:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-color: #ff6b9d;
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.3);
}

.suggestion-emoji {
  font-size: 2rem;
  animation: suggestion-wiggle 3s ease-in-out infinite;
}

@keyframes suggestion-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

.suggestion-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  text-align: center;
  line-height: var(--line-height-tight);
}

/* Responsive Design */
@media (max-width: 768px) {
  .kids-question-form {
    padding: var(--spacing-xl);
  }
  
  .form-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }
  
  .kids-form-title {
    font-size: var(--font-size-xl);
  }
  
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .kids-submit-button {
    max-width: none;
  }
  
  .suggestions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .kids-question-form {
    padding: var(--spacing-lg);
  }
  
  .mascot-character {
    font-size: 2.5rem;
  }
  
  .kids-form-title {
    font-size: var(--font-size-lg);
  }
  
  .kids-textarea {
    font-size: var(--font-size-base);
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
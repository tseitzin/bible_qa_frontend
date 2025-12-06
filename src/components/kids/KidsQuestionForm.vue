<template>
  <div class="kids-question-form animate-bounce-in">
    <div class="form-header">
      <div class="mascot-section">
        <div class="mascot">
          <div class="mascot-character">🦁</div>
          <div class="mascot-sparkles">
            <span class="sparkle">✨</span>
            <span class="sparkle">⭐</span>
            <span class="sparkle">💫</span>
          </div>
        </div>
        <div class="speech-bubble">
          <div class="bubble-content">
            {{ currentMessage }}
          </div>
        </div>
      </div>
      
      <div class="form-title-section">
        <h2 class="kids-form-title">Ask Me Anything! 🌟</h2>
        <p class="kids-form-subtitle">What do you want to know about God and the Bible?</p>
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit" class="kids-form">
      <div class="question-input-wrapper">
        <label class="kids-label">
          <span class="label-emoji">💭</span>
          Your Question
        </label>
        
        <div class="textarea-container">
          <textarea
            v-model="localQuestion"
            :placeholder="currentPlaceholder"
            :disabled="loading"
            maxlength="300"
            rows="4"
            class="kids-textarea"
            @input="handleInput"
          />
          
          <!-- Speech Button -->
          <button
            v-if="speechSupported"
            @click="toggleSpeech"
            :disabled="loading"
            type="button"
            class="kids-speech-button"
            :class="{ 'kids-speech-button--listening': isListening }"
          >
            <span class="speech-emoji">{{ isListening ? '🔴' : '🎤' }}</span>
          </button>
          
          <!-- Character Count -->
          <div class="kids-char-count">
            <span :class="charCountClasses">{{ localQuestion.length }}/300</span>
          </div>
        </div>
        
        <!-- Speech Status -->
        <div v-if="isListening" class="speech-status">
          <div class="listening-animation">
            <span class="music-note">🎵</span>
            <span class="music-note">🎶</span>
            <span class="music-note">🎵</span>
          </div>
          <span class="listening-text">I'm listening... speak now! 👂</span>
        </div>
        
        <!-- Speech Error -->
        <div v-if="speechError" class="kids-speech-error">
          <span class="error-emoji">😅</span>
          <span>{{ speechError }}</span>
          <button @click="speechError = ''" class="error-dismiss">❌</button>
        </div>
      </div>
      
      <div class="form-actions">
        <button
          type="submit"
          :disabled="loading || !localQuestion.trim()"
          class="kids-submit-button"
          :class="{ 'kids-submit-button--loading': loading }"
        >
          <span v-if="!loading" class="submit-content">
            <span class="submit-emoji">🚀</span>
            Ask Question!
          </span>
          <span v-else class="loading-content">
            <span class="loading-emoji">⏳</span>
            Thinking...
          </span>
        </button>
        
        <button
          v-if="localQuestion.trim()"
          type="button"
          @click="clearQuestion"
          :disabled="loading"
          class="kids-clear-button"
        >
          <span class="clear-emoji">🗑️</span>
          Clear
        </button>
      </div>
      
      <div v-if="loading" class="kids-loading-section">
        <div class="loading-character">🔍</div>
        <div class="loading-text">
          <p class="loading-primary">Looking through the Bible for you! 📖</p>
          <p class="loading-secondary">Finding the perfect answer... ✨</p>
        </div>
      </div>
    </form>
    
    <!-- Fun Suggestions -->
    <div v-if="!localQuestion.trim() && !loading" class="kids-suggestions">
      <h3 class="suggestions-title">
        <span class="title-emoji">💡</span>
        Try asking about these!
      </h3>
      <div class="suggestions-grid">
        <button
          v-for="suggestion in kidsSuggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="kids-suggestion-button"
          type="button"
        >
          <span class="suggestion-emoji">{{ getRandomEmoji() }}</span>
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useSpeechToText } from '../../composables/useSpeechToText.js'

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

const emit = defineEmits(['update:question', 'submit', 'clear'])

const localQuestion = ref(props.question)
const speechError = ref('')
const currentMessageIndex = ref(0)
const currentPlaceholderIndex = ref(0)

// Speech-to-text functionality
const {
  isListening,
  isSupported: speechSupported,
  transcript,
  error: speechApiError,
  startListening,
  stopListening,
  clearTranscript
} = useSpeechToText()

const mascotMessages = [
  "Hi there! What would you like to know? 🌟",
  "Ask me anything about God and the Bible! 📖",
  "I love answering questions! What's yours? ❤️",
  "Ready to learn something amazing? 🚀",
  "God loves curious kids like you! 💕"
]

const placeholders = [
  "How much does God love me? 💖",
  "Who is baby Jesus? 👶",
  "Why did God make animals? 🦁",
  "What is prayer? 🙏",
  "Who is my guardian angel? 👼",
  "Why is the sky blue? 🌤️"
]

const kidsSuggestions = [
  "How much does God love me?",
  "Who is baby Jesus?",
  "Why did God make animals?",
  "What is prayer?",
  "Who is my guardian angel?",
  "What happens in heaven?",
  "Why should I be kind?",
  "Who was Noah?"
]

const suggestionEmojis = ['🌟', '💖', '🦋', '🌈', '✨', '🎈', '🌸', '🦁']

const currentMessage = ref(mascotMessages[0])
const currentPlaceholder = ref(placeholders[0])

// Character count styling
const charCountClasses = ref({
  'char-count': true,
  'char-count--warning': false,
  'char-count--danger': false
})

// Rotate messages and placeholders
let messageInterval, placeholderInterval

onMounted(() => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % mascotMessages.length
    currentMessage.value = mascotMessages[currentMessageIndex.value]
  }, 4000)
  
  placeholderInterval = setInterval(() => {
    currentPlaceholderIndex.value = (currentPlaceholderIndex.value + 1) % placeholders.length
    currentPlaceholder.value = placeholders[currentPlaceholderIndex.value]
  }, 3000)
})

onUnmounted(() => {
  if (messageInterval) clearInterval(messageInterval)
  if (placeholderInterval) clearInterval(placeholderInterval)
})

// Watch for speech transcript
watch(transcript, (newTranscript) => {
  if (newTranscript) {
    localQuestion.value = newTranscript
    clearTranscript()
  }
})

// Watch for speech errors
watch(speechApiError, (error) => {
  if (error) {
    speechError.value = getFriendlyErrorMessage(error)
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

// Update character count styling
watch(localQuestion, (newVal) => {
  const length = newVal.length
  const percentage = (length / 300) * 100
  
  charCountClasses.value = {
    'char-count': true,
    'char-count--warning': percentage >= 80 && percentage < 100,
    'char-count--danger': percentage >= 100
  }
})

const handleSubmit = () => {
  if (!localQuestion.value.trim() || props.loading) return
  emit('submit', localQuestion.value)
}

const handleInput = (event) => {
  localQuestion.value = event.target.value
}

const clearQuestion = () => {
  localQuestion.value = ''
  emit('clear')
}

const selectSuggestion = (suggestion) => {
  localQuestion.value = suggestion
}

const toggleSpeech = () => {
  if (isListening.value) {
    stopListening()
  } else {
    speechError.value = ''
    startListening()
  }
}

const getRandomEmoji = () => {
  return suggestionEmojis[Math.floor(Math.random() * suggestionEmojis.length)]
}

const getFriendlyErrorMessage = (error) => {
  const errorLower = error.toLowerCase()
  
  if (errorLower.includes('not-allowed') || errorLower.includes('denied')) {
    return "I need permission to use your microphone! Ask a grown-up to help! 🎤"
  } else if (errorLower.includes('no-speech')) {
    return "I didn't hear anything! Try speaking a little louder! 📢"
  } else if (errorLower.includes('network')) {
    return "Oops! Check your internet connection! 🌐"
  } else {
    return "Something went wrong, but that's okay! Try again! 😊"
  }
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

@keyframes rainbow-border {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.mascot-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-shrink: 0;
}

.mascot {
  position: relative;
}

.mascot-character {
  font-size: 4rem;
  animation: mascot-bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 157, 0.3));
}

@keyframes mascot-bounce {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.mascot-sparkles {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1.2rem;
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.5s;
}

.sparkle:nth-child(3) {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 1s;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.speech-bubble {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border: 3px solid #ff6b9d;
  border-radius: 20px;
  padding: var(--spacing-lg);
  position: relative;
  max-width: 250px;
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.2);
}

.speech-bubble::before {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 30px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid #ff6b9d;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 33px;
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid #fff;
}

.bubble-content {
  font-size: var(--font-size-sm);
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  text-align: center;
  line-height: var(--line-height-normal);
}

.form-title-section {
  flex: 1;
  text-align: center;
}

.kids-form-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-sm) 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

.kids-form-subtitle {
  font-size: var(--font-size-base);
  color: #2d3748;
  margin: 0;
  font-weight: var(--font-weight-bold);
}

.kids-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.question-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kids-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
}

.label-emoji {
  font-size: 1.3rem;
  animation: emoji-wiggle 2s ease-in-out infinite;
}

@keyframes emoji-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

.textarea-container {
  position: relative;
}

.kids-textarea {
  width: 100%;
  padding: var(--spacing-lg);
  padding-right: 80px;
  font-size: var(--font-size-lg);
  font-family: 'Comic Sans MS', cursive, system-ui;
  line-height: var(--line-height-relaxed);
  border: 3px solid #ff6b9d;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff 0%, #fef7ff 100%);
  color: #2d3748;
  resize: vertical;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-semibold);
}

.kids-textarea::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.kids-textarea:focus {
  outline: none;
  border-color: #c44569;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.2);
  background: #fff;
}

.kids-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kids-speech-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
}

.kids-speech-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
}

.kids-speech-button--listening {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  animation: pulse-recording 1s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.kids-speech-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.speech-emoji {
  font-size: 1.5rem;
}

.kids-char-count {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.char-count {
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 15px;
  border: 2px solid #ff6b9d;
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.2);
}

.char-count--warning {
  color: #ed8936;
  border-color: #ed8936;
  background: rgba(237, 137, 54, 0.1);
}

.char-count--danger {
  color: #e53e3e;
  border-color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.speech-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%);
  border: 2px solid rgba(66, 153, 225, 0.3);
  border-radius: 20px;
  color: #2d3748;
  font-weight: var(--font-weight-bold);
}

.listening-animation {
  display: flex;
  gap: var(--spacing-xs);
}

.music-note {
  font-size: 1.2rem;
  animation: music-bounce 0.6s ease-in-out infinite;
}

.music-note:nth-child(1) { animation-delay: 0s; }
.music-note:nth-child(2) { animation-delay: 0.2s; }
.music-note:nth-child(3) { animation-delay: 0.4s; }

@keyframes music-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.listening-text {
  font-size: var(--font-size-base);
}

.kids-speech-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, rgba(197, 48, 48, 0.1) 100%);
  border: 2px solid rgba(229, 62, 62, 0.3);
  border-radius: 20px;
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.error-emoji {
  font-size: 1.2rem;
}

.error-dismiss {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin-left: auto;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.kids-submit-button {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: 'Comic Sans MS', cursive, system-ui;
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.kids-submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
}

.kids-submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.kids-submit-button--loading {
  animation: button-pulse 1s ease-in-out infinite;
}

@keyframes button-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.submit-content,
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.submit-emoji,
.loading-emoji {
  font-size: 1.3rem;
  animation: emoji-bounce 2s ease-in-out infinite;
}

@keyframes emoji-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.kids-clear-button {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #4a5568;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: 'Comic Sans MS', cursive, system-ui;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 15px rgba(160, 174, 192, 0.3);
}

.kids-clear-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
  transform: translateY(-2px);
}

.clear-emoji {
  font-size: 1.1rem;
}

.kids-loading-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%);
  border: 3px solid rgba(72, 187, 120, 0.3);
  border-radius: 25px;
  text-align: center;
}

.loading-character {
  font-size: 3rem;
  animation: loading-spin 2s linear infinite;
}

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  flex: 1;
}

.loading-primary {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0 0 var(--spacing-xs) 0;
}

.loading-secondary {
  font-size: var(--font-size-base);
  color: #4a5568;
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.kids-suggestions {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 3px dashed rgba(255, 107, 157, 0.3);
}

.suggestions-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0 0 var(--spacing-lg) 0;
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

.kids-suggestion-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 2px solid rgba(255, 107, 157, 0.3);
  border-radius: 20px;
  color: #2d3748;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
  font-family: 'Comic Sans MS', cursive, system-ui;
}

.kids-suggestion-button:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-color: #ff6b9d;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.3);
}

.suggestion-emoji {
  font-size: 1.3rem;
  animation: suggestion-wiggle 3s ease-in-out infinite;
}

@keyframes suggestion-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
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
  
  .mascot-section {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .speech-bubble {
    max-width: 200px;
  }
  
  .kids-form-title {
    font-size: var(--font-size-xl);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .kids-submit-button {
    min-width: auto;
  }
  
  .kids-loading-section {
    flex-direction: column;
    text-align: center;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .kids-question-form {
    padding: var(--spacing-lg);
  }
  
  .mascot-character {
    font-size: 3rem;
  }
  
  .speech-bubble {
    max-width: 180px;
  }
  
  .bubble-content {
    font-size: var(--font-size-xs);
  }
}
</style>
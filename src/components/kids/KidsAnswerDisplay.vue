<template>
  <transition name="kids-answer-appear" appear>
    <div v-if="answer" class="kids-answer-display animate-bounce-in">
      <div class="answer-header">
        <div class="header-character">
          <div class="character-icon">{{ currentCharacter }}</div>
          <div class="character-sparkles">
            <span class="sparkle">✨</span>
            <span class="sparkle">⭐</span>
            <span class="sparkle">💫</span>
          </div>
        </div>
        <div class="header-content">
          <h3 class="answer-title">Here's what I found! 🎉</h3>
          <p class="answer-subtitle">A special answer just for you!</p>
        </div>
        <div class="answer-badge">
          <span class="badge-emoji">✅</span>
          <span>Bible Answer</span>
        </div>
      </div>
      
      <div class="answer-content">
        <div class="answer-text-wrapper">
          <!-- Biblical Image Section -->
          <div v-if="image || imageLoading" class="answer-image-section">
            <div v-if="imageLoading" class="image-loading">
              <div class="image-loading-spinner">🎨</div>
              <p class="image-loading-text">Creating a special picture for you...</p>
            </div>
            <div v-else-if="image" class="answer-image-wrapper">
              <img 
                :src="image" 
                :alt="`Biblical illustration for: ${question}`"
                class="answer-image"
                @error="handleImageError"
              />
              <div class="image-caption">
                <span class="caption-emoji">🎨</span>
                A special picture just for your question!
              </div>
            </div>
          </div>
          
          <div class="answer-text">{{ answer }}</div>
          
          <!-- Fun reading info -->
          <div class="reading-info">
            <span class="reading-emoji">⏰</span>
            <span>{{ readingTime }} minute{{ readingTime !== 1 ? 's' : '' }} to read</span>
            <span class="word-info">
              <span class="word-emoji">📝</span>
              {{ wordCount }} words
            </span>
          </div>
        </div>
        
        <div class="answer-actions">
          <div class="action-buttons">
            <button
              @click="copyAnswer"
              :class="['kids-action-button', 'kids-action-button--copy', { 'kids-action-button--success': copySuccess }]"
            >
              <span class="action-emoji">{{ copySuccess ? '✅' : '📋' }}</span>
              {{ copySuccess ? 'Copied!' : 'Copy' }}
            </button>
            
            <button
              @click="shareAnswer"
              class="kids-action-button kids-action-button--share"
            >
              <span class="action-emoji">📤</span>
              Share
            </button>
            
            <button
              @click="saveAnswer"
              :class="['kids-action-button', 'kids-action-button--save', { 'kids-action-button--success': saveSuccess }]"
              :disabled="saving"
            >
              <span class="action-emoji">{{ saveSuccess ? '💖' : '💾' }}</span>
              {{ saveSuccess ? 'Saved!' : 'Save' }}
            </button>
          </div>
          
          <div class="answer-time">
            <span class="time-emoji">🕐</span>
            <span>{{ formattedTime }}</span>
          </div>
        </div>
      </div>
      
      <!-- Fun feedback section -->
      <div class="kids-feedback">
        <div class="feedback-header">
          <span class="feedback-emoji">🤗</span>
          <span class="feedback-title">Did this help you learn?</span>
        </div>
        <div class="feedback-buttons">
          <button @click="provideFeedback('yes')" class="feedback-button feedback-button--yes">
            <span class="feedback-emoji-button">😊</span>
            Yes!
          </button>
          <button @click="provideFeedback('no')" class="feedback-button feedback-button--no">
            <span class="feedback-emoji-button">😕</span>
            Not really
          </button>
        </div>
      </div>
      
      <!-- Encouragement message -->
      <div class="encouragement">
        <div class="encouragement-character">🌟</div>
        <p class="encouragement-text">{{ encouragementMessage }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

const emit = defineEmits(['answerSaved'])

const props = defineProps({
  answer: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  imageLoading: {
    type: Boolean,
    default: false
  }
})

const copySuccess = ref(false)
const saveSuccess = ref(null)
const saving = ref(false)

const characters = ['🦁', '🐑', '🕊️', '👼', '⭐']
const currentCharacter = ref(characters[Math.floor(Math.random() * characters.length)])

const encouragementMessages = [
  "Keep asking questions! God loves curious kids! 🌟",
  "You're learning so much about God! Keep it up! 💪",
  "Great question! God is so happy when we want to learn! 😊",
  "Wow! You're becoming a Bible expert! 🎓",
  "God loves it when kids like you ask questions! ❤️"
]

const encouragementMessage = ref(encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)])

const formattedTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
})

const wordCount = computed(() => {
  return props.answer.split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wordsPerMinute = 100 // Slower reading speed for kids
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return Math.max(1, minutes)
})

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.answer)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const shareAnswer = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Kids Bible Q&A Answer',
        text: props.answer,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  } else {
    copyAnswer()
  }
}

const saveAnswer = async () => {
  if (saving.value) return
  
  try {
    saving.value = true
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const question = props.question || ''
    const result = savedAnswersService.save(question, props.answer)
    
    if (result.success) {
      saveSuccess.value = true
      emit('answerSaved', result.id)
      
      // Change character and encouragement message
      currentCharacter.value = characters[Math.floor(Math.random() * characters.length)]
      encouragementMessage.value = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
    } else {
      saveSuccess.value = false
    }
    
    setTimeout(() => {
      saveSuccess.value = null
    }, 3000)
  } catch (error) {
    console.error('Failed to save answer:', error)
    saveSuccess.value = false
    
    setTimeout(() => {
      saveSuccess.value = null
    }, 3000)
  } finally {
    saving.value = false
  }
}

const provideFeedback = (type) => {
  console.log(`Kids feedback: ${type}`)
  // Could add fun animations or sounds here
}

const handleImageError = () => {
  console.warn('Failed to load generated image')
  // Could emit an event to parent to handle image error
}
</script>

<style scoped>
.kids-answer-display {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 3px solid rgba(255, 107, 157, 0.3);
  box-shadow: 0 20px 40px rgba(255, 107, 157, 0.2);
  overflow: hidden;
  margin-top: var(--spacing-xl);
  position: relative;
}

.kids-answer-display::before {
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

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  position: relative;
}

.header-character {
  position: relative;
  flex-shrink: 0;
}

.character-icon {
  font-size: 3rem;
  animation: character-dance 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes character-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(5deg) scale(1.05); }
  75% { transform: rotate(-5deg) scale(0.95); }
}

.character-sparkles {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1rem;
  animation: sparkle-orbit 3s linear infinite;
}

.sparkle:nth-child(1) {
  top: 0;
  left: 50%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 50%;
  right: 0;
  animation-delay: 1s;
}

.sparkle:nth-child(3) {
  bottom: 0;
  left: 0;
  animation-delay: 2s;
}

@keyframes sparkle-orbit {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.5); }
}

.header-content {
  flex: 1;
}

.answer-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-xs) 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.answer-subtitle {
  font-size: var(--font-size-base);
  margin: 0;
  opacity: 0.9;
  font-weight: var(--font-weight-semibold);
}

.answer-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  color: #ff6b9d;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.badge-emoji {
  font-size: 1.2rem;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.answer-content {
  padding: var(--spacing-2xl);
}

.answer-text-wrapper {
  margin-bottom: var(--spacing-xl);
}

.answer-image-section {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.image-loading {
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%);
  border: 3px dashed rgba(72, 187, 120, 0.3);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.image-loading-spinner {
  font-size: 3rem;
  animation: image-loading-spin 2s linear infinite;
}

@keyframes image-loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-loading-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0;
}

.answer-image-wrapper {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  border: 3px solid rgba(255, 107, 157, 0.3);
  border-radius: 25px;
  padding: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(255, 107, 157, 0.2);
}

.answer-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all var(--transition-normal);
}

.answer-image:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.image-caption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
}

.caption-emoji {
  font-size: 1.2rem;
  animation: caption-glow 2s ease-in-out infinite;
}

@keyframes caption-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.answer-text {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: #2d3748;
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(196, 69, 105, 0.05) 100%);
  padding: var(--spacing-lg);
  border-radius: 20px;
  border: 2px solid rgba(255, 107, 157, 0.2);
}

.reading-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #4a5568;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  justify-content: center;
  flex-wrap: wrap;
}

.reading-emoji,
.word-emoji {
  font-size: 1.2rem;
  animation: info-bounce 2s ease-in-out infinite;
}

@keyframes info-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.word-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.answer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xl);
  border-top: 3px dashed rgba(255, 107, 157, 0.3);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

.kids-action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.kids-action-button--copy {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.kids-action-button--share {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.kids-action-button--save {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
}

.kids-action-button--success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
  transform: scale(1.05);
}

.kids-action-button:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.kids-action-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
}

.kids-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-emoji {
  font-size: 1.2rem;
  animation: action-emoji-wiggle 2s ease-in-out infinite;
}

@keyframes action-emoji-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

.answer-time {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: #4a5568;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.time-emoji {
  font-size: 1.1rem;
}

.kids-feedback {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(248, 181, 0, 0.1) 0%, rgba(237, 137, 54, 0.1) 100%);
  border-top: 3px dashed rgba(248, 181, 0, 0.3);
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.feedback-emoji {
  font-size: 1.5rem;
  animation: feedback-emoji-bounce 2s ease-in-out infinite;
}

@keyframes feedback-emoji-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.feedback-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
}

.feedback-buttons {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
}

.feedback-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 2px solid rgba(255, 107, 157, 0.3);
  border-radius: 20px;
  color: #2d3748;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.feedback-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.3);
}

.feedback-button--yes:hover {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(56, 161, 105, 0.2) 100%);
  border-color: #48bb78;
  color: #2f855a;
}

.feedback-button--no:hover {
  background: linear-gradient(135deg, rgba(237, 137, 54, 0.2) 0%, rgba(221, 107, 32, 0.2) 100%);
  border-color: #ed8936;
  color: #c05621;
}

.feedback-emoji-button {
  font-size: 1.3rem;
}

.encouragement {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%);
  border-top: 3px dashed rgba(72, 187, 120, 0.3);
  text-align: center;
}

.encouragement-character {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  animation: encouragement-glow 2s ease-in-out infinite;
}

@keyframes encouragement-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.encouragement-text {
  font-size: var(--font-size-base);
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Animations */
.kids-answer-appear-enter-active {
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.kids-answer-appear-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.8);
}

.kids-answer-appear-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .answer-header {
    padding: var(--spacing-lg);
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .answer-content {
    padding: var(--spacing-xl);
  }
  
  .answer-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .feedback-buttons {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .feedback-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .answer-text {
    font-size: var(--font-size-base);
  }
  
  .answer-image {
    max-width: 300px;
  }
  
  .image-loading {
    padding: var(--spacing-xl);
  }
  
  .image-loading-spinner {
    font-size: 2.5rem;
  }
  
  .character-icon {
    font-size: 2.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .kids-action-button {
    justify-content: center;
    width: 100%;
  }
}
</style>
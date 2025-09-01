<template>
  <transition name="kids-error-appear">
    <div v-if="error" class="kids-error-message" role="alert" aria-live="polite">
      <div class="error-content">
        <div class="error-character">
          <div class="sad-character">😔</div>
          <div class="comfort-sparkles">
            <span class="comfort-sparkle">💙</span>
            <span class="comfort-sparkle">💚</span>
            <span class="comfort-sparkle">💜</span>
          </div>
        </div>
        
        <div class="error-text-content">
          <h4 class="kids-error-title">Oops! Something went wrong 😅</h4>
          <p class="kids-error-text">{{ friendlyErrorMessage }}</p>
          
          <div class="error-suggestions">
            <p class="suggestions-title">
              <span class="suggestions-emoji">💡</span>
              Let's try these ideas:
            </p>
            <ul class="kids-suggestions-list">
              <li>
                <span class="suggestion-emoji">🔌</span>
                Check if your internet is working
              </li>
              <li>
                <span class="suggestion-emoji">🔄</span>
                Try asking your question again
              </li>
              <li>
                <span class="suggestion-emoji">🤔</span>
                Make sure your question is clear
              </li>
              <li>
                <span class="suggestion-emoji">👨‍👩‍👧‍👦</span>
                Ask your parents or teacher for help
              </li>
            </ul>
          </div>
        </div>
        
        <div class="error-actions">
          <button
            @click="$emit('dismiss')"
            class="kids-dismiss-button"
          >
            <span class="button-emoji">👍</span>
            Okay!
          </button>
          
          <button
            @click="retryAction"
            class="kids-retry-button"
          >
            <span class="button-emoji">🔄</span>
            Try Again
          </button>
        </div>
      </div>
      
      <!-- Comfort message -->
      <div class="comfort-section">
        <div class="comfort-character">🤗</div>
        <p class="comfort-message">
          Don't worry! Even when things don't work perfectly, God is always with you! 💕
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dismiss', 'retry'])

const friendlyErrorMessage = computed(() => {
  const error = props.error.toLowerCase()
  
  if (error.includes('network') || error.includes('connection')) {
    return "It looks like there's a problem with the internet connection. Let's check that!"
  } else if (error.includes('server') || error.includes('service')) {
    return "The computer that helps answer questions is taking a little break. Let's try again in a moment!"
  } else if (error.includes('timeout')) {
    return "The answer is taking too long to find. Let's try asking again!"
  } else {
    return "Something unexpected happened, but don't worry - we can try again!"
  }
})

const retryAction = () => {
  emit('retry')
  emit('dismiss')
}
</script>

<style scoped>
.kids-error-message {
  margin-top: var(--spacing-xl);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 3px solid rgba(237, 137, 54, 0.4);
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(237, 137, 54, 0.2);
  overflow: hidden;
  position: relative;
}

.kids-error-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #ed8936, #dd6b20, #f6ad55, #ed8936);
  background-size: 200% 100%;
  animation: rainbow-border 3s linear infinite;
}

.error-content {
  padding: var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.error-character {
  position: relative;
  flex-shrink: 0;
}

.sad-character {
  font-size: 3rem;
  animation: sad-sway 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(237, 137, 54, 0.3));
}

@keyframes sad-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-3deg); }
}

.comfort-sparkles {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  pointer-events: none;
}

.comfort-sparkle {
  position: absolute;
  font-size: 1rem;
  animation: comfort-float 4s ease-in-out infinite;
}

.comfort-sparkle:nth-child(1) {
  top: 0;
  right: 0;
  animation-delay: 0s;
}

.comfort-sparkle:nth-child(2) {
  bottom: 0;
  left: 0;
  animation-delay: 1.3s;
}

.comfort-sparkle:nth-child(3) {
  top: 50%;
  left: -10px;
  animation-delay: 2.6s;
}

@keyframes comfort-float {
  0%, 100% { opacity: 0.3; transform: translateY(0px); }
  50% { opacity: 1; transform: translateY(-8px); }
}

.error-text-content {
  flex: 1;
  min-width: 0;
}

.kids-error-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-sm) 0;
  color: #2d3748;
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.kids-error-text {
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-lg) 0;
  color: #2d3748;
  line-height: var(--line-height-relaxed);
  font-weight: var(--font-weight-semibold);
}

.error-suggestions {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 2px solid rgba(237, 137, 54, 0.3);
  border-radius: 20px;
  padding: var(--spacing-lg);
}

.suggestions-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.suggestions-emoji {
  font-size: 1.2rem;
  animation: suggestions-glow 2s ease-in-out infinite;
}

@keyframes suggestions-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.kids-suggestions-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kids-suggestions-list li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: #2d3748;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.suggestion-emoji {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.kids-dismiss-button,
.kids-retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  min-width: 120px;
}

.kids-dismiss-button {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #4a5568;
  box-shadow: 0 4px 15px rgba(160, 174, 192, 0.3);
}

.kids-retry-button {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
}

.kids-dismiss-button:hover {
  background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
  transform: translateY(-2px) scale(1.05);
}

.kids-retry-button:hover {
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  transform: translateY(-2px) scale(1.05);
}

.button-emoji {
  font-size: 1.2rem;
  animation: button-emoji-wiggle 2s ease-in-out infinite;
}

@keyframes button-emoji-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

.comfort-section {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%);
  border-top: 3px dashed rgba(72, 187, 120, 0.3);
  text-align: center;
}

.comfort-character {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
  animation: comfort-hug 3s ease-in-out infinite;
}

@keyframes comfort-hug {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.comfort-message {
  font-size: var(--font-size-base);
  color: #2d3748;
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Animations */
.kids-error-appear-enter-active,
.kids-error-appear-leave-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.kids-error-appear-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.8);
}

.kids-error-appear-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-xl);
  }
  
  .error-actions {
    flex-direction: row;
    justify-content: center;
    margin-top: var(--spacing-lg);
  }
  
  .kids-dismiss-button,
  .kids-retry-button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .error-content {
    padding: var(--spacing-lg);
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .kids-dismiss-button,
  .kids-retry-button {
    width: 100%;
  }
}
</style>
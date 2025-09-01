<template>
  <div class="kids-saved-answers">
    <div class="kids-saved-header">
      <div class="header-mascot">
        <div class="mascot">📚</div>
        <div class="mascot-speech">
          <div class="speech-bubble">
            Look at all the cool things you've learned! 🌟
          </div>
        </div>
      </div>
      
      <div class="header-title">
        <h2 class="kids-saved-title">My Saved Answers</h2>
        <span v-if="savedAnswers.length > 0" class="kids-count-badge">
          <span class="badge-emoji">🎉</span>
          {{ savedAnswers.length }} awesome answer{{ savedAnswers.length !== 1 ? 's' : '' }}!
        </span>
      </div>
      
      <div class="header-actions">
        <div class="kids-search-container">
          <div class="search-icon">🔍</div>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search your saved answers..."
            class="kids-search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="search-clear"
            title="Clear search"
          >
            ❌
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="savedAnswers.length === 0" class="kids-empty-state">
      <div class="empty-character">📖</div>
      <h3 class="empty-title">No saved answers yet!</h3>
      <p class="empty-text">
        When you find awesome answers to your Bible questions, click the 
        <span class="save-example">💾 Save</span> button to keep them here! 
        Then you can read them again anytime! 🌟
      </p>
      <div class="empty-encouragement">
        <div class="encouragement-emoji">🚀</div>
        <span>Go ask your first question!</span>
      </div>
    </div>

    <!-- Filtered empty state -->
    <div v-else-if="filteredAnswers.length === 0" class="kids-empty-state">
      <div class="empty-character">🔍</div>
      <h3 class="empty-title">No matches found!</h3>
      <p class="empty-text">
        I couldn't find any saved answers that match "{{ searchQuery }}". 
        Try searching for something else! 😊
      </p>
    </div>

    <!-- Saved answers list -->
    <div v-else class="kids-answers-grid">
      <div
        v-for="(savedAnswer, index) in filteredAnswers"
        :key="savedAnswer.id"
        class="kids-answer-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="card-header">
          <div class="card-emoji">{{ getRandomEmoji() }}</div>
          <h3 class="card-question">{{ savedAnswer.question }}</h3>
          <div class="card-actions">
            <button
              @click="toggleExpanded(savedAnswer.id)"
              class="kids-expand-button"
              :class="{ 'kids-expand-button--active': expandedCards.has(savedAnswer.id) }"
            >
              <span class="expand-emoji">{{ expandedCards.has(savedAnswer.id) ? '🔼' : '🔽' }}</span>
            </button>
            <button
              @click="deleteAnswer(savedAnswer.id)"
              class="kids-delete-button"
              title="Delete this answer"
            >
              <span class="delete-emoji">🗑️</span>
            </button>
          </div>
        </div>

        <transition name="kids-card-expand">
          <div v-if="expandedCards.has(savedAnswer.id)" class="card-content">
            <div class="answer-text">{{ savedAnswer.answer }}</div>
            
            <div class="answer-meta">
              <div class="meta-item">
                <span class="meta-emoji">📅</span>
                <span>{{ formatKidsDate(savedAnswer.timestamp) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-emoji">📝</span>
                <span>{{ savedAnswer.wordCount }} words</span>
              </div>
            </div>

            <div v-if="savedAnswer.tags && savedAnswer.tags.length > 0" class="kids-tags">
              <span
                v-for="tag in savedAnswer.tags"
                :key="tag"
                class="kids-tag"
              >
                <span class="tag-emoji">🏷️</span>
                {{ tag }}
              </span>
            </div>

            <div class="card-bottom-actions">
              <button
                @click="copyAnswer(savedAnswer.answer)"
                class="kids-copy-button"
              >
                <span class="copy-emoji">📋</span>
                Copy Answer
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

const emit = defineEmits(['update'])

// Reactive data
const savedAnswers = ref([])
const searchQuery = ref('')
const expandedCards = ref(new Set())

// Fun emojis for cards
const cardEmojis = ['🌟', '💖', '🌈', '✨', '🎉', '🦋', '🌸', '🎈', '🍀', '🌺']

// Computed properties
const filteredAnswers = computed(() => {
  let filtered = savedAnswers.value || []

  if (searchQuery.value && searchQuery.value.trim()) {
    try {
      filtered = savedAnswersService.search(searchQuery.value.trim())
    } catch (error) {
      console.error('Search error:', error)
      filtered = []
    }
  }

  return filtered
})

// Methods
const loadSavedAnswers = () => {
  savedAnswers.value = savedAnswersService.getAll()
}

const deleteAnswer = (id) => {
  if (confirm('Are you sure you want to delete this saved answer? 🤔')) {
    const result = savedAnswersService.delete(id)
    if (result.success) {
      loadSavedAnswers()
      expandedCards.value.delete(id)
      emit('update')
    } else {
      console.error('Failed to delete answer:', result.message)
    }
  }
}

const toggleExpanded = (id) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}

const copyAnswer = async (answer) => {
  try {
    await navigator.clipboard.writeText(answer)
    // Could add a fun toast notification here
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const formatKidsDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today! 🌟'
  } else if (diffDays === 1) {
    return 'Yesterday 📅'
  } else if (diffDays < 7) {
    return `${diffDays} days ago 📆`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' 📅'
  }
}

const getRandomEmoji = () => {
  return cardEmojis[Math.floor(Math.random() * cardEmojis.length)]
}

// Lifecycle
onMounted(() => {
  loadSavedAnswers()
})

// Expose methods for parent components
defineExpose({
  refresh: loadSavedAnswers
})
</script>

<style scoped>
.kids-saved-answers {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.kids-saved-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: var(--spacing-2xl);
  box-shadow: 0 15px 35px rgba(255, 107, 157, 0.2);
  border: 3px solid rgba(255, 107, 157, 0.3);
}

.header-mascot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.mascot {
  font-size: 3rem;
  animation: mascot-wiggle 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 157, 0.3));
}

@keyframes mascot-wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(3deg) scale(1.05); }
  75% { transform: rotate(-3deg) scale(0.95); }
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
  font-weight: var(--font-weight-bold);
  max-width: 180px;
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

.header-title {
  flex: 1;
  text-align: center;
}

.kids-saved-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  color: #2d3748;
  margin: 0 0 var(--spacing-sm) 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.kids-count-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  margin: 0 auto;
  max-width: fit-content;
}

.badge-emoji {
  font-size: 1.1rem;
  animation: badge-celebrate 2s ease-in-out infinite;
}

@keyframes badge-celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.header-actions {
  flex-shrink: 0;
}

.kids-search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.kids-search-input {
  padding: var(--spacing-md) var(--spacing-lg);
  padding-left: var(--spacing-3xl);
  border: 3px solid #ff6b9d;
  border-radius: 25px;
  font-size: var(--font-size-base);
  background: linear-gradient(135deg, #fff 0%, #fef7ff 100%);
  color: #2d3748;
  width: 250px;
  transition: all var(--transition-normal);
  font-family: inherit;
  font-weight: var(--font-weight-semibold);
}

.kids-search-input:focus {
  outline: none;
  border-color: #c44569;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.2);
  background: #fff;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  font-size: 1.2rem;
  pointer-events: none;
  animation: search-bounce 2s ease-in-out infinite;
}

@keyframes search-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.search-clear {
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: rgba(255, 107, 157, 0.1);
  transform: scale(1.1);
}

.kids-empty-state {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 3px solid rgba(255, 107, 157, 0.3);
  box-shadow: 0 15px 35px rgba(255, 107, 157, 0.2);
}

.empty-character {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  animation: empty-float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 157, 0.3));
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  margin-bottom: var(--spacing-md);
  color: #2d3748;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-text {
  font-size: var(--font-size-base);
  color: #2d3748;
  max-width: 400px;
  margin: 0 auto var(--spacing-lg);
  line-height: var(--line-height-relaxed);
  font-weight: var(--font-weight-semibold);
}

.save-example {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 10px;
  font-weight: var(--font-weight-bold);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.empty-encouragement {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(56, 161, 105, 0.2) 100%);
  border: 2px solid rgba(72, 187, 120, 0.3);
  border-radius: 20px;
  padding: var(--spacing-lg);
  color: #2d3748;
  font-weight: var(--font-weight-bold);
}

.encouragement-emoji {
  font-size: 1.5rem;
  animation: encouragement-rocket 2s ease-in-out infinite;
}

@keyframes encouragement-rocket {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.kids-answers-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.kids-answer-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  border: 3px solid rgba(255, 107, 157, 0.3);
  border-radius: 25px;
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.15);
  animation: card-appear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.kids-answer-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(255, 107, 157, 0.25);
  border-color: #ff6b9d;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(196, 69, 105, 0.1) 100%);
  border-bottom: 2px solid rgba(255, 107, 157, 0.2);
}

.card-emoji {
  font-size: 1.8rem;
  animation: card-emoji-spin 4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes card-emoji-spin {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

.card-question {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  margin: 0;
  flex-grow: 1;
  line-height: var(--line-height-tight);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.kids-expand-button,
.kids-delete-button {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 107, 157, 0.3);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  font-size: 1.2rem;
}

.kids-expand-button:hover {
  border-color: #ff6b9d;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
}

.kids-expand-button--active {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  border-color: #ff6b9d;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
}

.kids-delete-button:hover {
  border-color: #e53e3e;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4);
}

.expand-emoji,
.delete-emoji {
  animation: emoji-pulse 2s ease-in-out infinite;
}

@keyframes emoji-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.card-content {
  padding: var(--spacing-lg);
}

.answer-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: #2d3748;
  margin-bottom: var(--spacing-lg);
  white-space: pre-wrap;
  font-weight: var(--font-weight-semibold);
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(196, 69, 105, 0.05) 100%);
  padding: var(--spacing-lg);
  border-radius: 15px;
  border: 2px solid rgba(255, 107, 157, 0.2);
}

.answer-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: #4a5568;
  font-weight: var(--font-weight-bold);
  background: rgba(255, 255, 255, 0.7);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 15px;
  border: 2px solid rgba(255, 107, 157, 0.2);
}

.meta-emoji {
  font-size: 1.1rem;
}

.kids-tags {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  justify-content: center;
}

.kids-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, #f8b500 0%, #ed8936 100%);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(248, 181, 0, 0.3);
}

.tag-emoji {
  font-size: 0.9rem;
}

.card-bottom-actions {
  display: flex;
  justify-content: center;
}

.kids-copy-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
}

.kids-copy-button:hover {
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
}

.copy-emoji {
  font-size: 1.2rem;
  animation: copy-wiggle 2s ease-in-out infinite;
}

@keyframes copy-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

/* Card expand animation */
.kids-card-expand-enter-active,
.kids-card-expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.kids-card-expand-enter-from,
.kids-card-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.kids-card-expand-enter-to,
.kids-card-expand-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .kids-saved-answers {
    padding: var(--spacing-lg);
  }
  
  .kids-saved-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }
  
  .kids-search-input {
    width: 100%;
  }
  
  .card-header {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .card-question {
    flex-basis: 100%;
    text-align: center;
    margin-bottom: var(--spacing-sm);
  }
  
  .card-actions {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .kids-saved-header {
    padding: var(--spacing-xl);
  }
  
  .mascot {
    font-size: 2.5rem;
  }
  
  .kids-saved-title {
    font-size: var(--font-size-xl);
  }
  
  .speech-bubble {
    max-width: 150px;
    font-size: var(--font-size-xs);
  }
}
</style>
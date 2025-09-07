<template>
  <div class="kids-app">
    <!-- Navigation Header -->
    <nav class="kids-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <div class="kids-logo-icon">
            🌟
          </div>
          <span>Kids Bible Q&A</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Adults</router-link>
          <router-link to="/kids" class="nav-link nav-link--active">Kids</router-link>
        </div>
      </div>
    </nav>

    <!-- Fun Background -->
    <div class="kids-background">
      <div class="rainbow-gradient"></div>
      <div class="floating-shapes">
        <div class="shape shape--star shape--1">⭐</div>
        <div class="shape shape--heart shape--2">💖</div>
        <div class="shape shape--rainbow shape--3">🌈</div>
        <div class="shape shape--dove shape--4">🕊️</div>
        <div class="shape shape--cross shape--5">✝️</div>
        <div class="shape shape--sun shape--6">☀️</div>
        <div class="shape shape--flower shape--7">🌸</div>
        <div class="shape shape--lamb shape--8">🐑</div>
      </div>
    </div>
    
    <div class="kids-container">
      <!-- Header Section -->
      <header class="kids-header animate-bounce-in">
        <div class="header-content">
          <div class="kids-logo-section">
            <div class="big-logo">
              <div class="logo-character">
                📖
              </div>
              <div class="sparkles">
                <span class="sparkle sparkle--1">✨</span>
                <span class="sparkle sparkle--2">⭐</span>
                <span class="sparkle sparkle--3">💫</span>
              </div>
            </div>
            <h1 class="kids-title">
              <span class="title-word title-word--1">Kids</span>
              <span class="title-word title-word--2">Bible</span>
              <span class="title-word title-word--3">Q&A</span>
            </h1>
            <p class="kids-subtitle">
              🌟 Ask questions about God, Jesus, and the Bible! 🌟
            </p>
          </div>
          
          <!-- Fun features -->
          <div class="fun-features">
            <div class="feature-bubble">
              <div class="bubble-emoji">🤔</div>
              <span>Ask Questions</span>
            </div>
            <div class="feature-bubble">
              <div class="bubble-emoji">📚</div>
              <span>Learn Stories</span>
            </div>
            <div class="feature-bubble">
              <div class="bubble-emoji">❤️</div>
              <span>Grow Faith</span>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="kids-main">
        <!-- Fun Navigation Tabs -->
        <div class="kids-nav-tabs">
          <button 
            @click="activeTab = 'ask'" 
            :class="['kids-tab', { 'kids-tab--active': activeTab === 'ask' }]"
          >
            <span class="tab-emoji">🙋‍♀️</span>
            Ask a Question
          </button>
          <button 
            @click="activeTab = 'saved'" 
            :class="['kids-tab', { 'kids-tab--active': activeTab === 'saved' }]"
          >
            <span class="tab-emoji">💾</span>
            My Saved Answers
            <span v-if="savedCount > 0" class="kids-badge">{{ savedCount }}</span>
          </button>
        </div>

        <!-- Ask Question Tab -->
        <div v-if="activeTab === 'ask'" class="kids-content animate-slide-in">
          <KidsQuestionForm
            v-model:question="question"
            :loading="loading"
            @submit="handleQuestionSubmit"
            class="kids-question-section"
          />
          
          <KidsAnswerDisplay 
            :answer="answer" 
            :question="question"
            :image="image"
            :image-loading="imageLoading"
            class="kids-answer-section"
            @answer-saved="handleAnswerSaved"
          />
          
          <KidsErrorMessage 
            :error="error" 
            @dismiss="clearError"
            class="kids-error-section"
          />
        </div>

        <!-- Saved Answers Tab -->
        <div v-else-if="activeTab === 'saved'" class="kids-saved-content animate-fade-in">
          <KidsSavedAnswers 
            ref="savedAnswersRef" 
            @update="handleSavedAnswersUpdated"
          />
        </div>
      </main>
      
      <!-- Fun Footer -->
      <footer class="kids-footer">
        <div class="footer-content">
          <div class="footer-character">
            <div class="character-bubble">
              <span class="character">🐑</span>
              <div class="speech-bubble">
                Remember to always ask your parents or Sunday school teacher about important questions too! 
                God loves you! 💕
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import KidsQuestionForm from '../components/kids/KidsQuestionForm.vue'
import KidsAnswerDisplay from '../components/kids/KidsAnswerDisplay.vue'
import KidsErrorMessage from '../components/kids/KidsErrorMessage.vue'
import KidsSavedAnswers from '../components/kids/KidsSavedAnswers.vue'
import { useKidsBibleQA } from '../composables/useKidsBibleQA.js'
import { savedAnswersService } from '../services/savedAnswersService.js'

const {
  question,
  answer,
  image,
  loading,
  imageLoading,
  error,
  askQuestion,
  clearError
} = useKidsBibleQA()

// Tab management
const activeTab = ref('ask')
const savedAnswersRef = ref(null)

// Saved answers count for badge
const savedCount = ref(0)

const updateSavedCount = () => {
  try {
    savedCount.value = savedAnswersService.getAll().length
  } catch (error) {
    console.error('Error updating saved count:', error)
    savedCount.value = 0
  }
}

const handleQuestionSubmit = (questionText) => {
  askQuestion(questionText)
  // Auto-switch to ask tab if user submits from saved tab
  if (activeTab.value !== 'ask') {
    activeTab.value = 'ask'
  }
}

const handleAnswerSaved = () => {
  updateSavedCount()
  // Refresh the saved answers component if it exists
  if (savedAnswersRef.value) {
    savedAnswersRef.value.refresh()
  }
}

const handleSavedAnswersUpdated = () => {
  updateSavedCount()
}

// Load saved count on mount
onMounted(() => {
  updateSavedCount()
})
</script>

<style scoped>
.kids-app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  font-family: 'Comic Sans MS', cursive, system-ui;
}

.kids-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
  box-shadow: 0 4px 20px rgba(255, 107, 157, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.kids-logo-icon {
  font-size: 28px;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.nav-links {
  display: flex;
  gap: var(--spacing-lg);
}

.nav-link {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 25px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.95);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.nav-link--active {
  background: rgba(255, 255, 255, 0.9);
  color: #c44569;
  border-color: white;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  text-shadow: none;
}

.kids-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.rainbow-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #ff9a9e 0%, 
    #fecfef 20%, 
    #fecfef 40%, 
    #a8edea 60%, 
    #fed6e3 80%, 
    #d299c2 100%);
  opacity: 0.3;
  animation: rainbow-shift 10s ease-in-out infinite;
}

@keyframes rainbow-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  font-size: 2rem;
  animation: float-fun 8s ease-in-out infinite;
  opacity: 0.7;
}

.shape--1 { top: 10%; left: 10%; animation-delay: 0s; }
.shape--2 { top: 20%; right: 15%; animation-delay: -1s; }
.shape--3 { top: 40%; left: 5%; animation-delay: -2s; }
.shape--4 { top: 60%; right: 10%; animation-delay: -3s; }
.shape--5 { bottom: 30%; left: 15%; animation-delay: -4s; }
.shape--6 { bottom: 20%; right: 20%; animation-delay: -5s; }
.shape--7 { top: 70%; left: 80%; animation-delay: -6s; }
.shape--8 { bottom: 40%; right: 5%; animation-delay: -7s; }

@keyframes float-fun {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-20px) rotate(5deg) scale(1.1);
  }
  50% {
    transform: translateY(-10px) rotate(-3deg) scale(0.9);
  }
  75% {
    transform: translateY(-15px) rotate(2deg) scale(1.05);
  }
}

.kids-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
}

.kids-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.header-content {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: var(--spacing-3xl);
  box-shadow: 0 20px 40px rgba(255, 107, 157, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.header-content::before {
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

.kids-logo-section {
  margin-bottom: var(--spacing-2xl);
}

.big-logo {
  position: relative;
  margin-bottom: var(--spacing-xl);
}

.logo-character {
  font-size: 5rem;
  animation: bounce-gentle 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.sparkles {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.sparkle--1 {
  top: 10px;
  left: 10px;
  animation-delay: 0s;
}

.sparkle--2 {
  top: 20px;
  right: 10px;
  animation-delay: 0.5s;
}

.sparkle--3 {
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 1s;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.kids-title {
  font-size: 3.5rem;
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.1;
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.title-word {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: word-bounce 2s ease-in-out infinite;
  display: inline-block;
}

.title-word--1 { animation-delay: 0s; }
.title-word--2 { animation-delay: 0.2s; }
.title-word--3 { animation-delay: 0.4s; }

@keyframes word-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.kids-subtitle {
  font-size: var(--font-size-xl);
  color: #2d3748;
  margin: 0;
  font-weight: var(--font-weight-bold);
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.fun-features {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  flex-wrap: wrap;
}

.feature-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border-radius: 25px;
  border: 3px solid rgba(255, 107, 157, 0.3);
  transition: all var(--transition-normal);
  min-width: 120px;
}

.feature-bubble:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(255, 107, 157, 0.3);
  border-color: rgba(255, 107, 157, 0.5);
}

.bubble-emoji {
  font-size: 2.5rem;
  animation: emoji-wiggle 3s ease-in-out infinite;
}

@keyframes emoji-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

.feature-bubble span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #2d3748;
  text-align: center;
}

.kids-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kids-nav-tabs {
  display: flex;
  margin-bottom: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  border: 3px solid rgba(255, 107, 157, 0.3);
  border-radius: 25px;
  padding: var(--spacing-sm);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.2);
}

.kids-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border: none;
  background: transparent;
  color: #2d3748;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.tab-emoji {
  font-size: 1.5rem;
  animation: tab-emoji-bounce 2s ease-in-out infinite;
}

@keyframes tab-emoji-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.kids-tab:hover {
  background: rgba(255, 107, 157, 0.2);
  transform: translateY(-2px);
}

.kids-tab--active {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
  transform: translateY(-2px);
}

.kids-tab--active .tab-emoji {
  animation: tab-emoji-excited 1s ease-in-out infinite;
}

@keyframes tab-emoji-excited {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(5deg); }
}

.kids-badge {
  background: white;
  color: #ff6b9d;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 4px 8px;
  border-radius: 15px;
  min-width: 20px;
  text-align: center;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kids-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  flex: 1;
}

.kids-saved-content {
  flex: 1;
}

.kids-footer {
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-2xl);
}

.footer-content {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: var(--spacing-2xl);
  box-shadow: 0 10px 30px rgba(255, 107, 157, 0.2);
  border: 3px solid rgba(255, 107, 157, 0.3);
}

.footer-character {
  text-align: center;
}

.character-bubble {
  display: inline-flex;
  align-items: flex-end;
  gap: var(--spacing-lg);
  position: relative;
}

.character {
  font-size: 3rem;
  animation: character-hop 3s ease-in-out infinite;
}

@keyframes character-hop {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.speech-bubble {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border: 3px solid #ff6b9d;
  border-radius: 20px;
  padding: var(--spacing-lg);
  position: relative;
  max-width: 400px;
  color: #2d3748;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
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

/* Animation classes */
.animate-bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-10px);
  }
  70% {
    transform: scale(0.9) translateY(0px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0px);
  }
}

.animate-slide-in {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: var(--spacing-sm) var(--spacing-lg);
  }
  
  .nav-logo {
    font-size: var(--font-size-base);
  }
  
  .kids-logo-icon {
    font-size: 24px;
  }
  
  .nav-links {
    gap: var(--spacing-md);
  }
  
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  
  .kids-container {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-2xl);
  }
  
  .kids-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .fun-features {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  .character-bubble {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .speech-bubble {
    max-width: 300px;
  }
  
  .speech-bubble::before {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .speech-bubble::after {
    left: 50%;
    transform: translateX(-50%);
    margin-left: 3px;
  }
}

@media (max-width: 480px) {
  .kids-container {
    padding: var(--spacing-md);
  }
  
  .header-content {
    padding: var(--spacing-xl);
  }
  
  .kids-title {
    font-size: 2rem;
  }
  
  .logo-character {
    font-size: 4rem;
  }
  
  .kids-subtitle {
    font-size: var(--font-size-lg);
  }
}
</style>
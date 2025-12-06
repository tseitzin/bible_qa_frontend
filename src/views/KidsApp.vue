<template>
  <div class="kids-app">
    <!-- Navigation Header -->
    <nav class="kids-nav">
      <div class="nav-container nav-container--centered">
        <router-link to="/" class="nav-link nav-link--home">
          <svg class="nav-home-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </router-link>
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
          <div class="logo-section">
            <div class="logo-wrapper">
              <div class="logo-icon">📖</div>
              <div class="logo-text">
                <h2 class="kids-title">Answers from God's Word</h2>
                <div class="kids-tagline">Questions • Stories • Faith</div>
              </div>
            </div>
            <p class="kids-subtitle">
              Ask anything about God, Jesus, and the Bible<br>
              and discover answers from Scripture made just for you!
            </p>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="kids-main">
        <!-- Question Content -->
        <div class="kids-content animate-slide-in">
          <KidsQuestionForm
            v-model:question="question"
            :loading="loading"
            @submit="handleQuestionSubmit"
            @clear="handleClear"
            class="kids-question-section"
          />
          
          <KidsAnswerDisplay 
            :answer="answer" 
            :question="question"
            :question-id="questionId"
            :loading="loading"
            :stream-status="streamStatus"
            :is-streaming="isStreaming"
            class="kids-answer-section"
            @answer-saved="handleAnswerSaved"
            @follow-up-question="handleFollowUpQuestion"
            @login-required="handleLoginRequired"
            @reading-view="handleReadingViewNavigation"
          />
          
          <KidsErrorMessage 
            :error="error" 
            @dismiss="clearError"
            class="kids-error-section"
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
import { useRouter } from 'vue-router'
import KidsQuestionForm from '../components/kids/KidsQuestionForm.vue'
import KidsAnswerDisplay from '../components/kids/KidsAnswerDisplay.vue'
import KidsErrorMessage from '../components/kids/KidsErrorMessage.vue'
import { useKidsBibleQA } from '../composables/useKidsBibleQA.js'
import { PENDING_SAVED_ANSWER_KEY } from '../constants/storageKeys.js'

const router = useRouter()

const {
  question,
  answer,
  questionId,
  rootQuestionId,
  isBiblicalAnswer,
  conversationHistory,
  loading,
  error,
  streamStatus,
  isStreaming,
  askQuestion,
  askFollowUpQuestion,
  clearAll,
  clearError
} = useKidsBibleQA()

const handleQuestionSubmit = async (questionText) => {
  await askQuestion(questionText)
}

const handleClear = () => {
  clearAll()
  // Explicitly clear the answer to ensure it's cleared
  answer.value = ''
  question.value = ''
}

const handleFollowUpQuestion = async (followUpText) => {
  await askFollowUpQuestion(followUpText)
}

const handleAnswerSaved = () => {
  // Answer saved successfully
}

const handleLoginRequired = (payload) => {
  if (typeof window !== 'undefined') {
    try {
      const pendingData = {
        question: payload?.question || question.value || '',
        answer: payload?.answer || answer.value || '',
        questionId: payload?.questionId ?? questionId.value,
        rootQuestionId: rootQuestionId.value,
        conversationHistory: Array.isArray(conversationHistory.value)
          ? JSON.parse(JSON.stringify(conversationHistory.value))
          : []
      }

      if (pendingData.question && pendingData.answer) {
        sessionStorage.setItem(PENDING_SAVED_ANSWER_KEY, JSON.stringify(pendingData))
      }
    } catch (storageError) {
      console.error('Failed to persist pending answer before login:', storageError)
    }
  }

  router.push({ name: 'login', query: { redirect: 'kids-pending-save' } })
}

const handleReadingViewNavigation = (payload) => {
  // Navigate to reading view
  const query = { ref: payload.reference }
  if (payload.source) {
    query.source = payload.source
  }
  router.push({ name: 'reading', query })
}
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

.nav-container--centered {
  justify-content: center;
}

.nav-link--home {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}

.nav-home-icon {
  width: 24px;
  height: 24px;
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

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid rgba(255, 255, 255, 0.2);
  justify-content: center;
}

.nav-tab:hover {
  background-color: rgba(255, 255, 255, 0.35);
  color: white;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
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
  margin-bottom: var(--spacing-md);
}

.header-content {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-md);
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
  height: 4px;
  background: linear-gradient(90deg, #ff6b9d, #c44569, #f8b500, #ff6b9d);
  background-size: 200% 100%;
  animation: rainbow-border 3s linear infinite;
}

@keyframes rainbow-border {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.logo-section {
  margin-bottom: var(--spacing-xs);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: 0;
}

.logo-icon {
  font-size: 2.5rem;
  animation: bounce-gentle 2s ease-in-out infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.logo-text {
  text-align: left;
}

.kids-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.kids-tagline {
  font-size: var(--font-size-xs);
  color: #ff6b9d;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
  margin-bottom: 1px;
  text-align: center;
}

.kids-subtitle {
  font-size: var(--font-size-sm);
  color: #2d3748;
  margin: 0;
  line-height: var(--line-height-tight);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
}

.kids-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kids-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
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
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .nav-link--home {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-base);
  }

  .nav-home-icon {
    width: 20px;
    height: 20px;
  }
  
  .kids-container {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-sm);
  }
  
  .logo-wrapper {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .logo-text {
    text-align: center;
  }
  
  .kids-title {
    font-size: var(--font-size-xl);
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
    padding: var(--spacing-sm);
  }
  
  .kids-title {
    font-size: var(--font-size-lg);
  }
  
  .logo-icon {
    font-size: 2rem;
  }
  
  .kids-subtitle {
    font-size: var(--font-size-xs);
  }
}
</style>
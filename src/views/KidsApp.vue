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

    <!-- Magical Kids Background -->
    <div class="kids-background">
      <div class="rainbow-gradient"></div>

      <div class="floating-shapes">
        <div class="shape shape--1">⭐</div>
        <div class="shape shape--2">🌈</div>
        <div class="shape shape--3">💖</div>
        <div class="shape shape--4">☀️</div>
        <div class="shape shape--5">🐑</div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="kids-container">
      <!-- Header Section -->
      <header class="kids-header animate-bounce-in">
        <div class="header-content">
          <div class="logo-wrapper">
            <div class="logo-icon">📖</div>

            <div class="logo-text">
              <h2 class="kids-title">Answers from God’s Word</h2>
              <div class="kids-tagline">Questions • Stories • Faith</div>
            </div>
          </div>

          <p class="kids-subtitle">
            Ask anything about God, Jesus, and the Bible  <br>
            and discover answers from Scripture made just for you!
          </p>
        </div>
      </header>

      <!-- Question + Answer Area -->
      <main class="kids-main">
        <div class="kids-content animate-slide-in">

          <KidsQuestionForm
            v-model="question"
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
            @follow-up-question="handleFollowUpQuestion"
            @reading-view="handleReadingViewNavigation"
          />

          <KidsErrorMessage 
            :error="error" 
            @dismiss="clearError"
            class="kids-error-section"
          />

        </div>
      </main>

      <!-- Cute Footer -->
      <footer class="kids-footer">
        <div class="footer-content">
          <div class="footer-character">
            <div class="character">🐑</div>
            <div class="speech-bubble">
              Remember to always ask your parents or Sunday school teacher about important questions too.  
              God loves you! 💕
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

const router = useRouter()

const {
  question,
  answer,
  questionId,
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
  answer.value = ''
  question.value = ''
}

const handleFollowUpQuestion = async (followUpText) => {
  await askFollowUpQuestion(followUpText)
}

const handleReadingViewNavigation = (payload) => {
  const query = { ref: payload.reference }
  if (payload.source) query.source = payload.source
  router.push({ name: 'reading', query })
}
</script>


<style scoped>
/* ================================ */
/*      REDESIGNED KIDS PAGE        */
/* ================================ */

/* GLOBAL KIDS APP STYLING */
.kids-app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  font-family: 'Fredoka', sans-serif;
  background: #FFF6FB;
}

/* NAVIGATION BAR */
.kids-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #FF8BC9, #FFA93B);
  box-shadow: 0 4px 20px rgba(255, 143, 194, 0.3);
}

.nav-container--centered {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: center;
}

.nav-link--home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 20px;
  color: #fff;
  font-weight: 700;
  transition: 0.25s;
}
.nav-link--home:hover {
  background: rgba(255, 255, 255, 0.55);
  transform: translateY(-2px);
}
.nav-home-icon {
  width: 22px;
  height: 22px;
}

/* ================================ */
/*         BACKGROUND MAGIC         */
/* ================================ */

.kids-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.rainbow-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FFE3F2 0%, #FFECD6 60%, #FFF6FB 100%);
  opacity: 0.7;
}

.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  font-size: 2.2rem;
  opacity: 0.28;
  animation: float-soft 10s ease-in-out infinite;
}

.shape--1 { top: 12%; left: 8%; animation-delay: 0s; }
.shape--2 { top: 28%; right: 12%; animation-delay: -2s; }
.shape--3 { top: 50%; left: 6%; animation-delay: -4s; }
.shape--4 { bottom: 20%; right: 18%; animation-delay: -6s; }
.shape--5 { bottom: 35%; left: 20%; animation-delay: -3s; }

@keyframes float-soft {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-12px) scale(1.05); }
}

/* ================================ */
/*         HEADER SECTION           */
/* ================================ */

.kids-header { text-align: center; margin-bottom: var(--spacing-md); }

.header-content {
  background: #FFFFFFEE;
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: var(--spacing-md);
  box-shadow: 0 15px 40px rgba(255, 143, 194, 0.25);
  border: 3px solid rgba(255, 143, 194, 0.3);
}

.logo-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.kids-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6FAE, #FFA93B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.kids-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #FF6FAE;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0;
  text-align: center;
}

.kids-subtitle {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #2D3748;
  font-weight: 600;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* ================================ */
/*         MAIN LAYOUT              */
/* ================================ */

.kids-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-sm);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
}
.kids-main {
  display: flex;
  flex-direction: column;
}
.kids-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* ================================ */
/*         FOOTER SECTION           */
/* ================================ */

.kids-footer { margin-top: var(--spacing-sm); }

.footer-content {
  background: #FFFFFFEE;
  border: 3px solid rgba(255, 143, 194, 0.3);
  border-radius: 25px;
  padding: var(--spacing-xs);
  text-align: center;
  box-shadow: 0 10px 30px rgba(255, 143, 194, 0.25);
}

.character {
  font-size: 3rem;
  animation: bounce 2.5s infinite;
}

.speech-bubble {
  background: #fff;
  border: 3px solid #FF6FAE;
  border-radius: 20px;
  padding: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  max-width: 400px;
  margin: 0 auto 0;
  position: relative;
  box-shadow: 0 5px 20px rgba(255, 143, 194, 0.25);
}
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 40%;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid #FF6FAE;
}

/* ================================ */
/*        RESPONSIVE DESIGN         */
/* ================================ */

@media (max-width: 768px) {
  .kids-title { font-size: 1.7rem; }
  .kids-subtitle { font-size: 0.9rem; }
  .speech-bubble { max-width: 300px; }
}

@media (max-width: 480px) {
  .kids-title { font-size: 1.4rem; }
  .kids-subtitle { font-size: 0.8rem; }
}
</style>

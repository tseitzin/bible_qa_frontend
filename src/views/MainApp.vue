<template>
  <div class="app">
    <!-- Navigation Header -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span>Bible Q&A</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link nav-link--active">Adults</router-link>
          <router-link to="/kids" class="nav-link">Kids</router-link>
          <button
            v-if="currentUser"
            type="button"
            @click="handleLogout"
            class="nav-link logout-button"
          >
            Logout
          </button>
          <router-link v-else to="/login" class="nav-link login-button">Login</router-link>
        </div>
      </div>
    </nav>

    <!-- Background Elements -->
    <div class="app-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element floating-element--1"></div>
        <div class="floating-element floating-element--2"></div>
        <div class="floating-element floating-element--3"></div>
      </div>
    </div>
    
    <div class="app-container">
      <!-- Header Section -->
      <header class="app-header animate-fade-in">
  <div class="header-content">
    <div class="logo-section">
      <div class="logo-wrapper">
        <div class="logo-text">
          <h2 class="app-title">Answers to your Bible Questions</h2>
          <div class="app-tagline">Scripture • Wisdom • Truth</div>
        </div>
      </div>
      <p class="app-subtitle">
        Discover biblical wisdom through AI-powered Scripture exploration.
      </p>
    </div>
  </div>
</header>

      
      <!-- Main Content -->
      <main class="app-main">
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <!-- Ask Question Button -->
          <button 
            @click="handleAskTabClick" 
            :class="['nav-tab', { 'nav-tab--active': activeTab === 'ask' }]"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Ask Question
          </button>

          <!-- Saved Answers Button -->
          <button 
            @click="handleSavedTabClick" 
            :class="['nav-tab', { 'nav-tab--active': activeTab === 'saved' }]"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
            Saved Answers
            <span v-if="savedCount > 0" class="saved-badge">{{ savedCount }}</span>
          </button>

        </div>

        <!-- Ask Question Tab -->
        <div v-if="activeTab === 'ask'" class="content-wrapper animate-slide-in">
          <div ref="questionSectionRef" class="question-section">
            <QuestionForm
              v-model:question="question"
              :loading="loading"
              @submit="handleQuestionSubmit"
            />
          </div>
          
          <AnswerDisplay 
            :answer="answer" 
            :question="question"
            :question-id="questionId"
            :loading="loading"
            class="answer-section"
            @answer-saved="handleAnswerSaved"
            @follow-up-question="handleFollowUpQuestion"
          />
          
          <ErrorMessage 
            :error="error" 
            @dismiss="clearError"
            class="error-section"
          />
        </div>

        <!-- Saved Answers Tab -->
        <div
          v-else-if="activeTab === 'saved'"
          ref="savedSectionRef"
          class="saved-content animate-fade-in"
        >
          <!-- Show login prompt for guest users -->
          <div v-if="!currentUser" class="guest-message">
            <div class="guest-message-icon">🔒</div>
            <h3>Sign in to Save Answers</h3>
            <p>Create an account or log in to save your favorite Bible Q&A answers and access them anytime.</p>
            <div class="guest-actions">
              <router-link to="/login" class="btn-primary">Log In</router-link>
              <router-link to="/register" class="btn-secondary">Create Account</router-link>
            </div>
          </div>
          
          <!-- Show saved answers for authenticated users -->
          <SavedAnswers 
            v-else
            ref="savedAnswersRef" 
            @update="handleSavedAnswersUpdated"
          />
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-disclaimer">
              <div class="disclaimer-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <p>
                <strong>Important:</strong> Always verify answers with Scripture and consult trusted biblical sources, 
                pastors, or theologians for important spiritual matters.
              </p>
            </div>
            
            <p class="footer-description">
              Powered by advanced AI technology to provide thoughtful, scripture-based answers 
              to your biblical questions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import QuestionForm from '../components/QuestionForm.vue'
import AnswerDisplay from '../components/AnswerDisplay.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import SavedAnswers from '../components/SavedAnswers.vue'
import { useBibleQA } from '../composables/useBibleQA.js'
import { savedAnswersService } from '../services/savedAnswersService.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { currentUser, logout } = useAuth()

const {
  question,
  answer,
  questionId,
  loading,
  error,
  askQuestion,
  askFollowUpQuestion,
  clearError
} = useBibleQA()

// Tab management
const activeTab = ref('ask')
const savedAnswersRef = ref(null)
const questionSectionRef = ref(null)
const savedSectionRef = ref(null)

// Store current question and answer for accessibility by tests
const currentQuestion = ref('')
const currentAnswer = ref('')

// Saved answers count for badge
const savedCount = ref(0)

const updateSavedCount = async () => {
  // Only fetch saved count if user is authenticated
  if (!currentUser.value) {
    savedCount.value = 0
    return
  }
  
  try {
    const answers = await savedAnswersService.getAll()
    savedCount.value = answers.length
  } catch (error) {
    console.error('Error updating saved count:', error)
    savedCount.value = 0
  }
}

const handleQuestionSubmit = (questionText, answerText) => {
  // Store the current question and answer
  currentQuestion.value = questionText
  currentAnswer.value = answerText
  
  askQuestion(questionText)
  // Auto-switch to ask tab if user submits from saved tab
  if (activeTab.value !== 'ask') {
    activeTab.value = 'ask'
  }
}

const SCROLL_OFFSET = 120

const scrollToQuestionForm = () => {
  if (typeof window === 'undefined') return
  const sectionEl = questionSectionRef.value
  if (!sectionEl) return

  const titleEl = sectionEl.querySelector('.form-title')
  const targetEl = titleEl ?? sectionEl
  const top = targetEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

const handleAskTabClick = async () => {
  if (activeTab.value !== 'ask') {
    activeTab.value = 'ask'
    await nextTick()
  }
  scrollToQuestionForm()
}

const scrollToSavedSection = () => {
  if (typeof window === 'undefined') return
  const sectionEl = savedSectionRef.value
  if (!sectionEl) return

  const top = sectionEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

const handleSavedTabClick = async () => {
  if (activeTab.value !== 'saved') {
    activeTab.value = 'saved'
    await nextTick()
  } else {
    await nextTick()
  }
  scrollToSavedSection()
}

const handleAnswerSaved = async () => {
  await updateSavedCount()
  // Refresh the saved answers component if it exists
  if (savedAnswersRef.value) {
    savedAnswersRef.value.refresh()
  }
}

const handleSavedAnswersUpdated = () => {
  updateSavedCount()
}

const handleFollowUpQuestion = async (followUpText) => {
  await askFollowUpQuestion(followUpText)
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

// Load saved count on mount and check for tab query parameter
onMounted(async () => {
  await updateSavedCount()
  
  // Check if we should open saved tab from query parameter
  const route = router.currentRoute.value
  if (route.query.tab === 'saved') {
    activeTab.value = 'saved'
  }
})
</script>

<style scoped>
.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
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
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.nav-logo svg {
  width: 24px;
  height: 24px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: #1a202c;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.nav-link:hover {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.nav-link--active {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logout-button {
  appearance: none;
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: rgba(136, 19, 55, 0.85);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.18);
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.28);
  border-color: rgba(239, 68, 68, 0.45);
  color: rgba(136, 19, 55, 1);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.login-button {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: rgba(6, 95, 70, 0.9);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.18);
}

.login-button:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(16, 185, 129, 0.5);
  color: rgba(6, 95, 70, 1);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px; /* Account for fixed nav */
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  opacity: 0.1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  background-size: 800px 800px, 600px 600px, 400px 400px;
  animation: float 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  animation: float 15s ease-in-out infinite;
}

.floating-element--1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element--2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.floating-element--3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.header-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.logo-section {
  margin-bottom: var(--spacing-xs);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.logo-text {
  text-align: left;
}

.app-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.app-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-accent);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
  text-align: center;
}

.app-subtitle {
  font-size: var(--font-size-base);
  color: #1a202c;
  margin: 0;
  line-height: var(--line-height-normal);
  max-width: 600px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, max-content));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  justify-content: center;
  justify-items: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  background: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  cursor: default;
  justify-content: center;
  text-align: center;
}

.feature-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-item span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-tabs {
  display: flex;
  gap: 0.75rem;                       /* space between buttons */
  justify-content: center;             /* center buttons horizontally */
  margin-bottom: var(--spacing-lg);
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-sm);          /* slightly more padding for bigger buttons */
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease-in-out;
}


/* Nav button styling */
.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  background-color: rgba(0, 0, 0, 0.15); /* darker grayish background */
  color: #fff;                            /* white text for contrast */
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 160px;
  justify-content: center;
}

/* Inactive hover effect */
.nav-tab:hover {
  background-color: rgba(0, 0, 0, 0.25); /* slightly darker on hover */
}

/* Active button */
.nav-tab--active {
  background-color: rgba(0, 119, 204, 0.8); /* blue */
  color: white;
  box-shadow: 0 4px 10px rgba(0, 119, 204, 0.3);
}

/* Active hover effect */
.nav-tab--active:hover {
  background-color: rgba(0, 119, 204, 1);
  box-shadow: 0 6px 15px rgba(0, 119, 204, 0.4);
  transform: translateY(-1px);
}



/* SVG icons */
.nav-icon {
  width: 1.25rem;   /* consistent width */
  height: 1.25rem;  /* consistent height */
  flex-shrink: 0;   /* prevents icon from shrinking */
}

/* Optional: saved badge */
.saved-badge {
  display: inline-block;
  background-color: #cb8283;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  margin-left: 0.25rem;
  pointer-events: none; /* ensures hover passes through badge */
}


.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
}

.saved-content {
  flex: 1;
}

.guest-message {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  margin: 0 auto;
}

.guest-message-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.guest-message h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.guest-message p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-xl);
}

.guest-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-normal);
  display: inline-block;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.question-section,
.answer-section,
.error-section {
  animation-delay: 0.2s;
}

.app-footer {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}

.footer-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-main {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.footer-logo svg {
  width: 24px;
  height: 24px;
}

.footer-description {
  font-size: var(--font-size-sm);
  color: #1a202c;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.footer-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
}

.disclaimer-icon {
  width: 20px;
  height: 20px;
  color: var(--color-secondary);
  flex-shrink: 0;
  margin-top: 2px;
}

.disclaimer-icon svg {
  width: 100%;
  height: 100%;
}

.footer-disclaimer p {
  margin: 0;
  color: #1a202c;
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-semibold);
}

.footer-disclaimer strong {
  color: var(--color-secondary-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: var(--spacing-sm) var(--spacing-lg);
  }
  
  .nav-logo {
    font-size: var(--font-size-base);
  }
  
  .nav-links {
    gap: var(--spacing-md);
  }
  
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  
  .app-container {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-2xl);
  }
  
  .logo-wrapper {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .logo-text {
    text-align: center;
  }
  
  .app-title {
    font-size: var(--font-size-4xl);
  }
  
  .app-subtitle {
    font-size: var(--font-size-base);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .footer-disclaimer {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--spacing-md);
  }
  
  .header-content {
    padding: var(--spacing-xl);
  }
  
  .app-title {
    font-size: var(--font-size-3xl);
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
  
  .logo-icon svg {
    width: 28px;
    height: 28px;
  }
}
</style>
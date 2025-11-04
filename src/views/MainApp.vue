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
          <div v-if="currentUser" class="user-menu">
            <span class="user-name">{{ currentUser.username }}</span>
            <button @click="handleLogout" class="logout-button">Logout</button>
          </div>
          <router-link v-else to="/login" class="nav-link">Login</router-link>
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
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div class="logo-text">
                <h1 class="app-title">Bible Q&A</h1>
                <div class="app-tagline">Scripture • Wisdom • Truth</div>
              </div>
            </div>
            <p class="app-subtitle">
              Discover biblical wisdom through AI-powered Scripture exploration. 
              Ask questions about faith, theology, and biblical teachings to receive 
              thoughtful, scripture-based answers.
            </p>
          </div>
          
          <!-- Feature highlights -->
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <span>Scripture-Based</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Accurate Answers</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="app-main">
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button 
            @click="activeTab = 'ask'" 
            :class="['nav-tab', { 'nav-tab--active': activeTab === 'ask' }]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Ask Question
          </button>
          <button 
            @click="activeTab = 'saved'" 
            :class="['nav-tab', { 'nav-tab--active': activeTab === 'saved' }]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
            Saved Answers
            <span v-if="savedCount > 0" class="saved-badge">{{ savedCount }}</span>
          </button>
        </div>

        <!-- Ask Question Tab -->
        <div v-if="activeTab === 'ask'" class="content-wrapper animate-slide-in">
          <QuestionForm
            v-model:question="question"
            :loading="loading"
            @submit="handleQuestionSubmit"
            class="question-section"
          />
          
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
        <div v-else-if="activeTab === 'saved'" class="saved-content animate-fade-in">
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
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <span>Bible Q&A</span>
            </div>
            <p class="footer-description">
              Powered by advanced AI technology to provide thoughtful, scripture-based answers 
              to your biblical questions.
            </p>
          </div>
          
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
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.logout-button {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.logout-button:hover {
  background: var(--color-danger-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
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
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.header-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: var(--gradient-primary);
}

.logo-section {
  margin-bottom: var(--spacing-2xl);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  width: 60px;
  height: 60px;
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
  width: 32px;
  height: 32px;
}

.logo-text {
  text-align: left;
}

.app-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
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
}

.app-subtitle {
  font-size: var(--font-size-lg);
  color: #1a202c;
  margin: 0;
  line-height: var(--line-height-relaxed);
  max-width: 600px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 20px;
  height: 20px;
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
  margin-bottom: var(--spacing-xl);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.nav-tab svg {
  width: 18px;
  height: 18px;
}

.nav-tab:hover {
  color: var(--color-primary);
  background: rgba(37, 99, 235, 0.1);
}

.nav-tab--active {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
}

.nav-tab--active:hover {
  color: var(--color-text-inverse);
  background: var(--gradient-primary);
}

.saved-badge {
  background: var(--color-text-inverse);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--border-radius-full);
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.nav-tab--active .saved-badge {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-primary);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
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
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-2xl);
}

.footer-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-main {
  text-align: center;
  margin-bottom: var(--spacing-xl);
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
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
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
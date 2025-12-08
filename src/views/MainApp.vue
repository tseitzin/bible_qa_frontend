<template>
  <div class="app">
    <!-- Navigation Header -->
    <Navbar :activeTab="activeTab" />

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
          <Transition name="header-fade" mode="out-in">
            <div class="logo-section" :key="activeTab">
              <div class="logo-wrapper">
                <div class="logo-text">
                  <h2 class="app-title">{{ headerConfig.title }}</h2>
                  <div class="app-tagline">{{ headerConfig.tagline }}</div>
                </div>
              </div>
              <p class="app-subtitle">
                {{ headerConfig.subtitle }}
              </p>
            </div>
          </Transition>
        </div>
      </header>

      
      <!-- Main Content -->
      <main class="app-main">
        <!-- Tracked Reading Plans Section -->
        <section v-if="currentUser && trackedPlans.length" class="study-card tracked-plans-card">
          <header class="study-card__header">
            <div>
              <h3>Your Tracked Bible Reading Plans</h3>
              <p>Continue your progress or start a new day in any plan below.</p>
            </div>
          </header>
          <ul class="tracked-plans-list">
            <li v-for="plan in trackedPlans" :key="plan.id" class="tracked-plan-item">
                          <button class="tracked-plan-info tracked-plan-link" @click="goToReadingPlan(plan.plan.id, plan.plan.slug)">
                            <strong>{{ plan.plan.name }}</strong>
                            <span class="tracked-plan-progress">{{ Math.round((plan.completed_days / plan.total_days) * 100) }}% complete</span>
                          </button>
            </li>
          </ul>
        </section>

        <!-- Ask Question Tab -->
        <div v-if="activeTab === 'ask'" class="content-wrapper animate-slide-in">
          <div ref="questionSectionRef" class="question-section">
            <QuestionForm
              v-model:question="question"
              :loading="loading"
              :recent-questions="recentQuestions"
              :show-recent-questions="Boolean(currentUser)"
              @submit="handleQuestionSubmit"
              @clear="handleQuestionCleared"
              @remove-recent="handleRecentQuestionRemove"
            />
          </div>
          
          <div v-if="showAnswer" ref="answerSectionRef" class="answer-section">
            <AnswerDisplay 
              :answer="answer" 
              :question="question"
              :question-id="questionId"
              :loading="loading"
              :stream-status="streamStatus"
              :is-streaming="isStreaming"
              @answer-saved="handleAnswerSaved"
              @follow-up-question="handleFollowUpQuestion"
              @login-required="handleLoginRequired"
              @reading-view="handleReadingViewNavigation"
            />
          </div>
          
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
            <p>Create an account or log in to save your favorite Bible answers and access them anytime.</p>
            <div class="guest-actions">
              <router-link :to="{ name: 'login', query: { redirect: 'saved' } }" class="btn-primary">Log In</router-link>
              <router-link :to="{ name: 'register', query: { redirect: 'saved' } }" class="btn-secondary">Create Account</router-link>
            </div>
          </div>
          
          <!-- Show saved answers for authenticated users -->
          <template v-else>
            <!-- <p class="saved-meta-copy">
              Saved answers now surface MCP-provided metadata such as verse citations and topical tags, so every response stays tied to Scripture.
            </p> -->
            <SavedAnswers 
              ref="savedAnswersRef" 
              @update="handleSavedAnswersUpdated"
            />
          </template>
        </div>

        <!-- Study Resources Tab -->
        <div
          v-else-if="activeTab === 'study'"
          ref="studySectionRef"
          class="study-content animate-fade-in"
        >
          <StudyResources />
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// Navigation for tracked reading plans
const goToReadingPlan = (planId, planSlug) => {
  if (planSlug) {
    router.push({ name: 'reading-plan', params: { slug: planSlug } })
  }
}
import QuestionForm from '../components/QuestionForm.vue'
import AnswerDisplay from '../components/AnswerDisplay.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import SavedAnswers from '../components/SavedAnswers.vue'
import StudyResources from '../components/StudyResources.vue'
import { useBibleQA } from '../composables/useBibleQA.js'
import { savedAnswersService } from '../services/savedAnswersService.js'
import { recentQuestionsService } from '../services/recentQuestionsService.js'
import { userReadingPlanService } from '../services/userReadingPlanService.js'
import { useAuth } from '../composables/useAuth.js'
import { PENDING_SAVED_ANSWER_KEY, RETURN_TO_ANSWER_STATE_KEY } from '../constants/storageKeys.js'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const route = router.currentRoute
const { currentUser } = useAuth()

const trackedPlans = ref([])

const loadTrackedPlans = async () => {
  if (currentUser.value) {
    try {
      trackedPlans.value = await userReadingPlanService.listPlans()
    } catch (e) {
      console.error('Failed to load tracked plans:', e)
      trackedPlans.value = []
    }
  } else {
    trackedPlans.value = []
  }
}


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
} = useBibleQA()

// Tab management
const activeTab = ref('ask')
const savedAnswersRef = ref(null)

// Dynamic header content based on active tab
const headerConfig = computed(() => {
  const configs = {
    ask: {
      title: 'Answers to your Bible Questions',
      tagline: 'Scripture • Wisdom • Truth',
      subtitle: 'Discover insights rooted in God\'s Word with the help of AI-guided Scripture study.'
    },
    saved: {
      title: 'Your Saved Answers',
      tagline: 'Reference • Reflect • Remember',
      subtitle: 'Review, copy, export or share your saved Bible answers for easy reference anytime.'
    },
    study: {
      title: 'Bible Study Resources',
      tagline: 'Explore • Learn • Grow',
      subtitle: 'Discover Bible reading plans and explore topics to deepen your understanding of Scripture.'
    }
  }
  return configs[activeTab.value] || configs.ask
})
const questionSectionRef = ref(null)
const answerSectionRef = ref(null)
const savedSectionRef = ref(null)
const studySectionRef = ref(null)

// Store current question and answer for accessibility by tests
const currentQuestion = ref('')
const currentAnswer = ref('')
const showAnswer = ref(false)

// Saved answers count for badge
const savedCount = ref(0)
const recentQuestions = ref([])
const pendingAnswerRestore = ref(false)
const pendingAnswerScroll = ref(false)

const resolveElement = (value) => {
  if (!value) {
    return null
  }

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return value
  }

  if (typeof Element !== 'undefined' && value.$el instanceof Element) {
    return value.$el
  }

  return null
}

const persistAnswerForReturn = () => {
  if (typeof window === 'undefined') {
    return
  }

  const questionText = typeof question.value === 'string' ? question.value.trim() : ''
  const answerText = typeof answer.value === 'string' ? answer.value.trim() : ''
  if (!questionText || !answerText) {
    return
  }

  try {
    const payload = {
      question: question.value,
      answer: answer.value,
      questionId: questionId.value,
      rootQuestionId: rootQuestionId.value,
      conversationHistory: Array.isArray(conversationHistory.value)
        ? JSON.parse(JSON.stringify(conversationHistory.value))
        : []
    }
    sessionStorage.setItem(RETURN_TO_ANSWER_STATE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to persist answer before Reading View:', error)
  }
}

const resetQAState = () => {
  clearAll()
  currentQuestion.value = ''
  currentAnswer.value = ''
  showAnswer.value = false
}

const normalizeRecentQuestionItems = (items) => {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        const text = item.trim()
        if (!text) {
          return null
        }
        return { id: null, question: text, asked_at: null }
      }

      if (item && typeof item === 'object') {
        const text = typeof item.question === 'string' ? item.question.trim() : ''
        if (!text) {
          return null
        }
        return { ...item, question: text }
      }

      return null
    })
    .filter(Boolean)
}

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

const loadRecentQuestions = async () => {
  if (!currentUser.value) {
    recentQuestions.value = []
    return
  }

  try {
    const items = await recentQuestionsService.fetch()
    recentQuestions.value = normalizeRecentQuestionItems(items)
  } catch (error) {
    console.error('Error loading recent questions:', error)
    recentQuestions.value = []
  }
}

const recordRecentQuestion = async (questionText) => {
  if (!currentUser.value) {
    return
  }

  const trimmed = typeof questionText === 'string' ? questionText.trim() : ''
  if (!trimmed) {
    return
  }

  try {
    const items = await recentQuestionsService.add(trimmed, !!currentUser.value)
    if (Array.isArray(items)) {
      recentQuestions.value = normalizeRecentQuestionItems(items)
    } else {
      const fallback = await recentQuestionsService.fetch()
      recentQuestions.value = normalizeRecentQuestionItems(fallback)
    }
  } catch (error) {
    console.error('Error refreshing recent questions:', error)
  }
}

const handleQuestionSubmit = async (questionText) => {
  const trimmedQuestion = typeof questionText === 'string' ? questionText.trim() : ''
  if (!trimmedQuestion) {
    return
  }

  currentQuestion.value = trimmedQuestion
  currentAnswer.value = ''
  question.value = trimmedQuestion
  answer.value = ''
  questionId.value = null
  rootQuestionId.value = null
  conversationHistory.value = []
  showAnswer.value = false

  if (activeTab.value !== 'ask') {
    activeTab.value = 'ask'
    await nextTick()
  }

  // Show answer section immediately for streaming
  showAnswer.value = true
  await nextTick()

  await askQuestion(trimmedQuestion)

  currentAnswer.value = answer.value

  if (currentUser.value && !error.value && answer.value && isBiblicalAnswer.value) {
    await recordRecentQuestion(trimmedQuestion)
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

const scrollToAnswerSection = (attempt = 0) => {
  if (typeof window === 'undefined') return
  const sectionEl = resolveElement(answerSectionRef.value)
  if (!sectionEl) {
    if (attempt < 6) {
      requestAnimationFrame(() => scrollToAnswerSection(attempt + 1))
    }
    return
  }

  const top = sectionEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

const scheduleAnswerScroll = () => {
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToAnswerSection()
    })
  })
}

const handleAskTabClick = async () => {
  if (activeTab.value !== 'ask') {
    activeTab.value = 'ask'
    await nextTick()
  }
  // Clear query params when switching to ask tab
  router.replace({ name: 'main', query: { tab: 'ask' } })
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

const scrollToStudySection = () => {
  if (typeof window === 'undefined') return
  const sectionEl = studySectionRef.value
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
    resetQAState()
  }
  if (activeTab.value !== 'saved') {
    activeTab.value = 'saved'
    await nextTick()
  } else {
    await nextTick()
  }
  // Clear query params when switching to saved tab
  router.replace({ name: 'main', query: { tab: 'saved' } })
  scrollToSavedSection()
}

const handleStudyTabClick = async () => {
  if (activeTab.value !== 'study') {
    resetQAState()
  }
  if (activeTab.value !== 'study') {
    activeTab.value = 'study'
    await nextTick()
  } else {
    await nextTick()
  }
  // Clear query params when switching to study tab
  router.replace({ name: 'main', query: { tab: 'study' } })
  scrollToStudySection()
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
  const trimmedFollowUp = typeof followUpText === 'string' ? followUpText.trim() : ''
  if (!trimmedFollowUp) {
    return
  }

  currentAnswer.value = ''
  answer.value = ''
  // Keep answer section visible during streaming
  showAnswer.value = true
  await nextTick()
  
  await askFollowUpQuestion(trimmedFollowUp)

  currentAnswer.value = answer.value

}

const handleReadingViewNavigation = () => {
  persistAnswerForReturn()
}

const handleQuestionCleared = () => {
  resetQAState()
  question.value = ''
  answer.value = ''
  currentQuestion.value = ''
  currentAnswer.value = ''
  questionId.value = null
}

const handleRecentQuestionRemove = async (recentQuestion) => {
  if (!recentQuestion || !recentQuestion.id) {
    return
  }

  const prompt = recentQuestion.question
    ? `Remove "${recentQuestion.question}" from your recent questions?`
    : 'Remove this recent question from your list?'

  const confirmed = typeof window !== 'undefined' ? window.confirm(prompt) : true
  if (!confirmed) {
    return
  }

  try {
    const items = await recentQuestionsService.remove(recentQuestion.id)
    if (Array.isArray(items)) {
      recentQuestions.value = normalizeRecentQuestionItems(items)
    } else {
      recentQuestions.value = recentQuestions.value.filter((item) => item.id !== recentQuestion.id)
    }
  } catch (removeError) {
    console.error('Error deleting recent question:', removeError)
  }
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

  router.push({ name: 'login', query: { redirect: 'pending-save' } })
}

const restorePendingAnswer = async () => {
  if (typeof window === 'undefined') {
    return false
  }

  const stored = sessionStorage.getItem(PENDING_SAVED_ANSWER_KEY)
  if (!stored) {
    return false
  }

  try {
    const payload = JSON.parse(stored)
    if (!payload?.question || !payload?.answer) {
      return false
    }

    question.value = payload.question
    answer.value = payload.answer
    questionId.value = payload.questionId ?? null

    if (payload.rootQuestionId) {
      rootQuestionId.value = payload.rootQuestionId
    }

    if (Array.isArray(payload.conversationHistory) && payload.conversationHistory.length > 0) {
      conversationHistory.value = payload.conversationHistory
    } else {
      conversationHistory.value = [
        { role: 'user', content: payload.question },
        { role: 'assistant', content: payload.answer }
      ]
    }

    currentQuestion.value = payload.question
    currentAnswer.value = payload.answer
    activeTab.value = 'ask'
    showAnswer.value = Boolean(payload.answer)

    await nextTick()
    scrollToQuestionForm()

    return true
  } catch (error) {
    console.error('Failed to restore pending answer after login:', error)
    return false
  } finally {
    sessionStorage.removeItem(PENDING_SAVED_ANSWER_KEY)
  }
}

const restoreAnswerFromReadingView = async () => {
  if (typeof window === 'undefined') {
    return false
  }

  const stored = sessionStorage.getItem(RETURN_TO_ANSWER_STATE_KEY)
  if (!stored) {
    return false
  }

  try {
    const payload = JSON.parse(stored)
    if (!payload?.question || !payload?.answer) {
      return false
    }

    question.value = payload.question
    answer.value = payload.answer
    questionId.value = payload.questionId ?? null
    rootQuestionId.value = payload.rootQuestionId ?? null

    if (Array.isArray(payload.conversationHistory) && payload.conversationHistory.length > 0) {
      conversationHistory.value = payload.conversationHistory
    } else {
      conversationHistory.value = [
        { role: 'user', content: payload.question },
        { role: 'assistant', content: payload.answer }
      ]
    }

    currentQuestion.value = payload.question
    currentAnswer.value = payload.answer
    activeTab.value = 'ask'
    showAnswer.value = true

    await nextTick()
    scheduleAnswerScroll()

    return true
  } catch (error) {
    console.error('Failed to restore answer after Reading View:', error)
    return false
  } finally {
    sessionStorage.removeItem(RETURN_TO_ANSWER_STATE_KEY)
  }
}

watch(currentUser, () => {
  void loadRecentQuestions()
  void loadTrackedPlans()
}, { immediate: true })

watch(activeTab, (tab) => {
  if (tab !== 'ask') {
    resetQAState()
  }
})


// Load saved count on mount and check for tab query parameter
onMounted(async () => {
  const initialRoute = router.currentRoute.value

  if (typeof window !== 'undefined' && initialRoute.query.restore !== 'answer') {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  await updateSavedCount()
  await loadTrackedPlans()
  
  // Check if we're restoring a pending answer
  if (initialRoute.query.restored === 'pending') {
    const restoredPending = await restorePendingAnswer()
    
    if (restoredPending) {
      // Clear the query parameter after restoring
      router.replace({ name: 'main' })
      return
    }
  }

  if (initialRoute.query.restore === 'answer') {
    const restoredAnswer = await restoreAnswerFromReadingView()
    if (restoredAnswer) {
      const nextQuery = { ...initialRoute.query }
      delete nextQuery.restore
      if (!nextQuery.tab) {
        nextQuery.tab = 'ask'
      }

      router.replace({ name: 'main', query: nextQuery })
      return
    }
  }

  // Check if we should open saved tab from query parameter
  if (initialRoute.query.tab === 'saved' || initialRoute.query.tab === 'study') {
    activeTab.value = initialRoute.query.tab
  }
})

watch(() => router.currentRoute.value.query.tab, (newTab) => {
  if (newTab === 'saved' || newTab === 'study') {
    activeTab.value = newTab
  } else if (newTab === undefined || newTab === 'ask') {
    activeTab.value = 'ask'
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
  border-bottom: 1px solid rgba(47, 74, 126, 0.12);
  box-shadow: 0 12px 26px rgba(31, 50, 86, 0.12);
}

.nav-container {
  max-width: 1432px;
  height: 76px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
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
  margin-right: auto;
}

.nav-logo img {
  height: 92px;
  width: auto;
  display: block;
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
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  border: 1px solid rgba(47, 74, 126, 0.12);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 20px rgba(31, 50, 86, 0.12);
  cursor: pointer;
}

.nav-link:hover {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(47, 74, 126, 0.28);
  box-shadow: 0 12px 28px rgba(31, 50, 86, 0.18);
  transform: translateY(-1px);
}

.app-nav .nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  background-color: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  justify-content: center;
}

.app-nav .nav-tab:hover {
  background-color: rgba(47, 74, 126, 0.18);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.app-nav .nav-tab--active {
  background: var(--gradient-primary);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.28);
}

.app-nav .nav-tab--active:hover {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  box-shadow: 0 22px 36px rgba(47, 74, 126, 0.32);
  transform: translateY(-1px);
}

.app-nav .nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-link--active {
  background: var(--gradient-primary);
  color: #ffffff;
  border-color: rgba(47, 74, 126, 0.32);
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.28);
}

.admin-link {
  background: rgba(126, 74, 255, 0.16);
  border-color: rgba(126, 74, 255, 0.32);
  color: rgba(75, 0, 130, 0.88);
  box-shadow: 0 12px 24px rgba(126, 74, 255, 0.18);
}

.admin-link:hover {
  background: rgba(126, 74, 255, 0.24);
  border-color: rgba(126, 74, 255, 0.42);
  color: rgba(75, 0, 130, 1);
  box-shadow: 0 18px 30px rgba(126, 74, 255, 0.24);
}

.logout-button {
  appearance: none;
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.32);
  color: rgba(136, 19, 55, 0.88);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.18);
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.24);
  border-color: rgba(239, 68, 68, 0.42);
  color: rgba(136, 19, 55, 1);
  box-shadow: 0 18px 30px rgba(239, 68, 68, 0.24);
}

.login-button {
  background: var(--gradient-primary);
  border-color: rgba(47, 74, 126, 0.32);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.28);
}

.login-button:hover {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  border-color: rgba(47, 74, 126, 0.4);
  color: #ffffff;
  box-shadow: 0 22px 36px rgba(47, 74, 126, 0.32);
}

/* ============================= */
/* APP BACKGROUND FOUNDATION */
/* ============================= */

.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px; /* Account for fixed nav */
}

.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

/* ============================= */
/* SOFT PRIMARY GRADIENT (CALMED) */
/* ============================= */

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(140deg,
    var(--color-primary-dark) 0%,
    var(--color-primary) 55%,
    var(--color-primary-light) 100%);
  opacity: 0.18;   /* ✅ Reduced from 0.28 */
}

/* ============================= */
/* SIMPLIFIED, QUIET PATTERN */
/* ============================= */

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.07) 0%, transparent 60%),
    radial-gradient(circle at 80% 35%, rgba(47, 74, 126, 0.10) 0%, transparent 60%);
  background-size: 900px 900px, 700px 700px;
  animation: floatPattern 40s ease-in-out infinite;
}

/* ============================= */
/* FLOATING ATMOSPHERIC ELEMENTS */
/* ============================= */

.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(6px);
  animation: floatSoft 30s ease-in-out infinite;
}

/* ✅ Reduced sizes for calmer feel */
.floating-element--1 {
  width: 170px;
  height: 170px;
  top: 12%;
  left: 8%;
}

.floating-element--2 {
  width: 125px;
  height: 125px;
  top: 62%;
  right: 12%;
}

.floating-element--3 {
  width: 85px;
  height: 85px;
  bottom: 18%;
  left: 22%;
}

/* ============================= */
/* ANIMATIONS (SOFTER + SLOWER) */
/* ============================= */

@keyframes floatSoft {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-14px);
  }
}

@keyframes floatPattern {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* ============================= */
/* ACCESSIBILITY & PERFORMANCE */
/* ============================= */

@media (prefers-reduced-motion: reduce) {
  .bg-pattern,
  .floating-element {
    animation: none !important;
  }
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.header-content {
  background: var(--header-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-md);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid var(--border-soft);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease;
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
  width: 96px;
  height: 96px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 24px 48px rgba(47, 74, 126, 0.28);
  position: relative;
}

.logo-icon img {
  width: 140%;
  height: auto;
  display: block;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.28;
  filter: blur(12px);
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
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.app-tagline {
  font-size: var(--font-size-xs);
  color: var(--color-primary-light);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
  margin-bottom: 1px;
  text-align: center;
}

.app-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
  margin: 0;
  line-height: var(--line-height-tight);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  margin-bottom: var(--spacing-xs);
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
  color: var(--color-primary-dark);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.saved-meta-copy {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: rgba(47, 74, 126, 0.08);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-medium);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.saved-content {
  flex: 1;
}

.study-content {
  flex: 1;
}

.guest-message {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--header-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid var(--border-soft);
  max-width: 500px;
  margin: 0 auto;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.guest-message-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary);
}

.guest-message h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.guest-message p {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
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
  color: #ffffff;
  box-shadow: 0 18px 36px rgba(47, 74, 126, 0.28);
  border: 1px solid rgba(47, 74, 126, 0.32);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 44px rgba(47, 74, 126, 0.32);
}

.btn-secondary {
  background: var(--card-bg, rgba(255, 255, 255, 0.96));
  color: var(--color-primary);
  border: 1px solid var(--border-soft);
  box-shadow: 0 14px 30px rgba(31, 50, 86, 0.15);
  transition: background 0.3s ease, color 0.3s ease;
}

.btn-secondary:hover {
  background: var(--gradient-primary);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 20px 38px rgba(47, 74, 126, 0.3);
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
  background: var(--footer-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.18);
  border: 1px solid var(--border-soft);
  transition: background 0.3s ease, border-color 0.3s ease;
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
  color: var(--color-text-muted);
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
  background: rgba(47, 74, 126, 0.08);
  border: 1px solid rgba(47, 74, 126, 0.15);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
}

.disclaimer-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.disclaimer-icon svg {
  width: 100%;
  height: 100%;
}

.footer-disclaimer p {
  margin: 0;
  color: var(--color-primary-dark);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-semibold);
}

.footer-disclaimer strong {
  color: var(--color-primary);
}

/* Responsive Design */
/* Tracked Reading Plans Card Styles */
.tracked-plans-card {
  margin-bottom: var(--spacing-lg);
  background: var(--header-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  color: var(--text-main);
  padding: var(--spacing-md);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid var(--border-soft);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.tracked-plans-list {
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tracked-plans-card h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-xs);
  font-weight: semibold;
  font-size: var(--font-size-lg);
  color: var(--text-main);
  border-bottom: 1px solid var(--border-soft);
}

.tracked-plans-card p {
  margin: 0 0 var(--spacing-md) 0;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.tracked-plan-item {
  padding: var(--spacing-xs) 0;
  background-color: var(--color-background-alt, rgba(233, 235, 238, 0.993));
  color: var(--text-main);
  border-bottom: 1px solid var(--border-soft);
  padding-left: 1rem;
  transition: background-color 0.3s ease;
}

.tracked-plan-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
}

.tracked-plan-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
  box-shadow: none;
  transition: background 0.15s;
}
.tracked-plan-link:hover {
  background: rgba(47, 74, 126, 0.08);
}


.tracked-plan-progress {
  color: #108f3c;
  font-weight: bold;
  font-size: var(--font-size-sm);
}
@media (max-width: 768px) {
  .nav-container {
    height: auto;
    padding: var(--spacing-xs) var(--spacing-md);
    flex-wrap: wrap;
  }

  .nav-logo {
    width: 100%;
    justify-content: center;
    margin-bottom: var(--spacing-xs);
    margin-right: 0;
  }

  .nav-logo img {
    height: 64px;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .nav-link,
  .app-nav .nav-tab {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }

  .app-nav .nav-icon {
    width: 1rem;
    height: 1rem;
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
  
  .app-tagline {
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
    padding: var(--spacing-sm) var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-xl);
  }
  
  .app-title {
    font-size: var(--font-size-3xl);
  }

  .logo-icon {
    width: 64px;
    height: 64px;
  }

  .logo-icon img {
    width: 120%;
  }
}

/* Header transition animations */
.header-fade-enter-active,
.header-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.header-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.header-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
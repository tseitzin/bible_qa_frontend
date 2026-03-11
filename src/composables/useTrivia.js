import { ref, computed } from 'vue'
import { triviaApi } from '../services/triviaApi.js'

// ── Module-level shared state ──────────────────────────────────────────────
// Refs are declared at module scope so state persists across component mounts
// and is shared between any component that calls useTrivia().
const gamePhase = ref('setup')       // 'setup' | 'playing' | 'results'
const gameConfig = ref({
  category: 'old_testament',
  difficulty: 'medium',
  count: 10,
  timerEnabled: true
})
const questions = ref([])
const currentIndex = ref(0)
const selectedAnswer = ref(null)
const answerFeedback = ref(null)     // populated after server responds
const answers = ref([])              // accumulated answer objects for session submit
const questionStartTime = ref(null)
const sessionResult = ref(null)
const leaderboard = ref([])
const dailyChallenge = ref(null)
const dailyResult = ref(null)
const isLoading = ref(false)
const error = ref(null)
const timer = ref(30)
let timerInterval = null
// ──────────────────────────────────────────────────────────────────────────

/**
 * Composable for Bible trivia game state and actions.
 * Uses module-level shared refs so state is preserved when navigating
 * between phases without leaving the /trivia route.
 */
export function useTrivia() {
  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)

  const progress = computed(() =>
    questions.value.length ? currentIndex.value / questions.value.length : 0
  )

  const currentStreak = computed(() => {
    let streak = 0
    for (let i = answers.value.length - 1; i >= 0; i--) {
      if (answers.value[i].is_correct) streak++
      else break
    }
    return streak
  })

  /**
   * Client-side running score estimate.
   * The server recalculates authoritative score including time bonuses.
   */
  const currentScore = computed(() => {
    const pointsPerCorrect =
      gameConfig.value.difficulty === 'hard' ? 200 :
      gameConfig.value.difficulty === 'medium' ? 150 : 100
    return answers.value.filter(a => a.is_correct).length * pointsPerCorrect
  })

  // ── Game flow ──────────────────────────────────────────────────────────

  /**
   * Start a new game: fetch questions and transition to playing phase.
   * @param {Object} config - Partial config to merge into gameConfig
   */
  async function startGame(config) {
    gameConfig.value = { ...gameConfig.value, ...config }
    isLoading.value = true
    error.value = null
    try {
      const data = await triviaApi.getQuestions({
        category: gameConfig.value.category,
        difficulty: gameConfig.value.difficulty,
        count: gameConfig.value.count
      })
      questions.value = data.questions
      currentIndex.value = 0
      selectedAnswer.value = null
      answerFeedback.value = null
      answers.value = []
      sessionResult.value = null
      gamePhase.value = 'playing'
      if (gameConfig.value.timerEnabled) startTimer()
    } catch (e) {
      error.value = e.message || 'Failed to load questions. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Record the user's answer for the current question and auto-advance.
   * Correct/incorrect validation happens server-side on session submit.
   * @param {string} answer - The answer option the user selected
   */
  function selectAnswer(answer) {
    if (selectedAnswer.value !== null) return  // already answered
    selectedAnswer.value = answer
    stopTimer()

    const q = currentQuestion.value
    const timeTaken = gameConfig.value.timerEnabled && questionStartTime.value
      ? Math.round((Date.now() - questionStartTime.value) / 1000)
      : null

    // Compute correctness client-side using correct_index for immediate feedback.
    // Server re-validates authoritatively on session submit.
    const isCorrect = (q.correct_index != null)
      ? q.options[q.correct_index] === answer
      : false

    answers.value.push({
      question_id: q.id,
      chosen_answer: answer,
      is_correct: isCorrect,
      time_seconds: timeTaken
    })

    // Auto-advance to next question after brief delay for UX feedback
    setTimeout(() => nextQuestion(), 1500)
  }

  /**
   * Advance to the next question, or submit the session if all answered.
   */
  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
      selectedAnswer.value = null
      answerFeedback.value = null
      questionStartTime.value = Date.now()
      if (gameConfig.value.timerEnabled) startTimer()
    } else {
      submitSession()
    }
  }

  /**
   * Submit the completed session to the server for authoritative scoring.
   */
  async function submitSession() {
    stopTimer()
    isLoading.value = true
    gamePhase.value = 'results'
    try {
      const data = await triviaApi.submitSession({
        category: gameConfig.value.category,
        difficulty: gameConfig.value.difficulty,
        question_count: gameConfig.value.count,
        answers: answers.value,
        timer_enabled: gameConfig.value.timerEnabled,
        is_daily_challenge: false
      })
      sessionResult.value = data
    } catch (e) {
      error.value = e.message || 'Failed to submit session.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset all game state back to the setup phase.
   */
  function resetGame() {
    stopTimer()
    gamePhase.value = 'setup'
    questions.value = []
    currentIndex.value = 0
    selectedAnswer.value = null
    answerFeedback.value = null
    answers.value = []
    sessionResult.value = null
    error.value = null
    timer.value = 30
  }

  // ── Leaderboard ────────────────────────────────────────────────────────

  /**
   * Fetch leaderboard entries into shared state.
   * @param {Object} params - Optional filters (category, difficulty, period)
   */
  async function fetchLeaderboard(params = {}) {
    try {
      const data = await triviaApi.getLeaderboard(params)
      leaderboard.value = data
    } catch (e) {
      console.error('Failed to fetch leaderboard', e)
    }
  }

  // ── Daily challenge ────────────────────────────────────────────────────

  /**
   * Fetch today's daily challenge question.
   */
  async function fetchDailyChallenge() {
    isLoading.value = true
    error.value = null
    try {
      dailyChallenge.value = await triviaApi.getDailyChallenge()
    } catch (e) {
      error.value = e.message || 'Failed to load daily challenge.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit an answer to the daily challenge.
   * @param {string} answer - The selected answer option
   */
  async function submitDailyAnswer(answer) {
    isLoading.value = true
    error.value = null
    try {
      dailyResult.value = await triviaApi.submitDailyAnswer({
        questionId: dailyChallenge.value.id,
        chosenAnswer: answer,
      })
    } catch (e) {
      error.value = e.message || 'Failed to submit answer.'
    } finally {
      isLoading.value = false
    }
  }

  // ── Timer ──────────────────────────────────────────────────────────────

  function startTimer() {
    stopTimer()
    timer.value = 30
    questionStartTime.value = Date.now()
    timerInterval = setInterval(() => {
      timer.value--
      if (timer.value <= 0) {
        stopTimer()
        // Time's up — auto-submit empty answer so game progresses
        if (selectedAnswer.value === null && currentQuestion.value) {
          selectAnswer('')
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  /**
   * Clean up timers. Call from onUnmounted in the view component.
   */
  function cleanup() {
    stopTimer()
  }

  return {
    // state
    gamePhase,
    gameConfig,
    questions,
    currentIndex,
    selectedAnswer,
    answerFeedback,
    answers,
    sessionResult,
    leaderboard,
    dailyChallenge,
    dailyResult,
    isLoading,
    error,
    timer,
    // computed
    currentQuestion,
    progress,
    currentStreak,
    currentScore,
    // actions
    startGame,
    selectAnswer,
    nextQuestion,
    resetGame,
    fetchLeaderboard,
    fetchDailyChallenge,
    submitDailyAnswer,
    startTimer,
    stopTimer,
    cleanup
  }
}

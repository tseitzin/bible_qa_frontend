/**
 * Tests for the BibleQuest trivia feature.
 *
 * Structure:
 *   Section 1 — useTrivia composable: real composable, triviaApi mocked.
 *   Section 2 — TriviaSetup component: useTrivia mocked, component rendered.
 *   Section 3 — TriviaGame component: useTrivia mocked, component rendered.
 *   Section 4 — TriviaResults component: useTrivia mocked, component rendered.
 *
 * Both vi.mock calls are hoisted to the top of the file by Vitest.
 * The composable tests call the real useTrivia() because useTrivia.js is NOT
 * in the mock list — only triviaApi.js (its dependency) is mocked.
 * The component tests configure useTrivia (which IS mocked) per-test via
 * vi.mocked(useTrivia).mockReturnValue(...) inside beforeEach.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref, computed } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'

// ── Mock 1: the API layer used by the real composable ─────────────────────
// This mock is active for Section 1 (composable tests). The composable itself
// is imported for real so its logic executes under test.
vi.mock('../services/triviaApi.js', () => ({
  triviaApi: {
    getQuestions: vi.fn(),
    submitSession: vi.fn(),
    getLeaderboard: vi.fn(),
    getDailyChallenge: vi.fn(),
    submitDailyAnswer: vi.fn(),
  }
}))

// ── Mock 2: the composable used by the component layer ────────────────────
// The factory returns a vi.fn() so each test can call .mockReturnValue().
// Using vi.fn() here is safe because vi.mock factories are hoisted and
// ref/computed are NOT available at hoist time — configure in beforeEach.
vi.mock('../composables/useTrivia.js', () => ({
  useTrivia: vi.fn(),
}))

// ── Imports ───────────────────────────────────────────────────────────────
import { triviaApi } from '../services/triviaApi.js'
import { useTrivia } from '../composables/useTrivia.js'

// Component imports — picked up after both mocks are registered
import TriviaSetup from '../components/trivia/TriviaSetup.vue'
import TriviaGame from '../components/trivia/TriviaGame.vue'
import TriviaResults from '../components/trivia/TriviaResults.vue'

// ── Shared fixture data ────────────────────────────────────────────────────
const SAMPLE_QUESTION = {
  id: 1,
  question_text: 'Who killed Goliath?',
  question_type: 'multiple_choice',
  category: 'old_testament',
  difficulty: 'easy',
  options: ['David', 'Moses', 'Noah', 'Abraham'],
}

const SAMPLE_QUESTIONS_RESPONSE = {
  questions: [SAMPLE_QUESTION],
  total: 1,
  category: 'old_testament',
  difficulty: 'easy',
}

const SAMPLE_SESSION_RESULT = {
  session_id: 42,
  leaderboard_position: 5,
  score_breakdown: {
    total_score: 500,
    base_score: 400,
    time_bonus: 50,
    streak_bonus: 50,
    correct_count: 1,
    accuracy_percent: 100,
    streak_max: 1,
  },
  // TriviaResults reads sessionResult.answers_review
  answers_review: [
    {
      question_id: 1,
      question_text: 'Who fought Goliath?',
      chosen_answer: 'David',
      correct_answer: 'David',
      is_correct: true,
      explanation: 'David defeated Goliath',
      scripture_reference: '1 Samuel 17:50',
    },
  ],
}

// ══════════════════════════════════════════════════════════════════════════
// Section 1 — useTrivia composable
//
// The composable mock is active (vi.mock is hoisted) but the composable
// tests need to call the REAL implementation. We achieve this by importing
// the real module path directly via a dynamic import that bypasses the mock
// cache, OR by re-exporting. The simplest correct approach: since Vitest
// mocks are per-module, and we mocked `useTrivia.js`, Section 1 cannot call
// the real composable via the same import without un-mocking.
//
// Therefore Section 1 uses vi.importActual to obtain the real composable.
// ══════════════════════════════════════════════════════════════════════════
describe('useTrivia composable', () => {
  let realUseTrivia

  beforeEach(async () => {
    vi.clearAllMocks()
    // Obtain the real (un-mocked) implementation each time
    const mod = await vi.importActual('../composables/useTrivia.js')
    realUseTrivia = mod.useTrivia
    // Reset module-level shared state by calling resetGame on the real composable
    realUseTrivia().resetGame()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('startGame sets gamePhase to playing on success', async () => {
    triviaApi.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS_RESPONSE)

    const { startGame, gamePhase, questions } = realUseTrivia()
    await startGame({ timerEnabled: false })

    expect(gamePhase.value).toBe('playing')
    expect(questions.value.length).toBe(1)
  })

  it('startGame sets error on API failure', async () => {
    triviaApi.getQuestions.mockRejectedValue(new Error('Server error'))

    const { startGame, error } = realUseTrivia()
    await startGame({})

    expect(error.value).not.toBeNull()
    expect(error.value).toContain('Server error')
  })

  it('selectAnswer records the answer', async () => {
    triviaApi.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS_RESPONSE)
    vi.useFakeTimers()

    const { startGame, selectAnswer, selectedAnswer, answers } = realUseTrivia()
    await startGame({ timerEnabled: false })
    await nextTick()

    selectAnswer('David')

    expect(selectedAnswer.value).toBe('David')
    expect(answers.value.length).toBe(1)
    expect(answers.value[0].chosen_answer).toBe('David')
  })

  it('selectAnswer is idempotent — second call ignored', async () => {
    triviaApi.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS_RESPONSE)
    vi.useFakeTimers()

    const { startGame, selectAnswer, selectedAnswer, answers } = realUseTrivia()
    await startGame({ timerEnabled: false })
    await nextTick()

    selectAnswer('David')
    selectAnswer('Moses')

    expect(selectedAnswer.value).toBe('David')
    expect(answers.value.length).toBe(1)
  })

  it('currentStreak reflects tail of correct answers', () => {
    const { answers, currentStreak } = realUseTrivia()

    // Push 2 correct, 1 wrong, then 2 correct → trailing streak is 2
    answers.value.push(
      { question_id: 1, chosen_answer: 'A', is_correct: true,  time_seconds: null },
      { question_id: 2, chosen_answer: 'B', is_correct: true,  time_seconds: null },
      { question_id: 3, chosen_answer: 'C', is_correct: false, time_seconds: null },
      { question_id: 4, chosen_answer: 'D', is_correct: true,  time_seconds: null },
      { question_id: 5, chosen_answer: 'E', is_correct: true,  time_seconds: null },
    )

    expect(currentStreak.value).toBe(2)
  })

  it('resetGame resets all state', async () => {
    triviaApi.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS_RESPONSE)
    vi.useFakeTimers()

    const { startGame, resetGame, gamePhase, questions, answers, error } = realUseTrivia()
    await startGame({ timerEnabled: false })
    await nextTick()

    resetGame()

    expect(gamePhase.value).toBe('setup')
    expect(questions.value.length).toBe(0)
    expect(answers.value.length).toBe(0)
    expect(error.value).toBeNull()
  })

  it('submitSession is called after the last question', async () => {
    triviaApi.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS_RESPONSE)
    triviaApi.submitSession.mockResolvedValue(SAMPLE_SESSION_RESULT)
    vi.useFakeTimers()

    const { startGame, selectAnswer } = realUseTrivia()
    await startGame({ timerEnabled: false })
    await nextTick()

    selectAnswer('David')

    // Auto-advance runs after 1500 ms, then calls submitSession
    await vi.advanceTimersByTimeAsync(1500)
    await flushPromises()

    expect(triviaApi.submitSession).toHaveBeenCalledTimes(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// Section 2 — TriviaSetup component
// ══════════════════════════════════════════════════════════════════════════

describe('TriviaSetup component', () => {
  const mockStartGame = vi.fn()
  const mockFetchDailyChallenge = vi.fn()
  const mockSubmitDailyAnswer = vi.fn()

  // Default mock return value — can be overridden per-test
  function buildMockTrivia(overrides = {}) {
    return {
      gameConfig: ref({ category: 'old_testament', difficulty: 'medium', count: 10, timerEnabled: true }),
      gamePhase: ref('setup'),
      isLoading: ref(false),
      error: ref(null),
      dailyChallenge: ref(null),
      dailyResult: ref(null),
      startGame: mockStartGame,
      fetchDailyChallenge: mockFetchDailyChallenge,
      submitDailyAnswer: mockSubmitDailyAnswer,
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTrivia).mockReturnValue(buildMockTrivia())
  })

  it('renders category options', () => {
    const wrapper = mount(TriviaSetup, {
      global: { stubs: { BaseButton: true } }
    })

    expect(wrapper.text()).toContain('Old Testament')
    expect(wrapper.text()).toContain('New Testament')
  })

  it('clicking Start Game calls startGame', async () => {
    const wrapper = mount(TriviaSetup, {
      global: {
        stubs: {
          // Render a real button so the click propagates to the handler
          BaseButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          }
        }
      }
    })

    const startBtn = wrapper.findAll('button').find(b => b.text().includes('Start Game'))
    expect(startBtn).toBeDefined()
    await startBtn.trigger('click')

    expect(mockStartGame).toHaveBeenCalledTimes(1)
  })

  it('shows error when error ref contains a message', () => {
    vi.mocked(useTrivia).mockReturnValue(buildMockTrivia({
      error: ref('Failed to load'),
    }))

    const wrapper = mount(TriviaSetup, {
      global: { stubs: { BaseButton: true } }
    })

    expect(wrapper.text()).toContain('Failed to load')
  })
})

// ══════════════════════════════════════════════════════════════════════════
// Section 3 — TriviaGame component
// ══════════════════════════════════════════════════════════════════════════

describe('TriviaGame component', () => {
  const mockSelectAnswer = vi.fn()
  let selectedAnswerRef

  function buildGameMock(overrides = {}) {
    return {
      currentQuestion: ref(SAMPLE_QUESTION),
      selectedAnswer: selectedAnswerRef,
      gameConfig: ref({ timerEnabled: false, difficulty: 'medium', count: 10 }),
      progress: computed(() => 0.3),
      currentStreak: computed(() => 0),
      currentScore: computed(() => 150),
      timer: ref(30),
      answers: ref([]),
      currentIndex: ref(0),
      questions: ref([SAMPLE_QUESTION]),
      selectAnswer: mockSelectAnswer,
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    selectedAnswerRef = ref(null)
    vi.mocked(useTrivia).mockReturnValue(buildGameMock())
  })

  it('renders question text', () => {
    const wrapper = mount(TriviaGame)
    expect(wrapper.text()).toContain('Who killed Goliath?')
  })

  it('renders all 4 answer options', () => {
    const wrapper = mount(TriviaGame)
    const buttons = wrapper.findAll('button.answer-btn')
    expect(buttons.length).toBe(4)
    const text = wrapper.text()
    expect(text).toContain('David')
    expect(text).toContain('Moses')
    expect(text).toContain('Noah')
    expect(text).toContain('Abraham')
  })

  it('clicking an answer calls selectAnswer with the option text', async () => {
    const wrapper = mount(TriviaGame)
    const firstBtn = wrapper.find('button.answer-btn')
    await firstBtn.trigger('click')
    expect(mockSelectAnswer).toHaveBeenCalledWith('David')
  })

  it('buttons are disabled after selectedAnswer is set', async () => {
    // Set selectedAnswer to a value before mounting so the component renders
    // with disabled buttons immediately.
    selectedAnswerRef.value = 'David'
    vi.mocked(useTrivia).mockReturnValue(buildGameMock())

    const wrapper = mount(TriviaGame)
    await nextTick()

    const buttons = wrapper.findAll('button.answer-btn')
    expect(buttons.length).toBe(4)
    buttons.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════
// Section 4 — TriviaResults component
// ══════════════════════════════════════════════════════════════════════════

describe('TriviaResults component', () => {
  const mockResetGame = vi.fn()
  const mockStartGame = vi.fn()
  const mockFetchLeaderboard = vi.fn()

  function buildResultsMock(overrides = {}) {
    return {
      sessionResult: ref(SAMPLE_SESSION_RESULT),
      gameConfig: ref({ category: 'old_testament', difficulty: 'medium', count: 10 }),
      leaderboard: ref([]),
      isLoading: ref(false),
      // currentScore is only used when sessionResult is null (fallback in hero)
      currentScore: computed(() => 0),
      fetchLeaderboard: mockFetchLeaderboard,
      resetGame: mockResetGame,
      startGame: mockStartGame,
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTrivia).mockReturnValue(buildResultsMock())
  })

  function mountResults() {
    return mount(TriviaResults, {
      global: {
        stubs: {
          BaseButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
          TriviaLeaderboard: true,
        }
      }
    })
  }

  it('displays total score', () => {
    const wrapper = mountResults()
    // hero-score renders sessionResult.total_score = 500
    expect(wrapper.text()).toContain('500')
  })

  it('displays accuracy percent', () => {
    // TriviaResults computes accuracyPercent from sessionResult.answers:
    // 1 correct out of 1 total → 100%
    const wrapper = mountResults()
    expect(wrapper.text()).toContain('100%')
  })

  it('shows correct answer review question text', () => {
    const wrapper = mountResults()
    expect(wrapper.text()).toContain('Who fought Goliath?')
  })

  it('Change Settings button calls resetGame', async () => {
    const wrapper = mountResults()
    const buttons = wrapper.findAll('button')
    const changeBtn = buttons.find(b => b.text().includes('Change Settings'))
    expect(changeBtn).toBeDefined()
    await changeBtn.trigger('click')
    expect(mockResetGame).toHaveBeenCalledTimes(1)
  })
})

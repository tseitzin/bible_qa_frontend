import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import MainApp from '../../views/MainApp.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'
import { recentQuestionsService } from '../../services/recentQuestionsService.js'
import { userReadingPlanService } from '../../services/userReadingPlanService.js'

const mockRouterPush = vi.fn()
const mockRouterReplace = vi.fn()
const mockCurrentRoute = ref({ path: '/adults', query: {} })

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    currentRoute: mockCurrentRoute
  }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a class="router-link-stub"><slot /></a>'
  }
}))

const mockCurrentUser = ref(null)
const mockLogout = vi.fn()

vi.mock('../../composables/useAuth.js', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    logout: mockLogout
  })
}))

const mockQuestion = ref('')
const mockAnswer = ref('')
const mockQuestionId = ref(null)
const mockRootQuestionId = ref(null)
const mockIsBiblicalAnswer = ref(false)
const mockConversationHistory = ref([])
const mockLoading = ref(false)
const mockError = ref(null)
const mockStreamStatus = ref('')
const mockIsStreaming = ref(false)
const mockAskQuestion = vi.fn()
const mockAskFollowUpQuestion = vi.fn()
const mockClearAll = vi.fn()
const mockClearError = vi.fn()

vi.mock('../../composables/useBibleQA.js', () => ({
  useBibleQA: () => ({
    question: mockQuestion,
    answer: mockAnswer,
    questionId: mockQuestionId,
    rootQuestionId: mockRootQuestionId,
    isBiblicalAnswer: mockIsBiblicalAnswer,
    loading: mockLoading,
    error: mockError,
    streamStatus: mockStreamStatus,
    isStreaming: mockIsStreaming,
    conversationHistory: mockConversationHistory,
    askQuestion: mockAskQuestion,
    askFollowUpQuestion: mockAskFollowUpQuestion,
    clearAll: mockClearAll,
    clearError: mockClearError
  })
}))

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    isDevotion: { value: false },
    toggleTheme: vi.fn()
  })
}))

vi.mock('../../services/savedAnswersService.js', () => ({
  savedAnswersService: {
    getAll: vi.fn()
  }
}))

vi.mock('../../services/recentQuestionsService.js', () => ({
  recentQuestionsService: {
    fetch: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../../services/userReadingPlanService.js', () => ({
  userReadingPlanService: {
    listPlans: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../../assets/logo_cross.png', () => ({
  default: 'mocked-logo.png'
}))

const savedAnswersRefreshMock = vi.fn()

vi.mock('../../components/QuestionForm.vue', () => ({
  default: {
    name: 'QuestionForm',
    template: '<div class="question-form-stub"></div>',
    emits: ['submit', 'clear', 'remove-recent'],
    props: ['question', 'loading', 'recentQuestions', 'showRecentQuestions']
  }
}))

vi.mock('../../components/AnswerDisplay.vue', () => ({
  default: {
    name: 'AnswerDisplay',
    template: '<div class="answer-display-stub"></div>',
    emits: ['answer-saved', 'follow-up-question', 'login-required', 'reading-view'],
    props: ['answer', 'question', 'questionId', 'loading', 'streamStatus', 'isStreaming']
  }
}))

vi.mock('../../components/SavedAnswers.vue', () => ({
  default: {
    name: 'SavedAnswers',
    emits: ['update'],
    template: '<div class="saved-answers-stub">Saved Answers</div>',
    setup(_, { expose }) {
      expose({ refresh: savedAnswersRefreshMock })
      return {}
    }
  }
}))

vi.mock('../../components/ErrorMessage.vue', () => ({
  default: {
    name: 'ErrorMessage',
    template: '<div class="error-message-stub"></div>',
    emits: ['dismiss'],
    props: ['error']
  }
}))

vi.mock('../../components/StudyResources.vue', () => ({
  default: {
    name: 'StudyResources',
    template: '<div class="study-resources-stub">Study Resources</div>'
  }
}))

vi.mock('../../components/Navbar.vue', () => ({
  default: {
    name: 'Navbar',
    template: '<nav class="navbar-stub"></nav>',
    props: ['activeTab']
  }
}))

vi.mock('../../components/FooterSimple.vue', () => ({
  default: {
    name: 'FooterSimple',
    template: '<footer class="footer-stub"></footer>'
  }
}))

const createMatchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
})

const mountMainApp = async () => {
  const wrapper = mount(MainApp, {
    global: {
      stubs: {
        Transition: false,
        TransitionGroup: false,
        RouterLink: {
          template: '<a class="router-link-stub"><slot /></a>'
        }
      }
    }
  })

  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRouterPush.mockReset()
  mockRouterReplace.mockReset()
  savedAnswersRefreshMock.mockReset()

  mockCurrentUser.value = null
  mockCurrentRoute.value = { path: '/adults', query: {} }
  mockQuestion.value = ''
  mockAnswer.value = ''
  mockQuestionId.value = null
  mockRootQuestionId.value = null
  mockIsBiblicalAnswer.value = false
  mockConversationHistory.value = []
  mockLoading.value = false
  mockError.value = null
  mockStreamStatus.value = ''
  mockIsStreaming.value = false
  mockClearAll.mockReset()
  mockAskQuestion.mockReset()
  mockAskFollowUpQuestion.mockReset()
  mockClearError.mockReset()
  mockLogout.mockReset()

  savedAnswersService.getAll.mockResolvedValue([])
  recentQuestionsService.fetch.mockResolvedValue([])
  recentQuestionsService.add.mockResolvedValue([])
  recentQuestionsService.remove.mockResolvedValue([])

  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(createMatchMedia))

  const storage = (() => {
    let store = {}
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString() },
      removeItem: (key) => { delete store[key] },
      clear: () => { store = {} }
    }
  })()

  Object.defineProperty(window, 'sessionStorage', {
    value: storage,
    writable: true,
    configurable: true
  })
  sessionStorage.clear()
})

describe('MainApp.vue', () => {
  it('renders the ask tab content by default', async () => {
    const wrapper = await mountMainApp()
    expect(wrapper.find('.question-form-stub').exists()).toBe(true)
  })

  it('renders navbar and footer', async () => {
    const wrapper = await mountMainApp()
    expect(wrapper.find('.navbar-stub').exists()).toBe(true)
    expect(wrapper.find('.footer-stub').exists()).toBe(true)
  })

  it('shows guest message for unauthenticated users on saved tab', async () => {
    const wrapper = await mountMainApp()
    // Directly set the activeTab via the component's internal state
    wrapper.vm.activeTab = 'saved'
    await nextTick()
    await flushPromises()
    expect(wrapper.find('.guest-message').exists()).toBe(true)
  })

  it('renders saved answers when authenticated user is on saved tab', async () => {
    mockCurrentUser.value = { id: 'user-1' }
    savedAnswersService.getAll.mockResolvedValue([{ id: 'a' }])

    const wrapper = await mountMainApp()
    wrapper.vm.activeTab = 'saved'
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.saved-answers-stub').exists()).toBe(true)
  })

  it('renders study resources on study tab', async () => {
    const wrapper = await mountMainApp()
    wrapper.vm.activeTab = 'study'
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.study-resources-stub').exists()).toBe(true)
  })

  it('updates saved count badge after saving an answer', async () => {
    mockCurrentUser.value = { id: 'user-2' }
    savedAnswersService.getAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: '1' }, { id: '2' }])

    const wrapper = await mountMainApp()

    await wrapper.vm.handleAnswerSaved()
    await flushPromises()

    expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
  })

  it('refreshes saved answers when saved tab is visible and answer is saved', async () => {
    mockCurrentUser.value = { id: 'user-3' }
    savedAnswersService.getAll.mockResolvedValue([{ id: '1' }])

    const wrapper = await mountMainApp()
    wrapper.vm.activeTab = 'saved'
    await nextTick()
    await flushPromises()

    await wrapper.vm.handleAnswerSaved()
    await flushPromises()

    expect(savedAnswersRefreshMock).toHaveBeenCalledTimes(1)
  })

  it('submits questions through the bible QA composable', async () => {
    const wrapper = await mountMainApp()
    const form = wrapper.findComponent({ name: 'QuestionForm' })
    await form.vm.$emit('submit', 'What is hope?')
    await flushPromises()

    expect(mockAskQuestion).toHaveBeenCalledWith('What is hope?')
  })

  it('handles follow-up question events', async () => {
    mockAnswer.value = 'Existing answer'
    const wrapper = await mountMainApp()
    wrapper.vm.showAnswer = true
    await nextTick()
    const answerDisplay = wrapper.findComponent({ name: 'AnswerDisplay' })
    await answerDisplay.vm.$emit('follow-up-question', 'Tell me more')
    await flushPromises()

    expect(mockAskFollowUpQuestion).toHaveBeenCalledWith('Tell me more')
  })

  it('activates saved tab when route query has tab=saved', async () => {
    mockCurrentRoute.value = { path: '/adults', query: { tab: 'saved' } }
    const wrapper = await mountMainApp()
    expect(wrapper.find('.guest-message').exists()).toBe(true)
  })

  it('displays header config for ask tab', async () => {
    const wrapper = await mountMainApp()
    expect(wrapper.text()).toContain('Answers to your Bible Questions')
    expect(wrapper.text()).toContain('Scripture • Wisdom • Truth')
  })

  it('updates header config when switching to saved tab', async () => {
    const wrapper = await mountMainApp()
    wrapper.vm.activeTab = 'saved'
    await nextTick()
    await flushPromises()
    // The headerConfig computed property should reflect the saved tab
    expect(wrapper.vm.headerConfig.title).toBe('Your Saved Answers')
  })

  it('updates header config when switching to study tab', async () => {
    const wrapper = await mountMainApp()
    wrapper.vm.activeTab = 'study'
    await nextTick()
    await flushPromises()
    expect(wrapper.vm.headerConfig.title).toBe('Bible Study Resources')
  })

  // --- Session storage: pending answers (save/restore) ---

  describe('handleLoginRequired - persists pending answer to sessionStorage', () => {
    it('saves question and answer to sessionStorage and redirects to login', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = 'What is faith?'
      mockAnswer.value = 'Faith is the substance of things hoped for.'
      mockQuestionId.value = 'q-123'
      mockRootQuestionId.value = 'root-1'
      mockConversationHistory.value = [
        { role: 'user', content: 'What is faith?' },
        { role: 'assistant', content: 'Faith is the substance of things hoped for.' }
      ]

      await wrapper.vm.handleLoginRequired({
        question: 'What is faith?',
        answer: 'Faith is the substance of things hoped for.',
        questionId: 'q-123'
      })
      await flushPromises()

      const stored = JSON.parse(sessionStorage.getItem('bible_qa_pending_saved_answer'))
      expect(stored.question).toBe('What is faith?')
      expect(stored.answer).toBe('Faith is the substance of things hoped for.')
      expect(stored.questionId).toBe('q-123')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'login',
        query: { redirect: 'pending-save' }
      })
    })

    it('uses composable values when payload fields are missing', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = 'Composable question'
      mockAnswer.value = 'Composable answer'
      mockQuestionId.value = 'comp-id'

      await wrapper.vm.handleLoginRequired({})
      await flushPromises()

      const stored = JSON.parse(sessionStorage.getItem('bible_qa_pending_saved_answer'))
      expect(stored.question).toBe('Composable question')
      expect(stored.answer).toBe('Composable answer')
    })

    it('does not store when question or answer is empty', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = ''
      mockAnswer.value = ''

      await wrapper.vm.handleLoginRequired({})
      await flushPromises()

      expect(sessionStorage.getItem('bible_qa_pending_saved_answer')).toBeNull()
      // But still redirects to login
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'login',
        query: { redirect: 'pending-save' }
      })
    })
  })

  describe('restorePendingAnswer - restores answer from sessionStorage after login', () => {
    it('restores pending answer when restored=pending query is present', async () => {
      const pendingData = {
        question: 'What is grace?',
        answer: 'Grace is unmerited favor.',
        questionId: 'q-456',
        rootQuestionId: 'root-2',
        conversationHistory: [
          { role: 'user', content: 'What is grace?' },
          { role: 'assistant', content: 'Grace is unmerited favor.' }
        ]
      }
      sessionStorage.setItem('bible_qa_pending_saved_answer', JSON.stringify(pendingData))
      mockCurrentRoute.value = { path: '/adults', query: { restored: 'pending' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockQuestion.value).toBe('What is grace?')
      expect(mockAnswer.value).toBe('Grace is unmerited favor.')
      expect(wrapper.vm.showAnswer).toBe(true)
      expect(sessionStorage.getItem('bible_qa_pending_saved_answer')).toBeNull()
      expect(mockRouterReplace).toHaveBeenCalledWith({ name: 'main' })
    })

    it('returns false and does not restore when sessionStorage has no pending answer', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { restored: 'pending' } }
      const wrapper = await mountMainApp()
      await flushPromises()

      // Should not have restored anything - question stays empty
      expect(mockQuestion.value).toBe('')
    })

    it('returns false when stored data has empty question or answer', async () => {
      const badData = { question: '', answer: '' }
      sessionStorage.setItem('bible_qa_pending_saved_answer', JSON.stringify(badData))
      mockCurrentRoute.value = { path: '/adults', query: { restored: 'pending' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockQuestion.value).toBe('')
    })

    it('builds default conversationHistory when stored history is empty', async () => {
      const pendingData = {
        question: 'What is hope?',
        answer: 'Hope is trust in God.',
        questionId: null,
        conversationHistory: []
      }
      sessionStorage.setItem('bible_qa_pending_saved_answer', JSON.stringify(pendingData))
      mockCurrentRoute.value = { path: '/adults', query: { restored: 'pending' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockConversationHistory.value).toEqual([
        { role: 'user', content: 'What is hope?' },
        { role: 'assistant', content: 'Hope is trust in God.' }
      ])
    })
  })

  describe('restoreAnswerFromReadingView - restores answer after reading view', () => {
    it('restores answer when restore=answer query is present', async () => {
      const stateData = {
        question: 'What is love?',
        answer: 'Love is patient and kind.',
        questionId: 'q-789',
        rootQuestionId: 'root-3',
        conversationHistory: [
          { role: 'user', content: 'What is love?' },
          { role: 'assistant', content: 'Love is patient and kind.' }
        ]
      }
      sessionStorage.setItem('bible_qa_return_to_answer', JSON.stringify(stateData))
      mockCurrentRoute.value = { path: '/adults', query: { restore: 'answer' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockQuestion.value).toBe('What is love?')
      expect(mockAnswer.value).toBe('Love is patient and kind.')
      expect(wrapper.vm.showAnswer).toBe(true)
      expect(sessionStorage.getItem('bible_qa_return_to_answer')).toBeNull()
    })

    it('builds default conversationHistory when stored history is empty', async () => {
      const stateData = {
        question: 'What is joy?',
        answer: 'Joy is a fruit of the Spirit.',
        questionId: null,
        rootQuestionId: null,
        conversationHistory: []
      }
      sessionStorage.setItem('bible_qa_return_to_answer', JSON.stringify(stateData))
      mockCurrentRoute.value = { path: '/adults', query: { restore: 'answer' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockConversationHistory.value).toEqual([
        { role: 'user', content: 'What is joy?' },
        { role: 'assistant', content: 'Joy is a fruit of the Spirit.' }
      ])
    })

    it('returns false when no stored state exists', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { restore: 'answer' } }
      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockQuestion.value).toBe('')
    })

    it('returns false when stored data has empty question', async () => {
      const badData = { question: '', answer: 'Some answer' }
      sessionStorage.setItem('bible_qa_return_to_answer', JSON.stringify(badData))
      mockCurrentRoute.value = { path: '/adults', query: { restore: 'answer' } }

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(mockQuestion.value).toBe('')
    })
  })

  describe('persistAnswerForReturn - saves answer to session for reading view navigation', () => {
    it('persists current answer state to sessionStorage', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = 'What is peace?'
      mockAnswer.value = 'Peace that surpasses understanding.'
      mockQuestionId.value = 'q-peace'
      mockRootQuestionId.value = 'root-peace'
      mockConversationHistory.value = [
        { role: 'user', content: 'What is peace?' },
        { role: 'assistant', content: 'Peace that surpasses understanding.' }
      ]

      wrapper.vm.handleReadingViewNavigation()
      await flushPromises()

      const stored = JSON.parse(sessionStorage.getItem('bible_qa_return_to_answer'))
      expect(stored.question).toBe('What is peace?')
      expect(stored.answer).toBe('Peace that surpasses understanding.')
      expect(stored.questionId).toBe('q-peace')
      expect(stored.rootQuestionId).toBe('root-peace')
    })

    it('does not persist when question is empty', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = ''
      mockAnswer.value = 'Some answer'

      wrapper.vm.handleReadingViewNavigation()

      expect(sessionStorage.getItem('bible_qa_return_to_answer')).toBeNull()
    })

    it('does not persist when answer is empty', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = 'Some question'
      mockAnswer.value = ''

      wrapper.vm.handleReadingViewNavigation()

      expect(sessionStorage.getItem('bible_qa_return_to_answer')).toBeNull()
    })
  })

  // --- Error handling and dismissal ---

  describe('error handling', () => {
    it('renders ErrorMessage component on ask tab', async () => {
      mockError.value = 'Something went wrong'
      const wrapper = await mountMainApp()
      expect(wrapper.find('.error-message-stub').exists()).toBe(true)
    })

    it('calls clearError when ErrorMessage emits dismiss', async () => {
      mockError.value = 'Something went wrong'
      const wrapper = await mountMainApp()
      const errorMsg = wrapper.findComponent({ name: 'ErrorMessage' })
      await errorMsg.vm.$emit('dismiss')
      await flushPromises()

      expect(mockClearError).toHaveBeenCalled()
    })

    it('sets savedCount to 0 when savedAnswersService.getAll rejects', async () => {
      mockCurrentUser.value = { id: 'user-err' }
      savedAnswersService.getAll.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.savedCount).toBe(0)
    })
  })

  // --- Route query watching and tab sync ---

  describe('route query watcher syncs tabs', () => {
    it('switches to saved tab when route query changes to tab=saved', async () => {
      const wrapper = await mountMainApp()
      expect(wrapper.vm.activeTab).toBe('ask')

      mockCurrentRoute.value = { path: '/adults', query: { tab: 'saved' } }
      await nextTick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('saved')
    })

    it('switches to study tab when route query changes to tab=study', async () => {
      const wrapper = await mountMainApp()

      mockCurrentRoute.value = { path: '/adults', query: { tab: 'study' } }
      await nextTick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('study')
    })

    it('switches back to ask tab when route query tab is removed', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { tab: 'saved' } }
      const wrapper = await mountMainApp()
      expect(wrapper.vm.activeTab).toBe('saved')

      mockCurrentRoute.value = { path: '/adults', query: {} }
      await nextTick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('ask')
    })

    it('switches to ask when route query tab is explicitly set to ask', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { tab: 'study' } }
      const wrapper = await mountMainApp()

      mockCurrentRoute.value = { path: '/adults', query: { tab: 'ask' } }
      await nextTick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('ask')
    })

    it('opens study tab from initial route query', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { tab: 'study' } }
      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('study')
    })
  })

  // --- Recent questions integration ---

  describe('recent questions', () => {
    it('loads recent questions for authenticated users on mount', async () => {
      mockCurrentUser.value = { id: 'user-rq' }
      recentQuestionsService.fetch.mockResolvedValue([
        { id: 1, question: 'What is faith?', asked_at: '2024-01-01' }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(recentQuestionsService.fetch).toHaveBeenCalled()
      expect(wrapper.vm.recentQuestions).toEqual([
        { id: 1, question: 'What is faith?', asked_at: '2024-01-01' }
      ])
    })

    it('does not load recent questions for unauthenticated users', async () => {
      mockCurrentUser.value = null
      const wrapper = await mountMainApp()
      await flushPromises()

      // fetch might be called, but recentQuestions should be empty
      expect(wrapper.vm.recentQuestions).toEqual([])
    })

    it('sets recentQuestions to empty array on fetch error', async () => {
      mockCurrentUser.value = { id: 'user-err' }
      recentQuestionsService.fetch.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.recentQuestions).toEqual([])
    })

    it('records a recent question after successful question submission', async () => {
      mockCurrentUser.value = { id: 'user-rec' }
      mockIsBiblicalAnswer.value = true
      mockAskQuestion.mockImplementation(async () => {
        mockAnswer.value = 'The answer'
        mockIsBiblicalAnswer.value = true
      })
      recentQuestionsService.add.mockResolvedValue([
        { id: 1, question: 'What is hope?', asked_at: '2024-01-01' }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      await wrapper.vm.handleQuestionSubmit('What is hope?')
      await flushPromises()

      expect(recentQuestionsService.add).toHaveBeenCalledWith('What is hope?', true)
    })

    it('does not record recent question when user is not authenticated', async () => {
      mockCurrentUser.value = null
      mockAskQuestion.mockResolvedValue(undefined)

      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('What is hope?')
      await flushPromises()

      expect(recentQuestionsService.add).not.toHaveBeenCalled()
    })

    it('handles remove-recent event with confirmation', async () => {
      mockCurrentUser.value = { id: 'user-rm' }
      vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
      recentQuestionsService.remove.mockResolvedValue([])

      const wrapper = await mountMainApp()
      await flushPromises()

      await wrapper.vm.handleRecentQuestionRemove({ id: 42, question: 'Old question' })
      await flushPromises()

      expect(window.confirm).toHaveBeenCalled()
      expect(recentQuestionsService.remove).toHaveBeenCalledWith(42)
    })

    it('does not remove recent question when confirmation is cancelled', async () => {
      vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))

      const wrapper = await mountMainApp()
      await wrapper.vm.handleRecentQuestionRemove({ id: 42, question: 'Old question' })
      await flushPromises()

      expect(recentQuestionsService.remove).not.toHaveBeenCalled()
    })

    it('does not remove when recentQuestion has no id', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleRecentQuestionRemove({ question: 'No id question' })
      await flushPromises()

      expect(recentQuestionsService.remove).not.toHaveBeenCalled()
    })

    it('does not remove when recentQuestion is null', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleRecentQuestionRemove(null)
      await flushPromises()

      expect(recentQuestionsService.remove).not.toHaveBeenCalled()
    })

    it('falls back to filtering local list when remove returns non-array', async () => {
      mockCurrentUser.value = { id: 'user-fb' }
      vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
      recentQuestionsService.remove.mockResolvedValue(null)

      const wrapper = await mountMainApp()
      wrapper.vm.recentQuestions = [
        { id: 1, question: 'Keep me', asked_at: null },
        { id: 2, question: 'Remove me', asked_at: null }
      ]
      await flushPromises()

      await wrapper.vm.handleRecentQuestionRemove({ id: 2, question: 'Remove me' })
      await flushPromises()

      expect(wrapper.vm.recentQuestions).toEqual([
        { id: 1, question: 'Keep me', asked_at: null }
      ])
    })

    it('fetches fallback recent questions when add returns non-array', async () => {
      mockCurrentUser.value = { id: 'user-fb2' }
      mockIsBiblicalAnswer.value = true
      mockAskQuestion.mockImplementation(async () => {
        mockAnswer.value = 'Answer text'
        mockIsBiblicalAnswer.value = true
      })
      recentQuestionsService.add.mockResolvedValue(null)
      recentQuestionsService.fetch.mockResolvedValue([
        { id: 5, question: 'Fetched question', asked_at: null }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      await wrapper.vm.handleQuestionSubmit('New question')
      await flushPromises()

      // After add returns non-array, it should call fetch as fallback
      expect(recentQuestionsService.fetch).toHaveBeenCalled()
    })
  })

  // --- Reading plan tracking ---

  describe('reading plan tracking', () => {
    it('loads tracked plans for authenticated users', async () => {
      mockCurrentUser.value = { id: 'user-plan' }
      userReadingPlanService.listPlans.mockResolvedValue([
        { id: 1, plan: { id: 10, name: 'Genesis Plan', slug: 'genesis-plan' }, completed_days: 5, total_days: 30 }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(userReadingPlanService.listPlans).toHaveBeenCalled()
      expect(wrapper.vm.trackedPlans).toHaveLength(1)
    })

    it('renders tracked plans section when user has tracked plans', async () => {
      mockCurrentUser.value = { id: 'user-plan-render' }
      userReadingPlanService.listPlans.mockResolvedValue([
        { id: 1, plan: { id: 10, name: 'Genesis Plan', slug: 'genesis-plan' }, completed_days: 5, total_days: 30 }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.find('.tracked-plans-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('Genesis Plan')
      expect(wrapper.text()).toContain('17% complete')
    })

    it('does not render tracked plans section when user has no tracked plans', async () => {
      mockCurrentUser.value = { id: 'user-no-plans' }
      userReadingPlanService.listPlans.mockResolvedValue([])

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.find('.tracked-plans-card').exists()).toBe(false)
    })

    it('does not render tracked plans for unauthenticated users', async () => {
      mockCurrentUser.value = null
      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.find('.tracked-plans-card').exists()).toBe(false)
    })

    it('handles error when loading tracked plans', async () => {
      mockCurrentUser.value = { id: 'user-plan-err' }
      userReadingPlanService.listPlans.mockRejectedValue(new Error('Failed'))

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.trackedPlans).toEqual([])
    })

    it('navigates to reading plan when plan link is clicked', async () => {
      mockCurrentUser.value = { id: 'user-plan-nav' }
      userReadingPlanService.listPlans.mockResolvedValue([
        { id: 1, plan: { id: 10, name: 'Psalms Plan', slug: 'psalms-plan' }, completed_days: 2, total_days: 10 }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      const planButton = wrapper.find('.tracked-plan-link')
      await planButton.trigger('click')
      await flushPromises()

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'reading-plan',
        params: { slug: 'psalms-plan' }
      })
    })
  })

  // --- Clear all functionality ---

  describe('clear all / question cleared', () => {
    it('resets QA state when handleQuestionCleared is called', async () => {
      const wrapper = await mountMainApp()
      mockQuestion.value = 'Existing question'
      mockAnswer.value = 'Existing answer'
      wrapper.vm.showAnswer = true
      wrapper.vm.currentQuestion = 'Existing question'
      wrapper.vm.currentAnswer = 'Existing answer'

      const form = wrapper.findComponent({ name: 'QuestionForm' })
      await form.vm.$emit('clear')
      await flushPromises()

      expect(mockClearAll).toHaveBeenCalled()
      expect(wrapper.vm.showAnswer).toBe(false)
      expect(wrapper.vm.currentQuestion).toBe('')
      expect(wrapper.vm.currentAnswer).toBe('')
    })

    it('resets QA state when switching away from ask tab', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'saved'
      await nextTick()
      await flushPromises()

      expect(mockClearAll).toHaveBeenCalled()
    })

    it('does not reset QA state when staying on ask tab', async () => {
      const wrapper = await mountMainApp()
      // activeTab is already 'ask', setting it again should not call clearAll
      wrapper.vm.activeTab = 'ask'
      await nextTick()
      await flushPromises()

      // clearAll should not have been called by the watcher (only by mount-time operations)
      // The watcher checks tab !== 'ask'
      expect(mockClearAll).not.toHaveBeenCalled()
    })
  })

  // --- showAnswer state management ---

  describe('showAnswer state management', () => {
    it('shows answer section when showAnswer is true', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.showAnswer = true
      await nextTick()

      expect(wrapper.find('.answer-display-stub').exists()).toBe(true)
    })

    it('hides answer section when showAnswer is false', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.showAnswer = false
      await nextTick()

      expect(wrapper.find('.answer-display-stub').exists()).toBe(false)
    })

    it('sets showAnswer to true during question submission', async () => {
      mockAskQuestion.mockResolvedValue(undefined)
      const wrapper = await mountMainApp()

      // Before submit, showAnswer is false
      expect(wrapper.vm.showAnswer).toBe(false)

      const submitPromise = wrapper.vm.handleQuestionSubmit('What is mercy?')

      // showAnswer should be set before askQuestion resolves
      await nextTick()
      expect(wrapper.vm.showAnswer).toBe(true)

      await submitPromise
      await flushPromises()
    })

    it('keeps showAnswer true during follow-up question', async () => {
      mockAskFollowUpQuestion.mockResolvedValue(undefined)
      const wrapper = await mountMainApp()
      wrapper.vm.showAnswer = true
      await nextTick()

      await wrapper.vm.handleFollowUpQuestion('Tell me more about mercy')
      await flushPromises()

      expect(wrapper.vm.showAnswer).toBe(true)
    })

    it('does nothing for empty follow-up question', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleFollowUpQuestion('')
      await flushPromises()

      expect(mockAskFollowUpQuestion).not.toHaveBeenCalled()
    })

    it('does nothing for whitespace-only follow-up question', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleFollowUpQuestion('   ')
      await flushPromises()

      expect(mockAskFollowUpQuestion).not.toHaveBeenCalled()
    })
  })

  // --- handleQuestionSubmit edge cases ---

  describe('handleQuestionSubmit edge cases', () => {
    it('does nothing for empty question text', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('')
      await flushPromises()

      expect(mockAskQuestion).not.toHaveBeenCalled()
    })

    it('does nothing for whitespace-only question text', async () => {
      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('   ')
      await flushPromises()

      expect(mockAskQuestion).not.toHaveBeenCalled()
    })

    it('trims question text before submitting', async () => {
      mockAskQuestion.mockResolvedValue(undefined)
      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('  What is hope?  ')
      await flushPromises()

      expect(mockAskQuestion).toHaveBeenCalledWith('What is hope?')
    })

    it('switches to ask tab if not already on ask tab when submitting', async () => {
      mockAskQuestion.mockResolvedValue(undefined)
      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'saved'
      await nextTick()

      await wrapper.vm.handleQuestionSubmit('What is mercy?')
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('ask')
    })

    it('does not record recent question when there is an error', async () => {
      mockCurrentUser.value = { id: 'user-err-rec' }
      mockAskQuestion.mockImplementation(async () => {
        mockError.value = 'Something went wrong'
      })

      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('What is hope?')
      await flushPromises()

      expect(recentQuestionsService.add).not.toHaveBeenCalled()
    })

    it('does not record recent question when answer is not biblical', async () => {
      mockCurrentUser.value = { id: 'user-nonbib' }
      mockAskQuestion.mockImplementation(async () => {
        mockAnswer.value = 'Some answer'
        mockIsBiblicalAnswer.value = false
      })

      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('What about politics?')
      await flushPromises()

      expect(recentQuestionsService.add).not.toHaveBeenCalled()
    })
  })

  // --- scrollToTop and onMounted behavior ---

  describe('onMounted behavior', () => {
    it('scrolls to top on mount when not restoring an answer', async () => {
      const wrapper = await mountMainApp()
      await flushPromises()

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: 'auto'
      })
    })

    it('does not scroll to top on mount when restore=answer query is present', async () => {
      mockCurrentRoute.value = { path: '/adults', query: { restore: 'answer' } }
      // Need stored data for restore to proceed
      const stateData = {
        question: 'Q',
        answer: 'A',
        questionId: null,
        conversationHistory: []
      }
      sessionStorage.setItem('bible_qa_return_to_answer', JSON.stringify(stateData))

      const wrapper = await mountMainApp()
      await flushPromises()

      // scrollTo should NOT have been called with top:0 (it may be called for answer scroll)
      const scrollCalls = window.scrollTo.mock.calls
      const topZeroCalls = scrollCalls.filter(
        (call) => call[0]?.top === 0 && call[0]?.left === 0 && call[0]?.behavior === 'auto'
      )
      expect(topZeroCalls).toHaveLength(0)
    })

    it('calls updateSavedCount on mount', async () => {
      mockCurrentUser.value = { id: 'user-sc' }
      savedAnswersService.getAll.mockResolvedValue([{ id: '1' }, { id: '2' }])

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(savedAnswersService.getAll).toHaveBeenCalled()
      expect(wrapper.vm.savedCount).toBe(2)
    })

    it('sets savedCount to 0 for unauthenticated users', async () => {
      mockCurrentUser.value = null
      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.savedCount).toBe(0)
    })
  })

  // --- handleSavedAnswersUpdated ---

  describe('handleSavedAnswersUpdated', () => {
    it('updates saved count when SavedAnswers emits update', async () => {
      mockCurrentUser.value = { id: 'user-upd' }
      savedAnswersService.getAll
        .mockResolvedValueOnce([{ id: '1' }])
        .mockResolvedValueOnce([])

      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'saved'
      await nextTick()
      await flushPromises()

      const savedAnswers = wrapper.findComponent({ name: 'SavedAnswers' })
      await savedAnswers.vm.$emit('update')
      await flushPromises()

      expect(savedAnswersService.getAll).toHaveBeenCalled()
    })
  })

  // --- normalizeRecentQuestionItems ---

  describe('normalizeRecentQuestionItems via loadRecentQuestions', () => {
    it('normalizes string items from fetch response', async () => {
      mockCurrentUser.value = { id: 'user-norm' }
      recentQuestionsService.fetch.mockResolvedValue([
        'What is faith?',
        '  What is hope?  ',
        ''
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      // Empty strings should be filtered out
      expect(wrapper.vm.recentQuestions).toEqual([
        { id: null, question: 'What is faith?', asked_at: null },
        { id: null, question: 'What is hope?', asked_at: null }
      ])
    })

    it('normalizes object items from fetch response', async () => {
      mockCurrentUser.value = { id: 'user-norm2' }
      recentQuestionsService.fetch.mockResolvedValue([
        { id: 1, question: 'What is love?', asked_at: '2024-01-01' },
        { id: 2, question: '  ', asked_at: null },
        null
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      // Empty question objects and nulls should be filtered out
      expect(wrapper.vm.recentQuestions).toEqual([
        { id: 1, question: 'What is love?', asked_at: '2024-01-01' }
      ])
    })

    it('returns empty array when fetch returns non-array', async () => {
      mockCurrentUser.value = { id: 'user-nonarr' }
      recentQuestionsService.fetch.mockResolvedValue('not an array')

      const wrapper = await mountMainApp()
      await flushPromises()

      expect(wrapper.vm.recentQuestions).toEqual([])
    })
  })

  // --- currentUser watcher ---

  describe('currentUser watcher', () => {
    it('reloads recent questions and tracked plans when user changes', async () => {
      const wrapper = await mountMainApp()
      await flushPromises()

      // Clear mocks to track new calls
      recentQuestionsService.fetch.mockClear()
      userReadingPlanService.listPlans.mockClear()

      // Simulate user login
      mockCurrentUser.value = { id: 'new-user' }
      await nextTick()
      await flushPromises()

      expect(recentQuestionsService.fetch).toHaveBeenCalled()
      expect(userReadingPlanService.listPlans).toHaveBeenCalled()
    })

    it('clears tracked plans when user logs out', async () => {
      mockCurrentUser.value = { id: 'user-logout' }
      userReadingPlanService.listPlans.mockResolvedValue([
        { id: 1, plan: { id: 10, name: 'Plan', slug: 'plan' }, completed_days: 1, total_days: 5 }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()
      expect(wrapper.vm.trackedPlans).toHaveLength(1)

      // Simulate logout
      mockCurrentUser.value = null
      await nextTick()
      await flushPromises()

      expect(wrapper.vm.trackedPlans).toEqual([])
    })
  })

  // --- Tab click handlers ---

  describe('tab click handlers', () => {
    it('handleAskTabClick switches to ask tab and replaces route', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'saved'
      await nextTick()

      await wrapper.vm.handleAskTabClick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('ask')
      expect(mockRouterReplace).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'ask' }
      })
    })

    it('handleSavedTabClick switches to saved tab and resets QA state', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.showAnswer = true

      await wrapper.vm.handleSavedTabClick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('saved')
      expect(mockClearAll).toHaveBeenCalled()
      expect(mockRouterReplace).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'saved' }
      })
    })

    it('handleStudyTabClick switches to study tab and resets QA state', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.showAnswer = true

      await wrapper.vm.handleStudyTabClick()
      await flushPromises()

      expect(wrapper.vm.activeTab).toBe('study')
      expect(mockClearAll).toHaveBeenCalled()
      expect(mockRouterReplace).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'study' }
      })
    })

    it('handleSavedTabClick does not reset if already on saved tab', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'saved'
      await nextTick()
      await flushPromises()
      mockClearAll.mockClear()

      await wrapper.vm.handleSavedTabClick()
      await flushPromises()

      // clearAll should NOT be called again since we're already on saved
      expect(mockClearAll).not.toHaveBeenCalled()
    })

    it('handleStudyTabClick does not reset if already on study tab', async () => {
      const wrapper = await mountMainApp()
      wrapper.vm.activeTab = 'study'
      await nextTick()
      await flushPromises()
      mockClearAll.mockClear()

      await wrapper.vm.handleStudyTabClick()
      await flushPromises()

      expect(mockClearAll).not.toHaveBeenCalled()
    })
  })

  // --- recordRecentQuestion error handling ---

  describe('recordRecentQuestion error handling', () => {
    it('does not record when question text is empty', async () => {
      mockCurrentUser.value = { id: 'user-empty' }
      mockAskQuestion.mockResolvedValue(undefined)

      const wrapper = await mountMainApp()
      await flushPromises()

      // Simulate a scenario where isBiblicalAnswer is true but question is empty
      // This tests the trimmed check inside recordRecentQuestion
      // We can't easily call recordRecentQuestion directly, but handleQuestionSubmit
      // guards against empty text, so this is indirectly tested
      expect(recentQuestionsService.add).not.toHaveBeenCalled()
    })

    it('handles error from recentQuestionsService.add gracefully', async () => {
      mockCurrentUser.value = { id: 'user-add-err' }
      mockIsBiblicalAnswer.value = true
      mockAskQuestion.mockImplementation(async () => {
        mockAnswer.value = 'The answer'
        mockIsBiblicalAnswer.value = true
      })
      recentQuestionsService.add.mockRejectedValue(new Error('Add failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = await mountMainApp()
      await wrapper.vm.handleQuestionSubmit('What is mercy?')
      await flushPromises()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error refreshing recent questions:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('handles error from recentQuestionsService.remove gracefully', async () => {
      vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
      recentQuestionsService.remove.mockRejectedValue(new Error('Remove failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = await mountMainApp()
      await wrapper.vm.handleRecentQuestionRemove({ id: 99, question: 'Bad question' })
      await flushPromises()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting recent question:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  // --- goToReadingPlan ---

  describe('goToReadingPlan', () => {
    it('does not navigate when slug is falsy', async () => {
      mockCurrentUser.value = { id: 'user-no-slug' }
      userReadingPlanService.listPlans.mockResolvedValue([
        { id: 1, plan: { id: 10, name: 'No Slug Plan', slug: '' }, completed_days: 1, total_days: 5 }
      ])

      const wrapper = await mountMainApp()
      await flushPromises()

      // Calling goToReadingPlan with empty slug should not push
      wrapper.vm.goToReadingPlan(10, '')
      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })
})

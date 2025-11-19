import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import MainApp from '../../views/MainApp.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'
import { recentQuestionsService } from '../../services/recentQuestionsService.js'

const mockRouterPush = vi.fn()
const mockCurrentRoute = ref({ query: {} })

vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: mockRouterPush,
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
		conversationHistory: mockConversationHistory,
		askQuestion: mockAskQuestion,
		askFollowUpQuestion: mockAskFollowUpQuestion,
		clearAll: mockClearAll,
		clearError: mockClearError
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

const savedAnswersRefreshMock = vi.fn()

vi.mock('../../components/QuestionForm.vue', () => ({
	default: {
		name: 'QuestionForm',
		template: '<div class="question-form-stub"></div>',
		emits: ['submit'],
		props: ['question', 'loading']
	}
}))

vi.mock('../../components/AnswerDisplay.vue', () => ({
	default: {
		name: 'AnswerDisplay',
		template: '<div class="answer-display-stub"></div>',
		emits: ['answer-saved', 'follow-up-question'],
		props: ['answer', 'question', 'questionId', 'loading']
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
		props: ['error']
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
	savedAnswersRefreshMock.mockReset()

	mockCurrentUser.value = null
	mockCurrentRoute.value = { query: {} }
	mockQuestion.value = ''
	mockAnswer.value = ''
	mockQuestionId.value = null
	mockRootQuestionId.value = null
	mockIsBiblicalAnswer.value = false
	mockConversationHistory.value = []
	mockLoading.value = false
	mockError.value = null
	mockClearAll.mockReset()
	mockAskQuestion.mockReset()
	mockAskFollowUpQuestion.mockReset()
	mockClearError.mockReset()
	mockLogout.mockReset()

	savedAnswersService.getAll.mockResolvedValue([])
	recentQuestionsService.fetch.mockResolvedValue([])
	recentQuestionsService.add.mockResolvedValue([])
	recentQuestionsService.remove.mockResolvedValue([])

	window.scrollTo = vi.fn()
	window.matchMedia = vi.fn().mockImplementation(createMatchMedia)

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
		writable: true
	})
	sessionStorage.clear()
})

describe('MainApp.vue', () => {
	it('renders the ask tab by default', async () => {
		const wrapper = await mountMainApp()
		const tabs = wrapper.findAll('.nav-tab')
		expect(tabs[0].classes()).toContain('nav-tab--active')
		expect(wrapper.find('.question-form-stub').exists()).toBe(true)
		expect(wrapper.find('.answer-display-stub').exists()).toBe(false)
	})

	it('switches to saved tab and shows guest prompt for unauthenticated users', async () => {
		const wrapper = await mountMainApp()
		const savedTab = wrapper.findAll('.nav-tab')[1]
		await savedTab.trigger('click')
		await flushPromises()
		expect(savedTab.classes()).toContain('nav-tab--active')
		expect(wrapper.find('.guest-message').exists()).toBe(true)
	})

	it('renders saved answers when an authenticated user opens the saved tab', async () => {
		mockCurrentUser.value = { id: 'user-1' }
		savedAnswersService.getAll.mockResolvedValue([{ id: 'a' }])

		const wrapper = await mountMainApp()
		const savedTab = wrapper.findAll('.nav-tab')[1]
		await savedTab.trigger('click')
		await flushPromises()

		expect(wrapper.find('.saved-answers-stub').exists()).toBe(true)
	})

	it('updates the saved count badge after saving an answer', async () => {
		mockCurrentUser.value = { id: 'user-2' }
		savedAnswersService.getAll
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([{ id: '1' }, { id: '2' }])

		const wrapper = await mountMainApp()

		await wrapper.vm.handleAnswerSaved()
		await flushPromises()

		const badge = wrapper.find('.saved-badge')
		expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
		expect(badge.exists()).toBe(true)
		expect(badge.text()).toBe('2')
	})

	it('refreshes saved answers when the saved tab is visible and an answer is saved', async () => {
		mockCurrentUser.value = { id: 'user-3' }
		savedAnswersService.getAll.mockResolvedValue([{ id: '1' }])

		const wrapper = await mountMainApp()
		const savedTab = wrapper.findAll('.nav-tab')[1]
		await savedTab.trigger('click')
		await flushPromises()

		await wrapper.vm.handleAnswerSaved()
		await flushPromises()

		expect(savedAnswersRefreshMock).toHaveBeenCalledTimes(1)
	})

	it('recomputes saved count when the saved answers component emits update', async () => {
		mockCurrentUser.value = { id: 'user-4' }
		savedAnswersService.getAll.mockResolvedValue([{ id: '1' }])

		const wrapper = await mountMainApp()
		const savedTab = wrapper.findAll('.nav-tab')[1]
		await savedTab.trigger('click')
		await flushPromises()

		const savedComponent = wrapper.findComponent({ name: 'SavedAnswers' })
		expect(savedComponent.exists()).toBe(true)
		savedAnswersService.getAll.mockResolvedValueOnce([{ id: '1' }, { id: '2' }])
		await savedComponent.vm.$emit('update')
		await flushPromises()

		expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
		const badge = wrapper.find('.saved-badge')
		expect(badge.text()).toBe('2')
	})

	it('submits questions through the bible QA composable', async () => {
		const wrapper = await mountMainApp()
		const form = wrapper.findComponent({ name: 'QuestionForm' })
		await form.vm.$emit('submit', 'What is hope?', 'Hope is trusting God.')
		await flushPromises()

		expect(mockAskQuestion).toHaveBeenCalledWith('What is hope?')
		expect(wrapper.findAll('.nav-tab')[0].classes()).toContain('nav-tab--active')
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

	it('logs out and redirects to login when logout is clicked', async () => {
		mockCurrentUser.value = { id: 'user-5' }
		const wrapper = await mountMainApp()
		const logoutButton = wrapper.find('.logout-button')
		await logoutButton.trigger('click')

		expect(mockLogout).toHaveBeenCalled()
		expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
	})

	it('activates saved tab when requested via route query', async () => {
		mockCurrentRoute.value = { query: { tab: 'saved' } }
		const wrapper = await mountMainApp()
		const savedTab = wrapper.findAll('.nav-tab')[1]
		expect(savedTab.classes()).toContain('nav-tab--active')
	})
})

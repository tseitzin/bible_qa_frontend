import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import KidsApp from '../../views/KidsApp.vue'

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({ path: '/kids', query: {} }),
  RouterLink: { template: '<a><slot /></a>', props: ['to'] }
}))

const mockAskQuestion = vi.fn()
const mockAskFollowUpQuestion = vi.fn()
const mockClearAll = vi.fn()
const mockClearError = vi.fn()

vi.mock('../../composables/useKidsBibleQA', () => ({
  useKidsBibleQA: () => ({
    question: { value: '' },
    answer: { value: '' },
    questionId: { value: null },
    loading: { value: false },
    error: { value: '' },
    streamStatus: { value: '' },
    isStreaming: { value: false },
    askQuestion: mockAskQuestion,
    askFollowUpQuestion: mockAskFollowUpQuestion,
    clearAll: mockClearAll,
    clearError: mockClearError
  })
}))

describe('KidsApp.vue', () => {
  let wrapper

  beforeEach(() => {
    mockRouterPush.mockClear()
    mockAskQuestion.mockClear()
    mockAskFollowUpQuestion.mockClear()
    mockClearAll.mockClear()
    mockClearError.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(KidsApp, {
      global: {
        stubs: {
          KidsQuestionForm: {
            template: '<div class="kids-question-form-stub"><button class="submit-btn" @click="$emit(\'submit\', \'Who is Jesus?\')">Ask</button><button class="clear-btn" @click="$emit(\'clear\')">Clear</button></div>',
            props: ['modelValue', 'loading']
          },
          KidsAnswerDisplay: {
            template: '<div class="kids-answer-display-stub"><button class="follow-up-btn" @click="$emit(\'follow-up-question\', \'Tell me more\')">Follow Up</button><button class="reading-btn" @click="$emit(\'reading-view\', { reference: \'John 3:16\', source: \'kids\' })">Read</button></div>',
            props: ['answer', 'question', 'questionId', 'loading', 'streamStatus', 'isStreaming']
          },
          KidsErrorMessage: {
            template: '<div class="kids-error-message-stub"><button class="dismiss-btn" @click="$emit(\'dismiss\')">Dismiss</button></div>',
            props: ['error']
          },
          RouterLink: { template: '<a class="router-link-stub"><slot /></a>', props: ['to'] }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the kids app container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-app').exists()).toBe(true)
    })

    it('renders the kids navigation bar', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-nav').exists()).toBe(true)
    })

    it('renders a home link in the navigation', () => {
      wrapper = createWrapper()
      const homeLink = wrapper.find('.nav-link--home')
      expect(homeLink.exists()).toBe(true)
      expect(homeLink.text()).toContain('Home')
    })

    it('displays the kids title', () => {
      wrapper = createWrapper()
      const title = wrapper.find('.kids-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe("Answers from God\u2019s Word")
    })

    it('displays the kids tagline', () => {
      wrapper = createWrapper()
      const tagline = wrapper.find('.kids-tagline')
      expect(tagline.exists()).toBe(true)
      expect(tagline.text()).toContain('Questions')
      expect(tagline.text()).toContain('Stories')
      expect(tagline.text()).toContain('Faith')
    })

    it('displays the kids subtitle', () => {
      wrapper = createWrapper()
      const subtitle = wrapper.find('.kids-subtitle')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toContain('Ask anything about God, Jesus, and the Bible')
    })
  })

  describe('Background and Decorative Elements', () => {
    it('renders the kids background', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-background').exists()).toBe(true)
      expect(wrapper.find('.rainbow-gradient').exists()).toBe(true)
    })

    it('renders floating shapes', () => {
      wrapper = createWrapper()
      const shapes = wrapper.findAll('.shape')
      expect(shapes.length).toBe(5)
    })
  })

  describe('Child Components', () => {
    it('renders the question form stub', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-question-form-stub').exists()).toBe(true)
    })

    it('renders the answer display stub', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-answer-display-stub').exists()).toBe(true)
    })

    it('renders the error message stub', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-error-message-stub').exists()).toBe(true)
    })
  })

  describe('User Interactions', () => {
    it('calls askQuestion when question form emits submit', async () => {
      wrapper = createWrapper()
      await wrapper.find('.submit-btn').trigger('click')
      await flushPromises()
      expect(mockAskQuestion).toHaveBeenCalledWith('Who is Jesus?')
    })

    it('calls clearAll when question form emits clear', async () => {
      wrapper = createWrapper()
      await wrapper.find('.clear-btn').trigger('click')
      expect(mockClearAll).toHaveBeenCalled()
    })

    it('calls askFollowUpQuestion when answer display emits follow-up-question', async () => {
      wrapper = createWrapper()
      await wrapper.find('.follow-up-btn').trigger('click')
      await flushPromises()
      expect(mockAskFollowUpQuestion).toHaveBeenCalledWith('Tell me more')
    })

    it('navigates to reading view when answer display emits reading-view', async () => {
      wrapper = createWrapper()
      await wrapper.find('.reading-btn').trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'reading',
        query: { ref: 'John 3:16', source: 'kids' }
      })
    })

    it('calls clearError when error message emits dismiss', async () => {
      wrapper = createWrapper()
      await wrapper.find('.dismiss-btn').trigger('click')
      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Footer', () => {
    it('renders the kids footer', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.kids-footer').exists()).toBe(true)
    })

    it('displays the speech bubble with guidance text', () => {
      wrapper = createWrapper()
      const speechBubble = wrapper.find('.speech-bubble')
      expect(speechBubble.exists()).toBe(true)
      expect(speechBubble.text()).toContain('ask your parents or Sunday school teacher')
    })
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AIScripture from '../../views/AIScripture.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/ai-scripture', query: {} }),
  RouterLink: { template: '<a><slot /></a>', props: ['to'] }
}))

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: { value: null },
    logout: vi.fn()
  })
}))

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    isDevotion: { value: false },
    toggleTheme: vi.fn()
  })
}))

vi.mock('../../assets/logo_cross.png', () => ({
  default: 'mocked-logo.png'
}))

describe('AIScripture.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(AIScripture, {
      global: {
        stubs: {
          Navbar: { template: '<nav class="navbar-stub"></nav>' },
          RouterLink: { template: '<a class="router-link-stub"><slot /></a>', props: ['to'] }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the ai-page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.ai-page').exists()).toBe(true)
    })

    it('renders the navbar stub', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.navbar-stub').exists()).toBe(true)
    })

    it('displays the eyebrow text', () => {
      wrapper = createWrapper()
      const eyebrow = wrapper.find('.eyebrow')
      expect(eyebrow.exists()).toBe(true)
      expect(eyebrow.text()).toBe('AI & Scripture')
    })

    it('displays the hero heading', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('How we use AI with care and reverence')
    })

    it('displays the lede paragraph', () => {
      wrapper = createWrapper()
      const lede = wrapper.find('.lede')
      expect(lede.exists()).toBe(true)
      expect(lede.text()).toContain('artificial intelligence (AI)')
    })
  })

  describe('Content Sections', () => {
    it('displays the "How AI is used on this site" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('How AI is used on this site')
      expect(wrapper.text()).toContain('Organize and summarize information')
      expect(wrapper.text()).toContain('Surface relevant Scripture passages')
      expect(wrapper.text()).toContain('Explain biblical concepts in clear, readable language')
    })

    it('displays the "Scripture remains the authority" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Scripture remains the authority')
      expect(wrapper.text()).toContain('Point users back to Scripture')
      expect(wrapper.text()).toContain('Encourage reading verses in context')
    })

    it('displays the "AI is not infallible" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('AI is not infallible')
      expect(wrapper.text()).toContain('Be incomplete or imperfect')
      expect(wrapper.text()).toContain('used as a study aid')
    })

    it('displays the "Discernment is encouraged" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Discernment is encouraged')
      expect(wrapper.text()).toContain('Ask follow-up questions')
      expect(wrapper.text()).toContain('Every answer is a starting point for deeper study')
    })

    it('displays the "A respectful approach" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('A respectful approach to faith and technology')
      expect(wrapper.text()).toContain('does not claim divine authority')
    })
  })

  describe('Structure', () => {
    it('renders all five ai-card sections', () => {
      wrapper = createWrapper()
      const cards = wrapper.findAll('.ai-card')
      expect(cards.length).toBe(5)
    })

    it('renders the main content area', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.ai-content').exists()).toBe(true)
    })
  })
})

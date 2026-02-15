import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Contact from '../../views/Contact.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/contact', query: {} }),
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

describe('Contact.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(Contact, {
      global: {
        stubs: {
          Navbar: { template: '<nav class="navbar-stub"></nav>' },
          FooterSimple: { template: '<footer class="footer-stub"></footer>' },
          RouterLink: { template: '<a class="router-link-stub"><slot /></a>', props: ['to'] }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the contact page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.contact-page').exists()).toBe(true)
    })

    it('renders navbar and footer stubs', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.navbar-stub').exists()).toBe(true)
      expect(wrapper.find('.footer-stub').exists()).toBe(true)
    })

    it('displays the eyebrow text', () => {
      wrapper = createWrapper()
      const eyebrow = wrapper.find('.eyebrow')
      expect(eyebrow.exists()).toBe(true)
      expect(eyebrow.text()).toBe('Contact')
    })

    it('displays the hero heading', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('We welcome questions, feedback, and suggestions')
    })

    it('displays the lede paragraph', () => {
      wrapper = createWrapper()
      const lede = wrapper.find('.lede')
      expect(lede.exists()).toBe(true)
      expect(lede.text()).toContain('We read every message')
    })
  })

  describe('Content Sections', () => {
    it('displays the "How to reach us" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('How to reach us')
      expect(wrapper.text()).toContain('notice an issue, or would like to share feedback')
    })

    it('displays the contact email address', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('contact@wordoflifeanswers.com')
    })

    it('displays the feedback email address', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('feedback@wordoflifeanswers.com')
    })

    it('displays the "A note about responses" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('A note about responses')
      expect(wrapper.text()).toContain('thoughtfully maintained project')
    })
  })

  describe('Structure', () => {
    it('renders the contact hero section', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.contact-hero').exists()).toBe(true)
    })

    it('renders the contact grid with two cards', () => {
      wrapper = createWrapper()
      const grid = wrapper.find('.contact-grid')
      expect(grid.exists()).toBe(true)
      const cardsInGrid = grid.findAll('.contact-card')
      expect(cardsInGrid.length).toBe(2)
    })
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Privacy from '../../views/Privacy.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/privacy', query: {} }),
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

describe('Privacy.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(Privacy, {
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
    it('renders the privacy page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.privacy-page').exists()).toBe(true)
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
      expect(eyebrow.text()).toBe('Privacy Policy')
    })

    it('displays the hero heading', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Committed to protecting your privacy')
    })

    it('displays the effective date', () => {
      wrapper = createWrapper()
      const lede = wrapper.find('.lede')
      expect(lede.exists()).toBe(true)
      expect(lede.text()).toContain('December 1, 2025')
    })
  })

  describe('Content Sections', () => {
    it('displays the Overview section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Overview')
      expect(wrapper.text()).toContain('respects your privacy')
    })

    it('displays the "Information We Collect" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Information We Collect')
      expect(wrapper.text()).toContain('email address')
      expect(wrapper.text()).toContain('Questions you ask')
      expect(wrapper.text()).toContain('Reading plan progress')
    })

    it('displays the "How Your Information Is Used" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('How Your Information Is Used')
      expect(wrapper.text()).toContain('Provide core site functionality')
      expect(wrapper.text()).toContain('Maintain account security')
    })

    it('displays the "Use of AI and Technology" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Use of AI and Technology')
      expect(wrapper.text()).toContain('AI-assisted tools')
    })

    it('displays the "Data Sharing" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Data Sharing')
      expect(wrapper.text()).toContain('do not share your personal information')
    })

    it('displays the "Cookies and Analytics" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cookies and Analytics')
    })

    it('displays the "Your Choices" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your Choices')
      expect(wrapper.text()).toContain('Request deletion of your account')
    })

    it('displays the "Data Security" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Data Security')
    })

    it('displays the "Children\'s Use" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain("Children\u2019s Use")
      expect(wrapper.text()).toContain('parental guidance')
    })

    it('displays the "Contact" section with email', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('contact@wordoflifeanswers.com')
    })
  })

  describe('Structure', () => {
    it('renders the privacy hero section', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.privacy-hero').exists()).toBe(true)
    })

    it('renders privacy grid sections', () => {
      wrapper = createWrapper()
      const grids = wrapper.findAll('.privacy-grid')
      expect(grids.length).toBeGreaterThanOrEqual(3)
    })
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Terms from '../../views/Terms.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/terms', query: {} }),
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

describe('Terms.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(Terms, {
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
    it('renders the terms page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.terms-page').exists()).toBe(true)
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
      expect(eyebrow.text()).toBe('Terms of Use')
    })

    it('displays the hero heading', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Guidelines for using Word of Life Answers')
    })

    it('displays the effective date', () => {
      wrapper = createWrapper()
      const lede = wrapper.find('.lede')
      expect(lede.exists()).toBe(true)
      expect(lede.text()).toContain('December 1, 2025')
    })
  })

  describe('Content Sections', () => {
    it('displays the "Purpose of the Site" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Purpose of the Site')
      expect(wrapper.text()).toContain('Bible study and exploration resource')
    })

    it('displays the "Use of Content" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Use of Content')
      expect(wrapper.text()).toContain('Use the site respectfully and lawfully')
      expect(wrapper.text()).toContain('Not misuse or attempt to disrupt')
    })

    it('displays the "AI-Generated Content Disclaimer" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('AI-Generated Content Disclaimer')
      expect(wrapper.text()).toContain('AI-generated responses may be incomplete')
      expect(wrapper.text()).toContain('does not claim divine authority')
    })

    it('displays the "Accounts and Saved Content" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Accounts and Saved Content')
      expect(wrapper.text()).toContain('Maintaining the confidentiality of your account')
      expect(wrapper.text()).toContain('request deletion of your account')
    })

    it('displays the "Intellectual Property" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Intellectual Property')
      expect(wrapper.text()).toContain('copyright holders')
    })

    it('displays the "Availability and Changes" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Availability and Changes')
      expect(wrapper.text()).toContain('Modify or discontinue features')
    })

    it('displays the "Limitation of Liability" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Limitation of Liability')
      expect(wrapper.text()).toContain('Errors or omissions in content')
    })

    it('displays the "Children\'s Use" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain("Children\u2019s Use")
      expect(wrapper.text()).toContain('parental guidance')
    })

    it('displays the "Governing Principles" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Governing Principles')
      expect(wrapper.text()).toContain('respectful, thoughtful engagement')
    })
  })

  describe('Structure', () => {
    it('renders the terms hero section', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.terms-hero').exists()).toBe(true)
    })

    it('renders terms grid sections', () => {
      wrapper = createWrapper()
      const grids = wrapper.findAll('.terms-grid')
      expect(grids.length).toBeGreaterThanOrEqual(3)
    })
  })
})

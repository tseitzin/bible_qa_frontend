import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import About from '../../views/About.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/about', query: {} }),
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

describe('About.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(About, {
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
    it('renders the about page container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.about-page').exists()).toBe(true)
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
      expect(eyebrow.text()).toBe('About Word of Life Answers')
    })

    it('displays the hero heading', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Study Scripture with care and confidence')
    })

    it('displays the hero lede paragraph', () => {
      wrapper = createWrapper()
      const lede = wrapper.find('.lede')
      expect(lede.exists()).toBe(true)
      expect(lede.text()).toContain('help people explore Scripture thoughtfully')
    })
  })

  describe('Content Sections', () => {
    it('displays the "Why this site exists" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Why this site exists')
      expect(wrapper.text()).toContain('The Bible is rich, deep, and sometimes challenging')
    })

    it('displays the "A tool for study and exploration" section with list items', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('A tool for study and exploration')
      expect(wrapper.text()).toContain('Ask thoughtful questions about the Bible')
      expect(wrapper.text()).toContain('Explore Scripture by topic or theme')
      expect(wrapper.text()).toContain('Discover related verses and biblical insights')
      expect(wrapper.text()).toContain('Save and revisit answers')
    })

    it('displays the "Guided Bible reading plans" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Guided Bible reading plans')
      expect(wrapper.text()).toContain('Annual Bible reading plans')
      expect(wrapper.text()).toContain('Topical reading plans')
    })

    it('displays the "Scripture comes first" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Scripture comes first')
      expect(wrapper.text()).toContain('King James Version (KJV)')
    })

    it('displays the "Thoughtful use of technology" section with AI & Scripture link', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Thoughtful use of technology')
      const aiLink = wrapper.findAll('.router-link-stub').find(el => el.text().includes('AI & Scripture'))
      expect(aiLink).toBeTruthy()
    })

    it('displays the "Created with care" section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Created with care')
      expect(wrapper.text()).toContain('built by a Christian developer')
    })
  })

  describe('Call-to-Action Buttons', () => {
    it('renders CTA links for asking questions and exploring study plans', () => {
      wrapper = createWrapper()
      const ctaRow = wrapper.find('.cta-row')
      expect(ctaRow.exists()).toBe(true)
      expect(ctaRow.text()).toContain('Ask a Bible question')
      expect(ctaRow.text()).toContain('Explore study plans')
    })
  })
})

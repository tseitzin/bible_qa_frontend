import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../../views/Home.vue'

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({ path: '/', query: {} }),
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to']
  }
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

describe('Home.vue', () => {
  let wrapper

  beforeEach(() => {
    mockRouterPush.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(Home, {
      global: {
        stubs: {
          Navbar: { template: '<nav class="navbar-stub"></nav>' },
          FooterSimple: { template: '<footer class="footer-stub"></footer>' },
          RouterLink: {
            template: '<a class="router-link-stub"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the home view', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.home').exists()).toBe(true)
    })

    it('renders navbar and footer', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.navbar-stub').exists()).toBe(true)
      expect(wrapper.find('.footer-stub').exists()).toBe(true)
    })

    it('displays the app title', () => {
      wrapper = createWrapper()
      const title = wrapper.find('.app-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Word of Life Answers')
    })

    it('displays the tagline', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Scripture • Wisdom • Truth')
    })

    it('displays the app subtitle', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your personal Bible companion')
    })
  })

  describe('Quick Actions', () => {
    it('displays action cards', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Ask Biblical Questions')
      expect(wrapper.text()).toContain('Bible Study Aids')
      expect(wrapper.text()).toContain('Saved Answers')
    })

    it('displays action icons', () => {
      wrapper = createWrapper()
      const icons = wrapper.findAll('.action-icon')
      expect(icons.length).toBeGreaterThanOrEqual(3)
    })

    it('navigates to saved answers when button is clicked', async () => {
      wrapper = createWrapper()
      const buttons = wrapper.findAll('.action-card--button')
      const savedButton = buttons.find(b => b.text().includes('Saved Answers'))
      await savedButton.trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({ path: '/adults', query: { tab: 'saved' } })
    })

    it('navigates to study helps when button is clicked', async () => {
      wrapper = createWrapper()
      const buttons = wrapper.findAll('.action-card--button')
      const studyButton = buttons.find(b => b.text().includes('Bible Study Aids'))
      await studyButton.trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({ path: '/adults', query: { tab: 'study' } })
    })
  })

  describe('Insights Section', () => {
    it('displays insights cards', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Need Inspiration?')
      expect(wrapper.text()).toContain('Follow-Up Questions')
    })
  })

  describe('Background Elements', () => {
    it('renders background elements', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.app-background').exists()).toBe(true)
      expect(wrapper.find('.bg-gradient').exists()).toBe(true)
      expect(wrapper.find('.bg-pattern').exists()).toBe(true)
      expect(wrapper.find('.floating-elements').exists()).toBe(true)
    })
  })
})

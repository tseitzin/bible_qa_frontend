import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import Home from '../../views/Home.vue'
import { useAuth } from '../../composables/useAuth'

// Mock the useAuth composable
vi.mock('../../composables/useAuth', () => ({
  useAuth: vi.fn()
}))

// Mock router
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

// Mock logo asset
vi.mock('../../assets/logo_cross.png', () => ({
  default: 'mocked-logo.png'
}))

describe('Home.vue', () => {
  let wrapper
  let mockLogout

  beforeEach(() => {
    mockLogout = vi.fn()
    mockRouter.push.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (currentUser = null) => {
    useAuth.mockReturnValue({
      currentUser: computed(() => currentUser),
      logout: mockLogout
    })

    return mount(Home, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the home view correctly', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.home').exists()).toBe(true)
      expect(wrapper.find('.app-nav').exists()).toBe(true)
      expect(wrapper.find('.app-header').exists()).toBe(true)
    })

    it('shows welcome message for guest users', () => {
      wrapper = createWrapper()
      const title = wrapper.find('.app-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Welcome Back')
    })

    it('shows welcome message with username for logged-in users', () => {
      wrapper = createWrapper({ username: 'testuser' })
      const title = wrapper.find('.app-title')
      expect(title.text()).toBe('Welcome Back, testuser')
    })

    it('displays quick actions section', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.home-quick-actions').exists()).toBe(true)
      const text = wrapper.text()
      expect(text).toContain('Quick Actions')
      expect(text).toContain('Continue Exploring')
      expect(text).toContain('Kids Corner')
      expect(text).toContain('Saved Answers')
    })

    it('displays insights section', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Need Inspiration?')
      expect(wrapper.text()).toContain('Tip: Follow Up')
      expect(wrapper.text()).toContain('Ask a Bible Question')
    })
  })

  describe('Navigation', () => {
    it('shows Login button when user is not authenticated', () => {
      wrapper = createWrapper(null)
      // Check for login link
      const navLinks = wrapper.findAll('.nav-link')
      const hasLoginButton = navLinks.some(link => link.classes().includes('login-button'))
      const hasLogoutButton = navLinks.some(link => link.classes().includes('logout-button'))
      
      expect(hasLoginButton).toBe(true)
      expect(hasLogoutButton).toBe(false)
    })

    it('shows Logout button when user is authenticated', () => {
      wrapper = createWrapper({ username: 'testuser' })
      const navLinks = wrapper.findAll('.nav-link')
      const hasLogoutButton = navLinks.some(link => link.classes().includes('logout-button'))
      const hasLoginButton = navLinks.some(link => link.classes().includes('login-button'))
      
      expect(hasLogoutButton).toBe(true)
      expect(hasLoginButton).toBe(false)
    })

    it('handles logout when logout button is clicked', async () => {
      wrapper = createWrapper({ username: 'testuser' })
      
      await wrapper.find('.logout-button').trigger('click')
      
      expect(mockLogout).toHaveBeenCalled()
    })

    it('navigates to saved answers when saved answers button is clicked', async () => {
      wrapper = createWrapper()
      
      const savedAnswersButton = wrapper.find('.action-card--button')
      await savedAnswersButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/',
        query: { tab: 'saved' }
      })
    })

    it('navigates to adults view when "Ask a Bible Question" button is clicked', async () => {
      wrapper = createWrapper()
      
      const askButton = wrapper.find('.btn-primary')
      await askButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('UI Elements', () => {
    it('displays the logo', () => {
      wrapper = createWrapper()
      const logo = wrapper.find('.nav-logo img')
      expect(logo.exists()).toBe(true)
      expect(logo.attributes('alt')).toBe('Word of Life Answers logo')
    })

    it('displays the tagline', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Scripture • Wisdom • Truth')
    })

    it('displays app subtitle', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('Dive into your personalized Bible Q&A experience')
    })

    it('displays action card icons', () => {
      wrapper = createWrapper()
      const icons = wrapper.findAll('.action-icon')
      expect(icons.length).toBeGreaterThanOrEqual(3)
    })

    it('has background elements', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.app-background').exists()).toBe(true)
      expect(wrapper.find('.bg-gradient').exists()).toBe(true)
      expect(wrapper.find('.bg-pattern').exists()).toBe(true)
      expect(wrapper.find('.floating-elements').exists()).toBe(true)
    })
  })
})

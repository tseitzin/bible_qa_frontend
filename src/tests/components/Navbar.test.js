import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Navbar from '../../components/Navbar.vue'

const mockPush = vi.fn()
const mockRoute = { path: '/', query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
  RouterLink: {
    template: '<a :href="to" :class="$attrs.class" @click="$emit(\'click\')"><slot /></a>',
    props: ['to']
  }
}))

const mockLogout = vi.fn().mockResolvedValue(undefined)
const mockCurrentUser = ref(null)

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    logout: mockLogout
  })
}))

const mockToggleTheme = vi.fn()
const mockIsDevotion = ref(false)

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    isDevotion: mockIsDevotion,
    toggleTheme: mockToggleTheme
  })
}))

vi.mock('../../assets/logo_cross.png', () => ({ default: 'logo.png' }))

describe('Navbar', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
    mockCurrentUser.value = null
    mockIsDevotion.value = false
    mockRoute.path = '/'
    mockRoute.query = {}
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(Navbar, {
      props,
      global: {
        mocks: {
          $route: mockRoute
        },
        stubs: {
          RouterLink: {
            template: '<a :href="typeof to === \'string\' ? to : to.path || \'\'" @click="$emit(\'click\')"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  it('renders the navbar element', () => {
    wrapper = createWrapper()

    expect(wrapper.find('nav.navbar-simple').exists()).toBe(true)
  })

  it('renders the logo image', () => {
    wrapper = createWrapper()

    const logo = wrapper.find('.navbar-simple-logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('alt')).toBe('Word of Life Answers')
  })

  it('renders brand text', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.navbar-brand-title').text()).toBe('Word of Life Answers')
    expect(wrapper.find('.navbar-brand-tagline').exists()).toBe(true)
  })

  it('renders navigation links', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('.navbar-simple-link')
    const linkTexts = links.map(link => link.text())

    expect(linkTexts).toContain('Home')
    expect(linkTexts).toContain('About')
    expect(linkTexts).toContain('Ask Questions')
    expect(linkTexts).toContain('Saved Answers')
    expect(linkTexts).toContain('Bible Study')
    expect(linkTexts).toContain('Kids')
  })

  it('shows Login link when user is not authenticated', () => {
    mockCurrentUser.value = null
    wrapper = createWrapper()

    expect(wrapper.text()).toContain('Login')
    expect(wrapper.find('.navbar-simple-auth-btn').exists()).toBe(true)
  })

  it('shows Logout button when user is authenticated', () => {
    mockCurrentUser.value = { id: 1, username: 'testuser', is_admin: false }
    wrapper = createWrapper()

    const logoutBtn = wrapper.find('button.navbar-simple-auth-btn')
    expect(logoutBtn.exists()).toBe(true)
    expect(logoutBtn.text()).toBe('Logout')
  })

  it('does not show Admin link for non-admin users', () => {
    mockCurrentUser.value = { id: 1, username: 'testuser', is_admin: false }
    wrapper = createWrapper()

    const linkTexts = wrapper.findAll('.navbar-simple-link').map(l => l.text())
    expect(linkTexts).not.toContain('Admin')
  })

  it('shows Admin link for admin users', () => {
    mockCurrentUser.value = { id: 1, username: 'admin', is_admin: true }
    wrapper = createWrapper()

    const linkTexts = wrapper.findAll('.navbar-simple-link').map(l => l.text())
    expect(linkTexts).toContain('Admin')
  })

  it('calls logout and redirects to home on logout click', async () => {
    mockCurrentUser.value = { id: 1, username: 'testuser', is_admin: false }
    wrapper = createWrapper()

    const logoutBtn = wrapper.find('button.navbar-simple-auth-btn')
    await logoutBtn.trigger('click')

    expect(mockLogout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renders the theme toggle button', () => {
    wrapper = createWrapper()

    const themeToggle = wrapper.find('.theme-toggle')
    expect(themeToggle.exists()).toBe(true)
  })

  it('calls toggleTheme when theme button is clicked', async () => {
    wrapper = createWrapper()

    const themeToggle = wrapper.find('.theme-toggle')
    await themeToggle.trigger('click')

    expect(mockToggleTheme).toHaveBeenCalled()
  })

  it('toggles mobile menu on hamburger click', async () => {
    wrapper = createWrapper()

    const menuToggle = wrapper.find('.mobile-menu-toggle')
    expect(wrapper.find('.navbar-simple-links.mobile-open').exists()).toBe(false)

    await menuToggle.trigger('click')
    expect(wrapper.find('.navbar-simple-links.mobile-open').exists()).toBe(true)

    await menuToggle.trigger('click')
    expect(wrapper.find('.navbar-simple-links.mobile-open').exists()).toBe(false)
  })
})

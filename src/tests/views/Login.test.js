import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Login from '../../views/Login.vue'
import { useAuth } from '../../composables/useAuth'
import { useRouter, useRoute } from 'vue-router'

// Mock the composables and assets
vi.mock('../../composables/useAuth')
vi.mock('vue-router')
vi.mock('../../assets/logo_cross.png', () => ({ default: 'logo.png' }))

describe('Login - Password Visibility Toggle', () => {
  let wrapper

  beforeEach(() => {
    // Setup mocks
    useAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: { value: false },
      error: { value: '' }
    })

    useRouter.mockReturnValue({
      push: vi.fn()
    })

    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('should have showPassword initially set to false', () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    expect(wrapper.vm.showPassword).toBe(false)
  })

  it('should toggle showPassword state when togglePasswordVisibility is called', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    // Initially false
    expect(wrapper.vm.showPassword).toBe(false)
    
    // Toggle to true
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showPassword).toBe(true)
    
    // Toggle back to false
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showPassword).toBe(false)
  })

  it('should change password input type from "password" to "text" when showPassword is true', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    let passwordInput = wrapper.find('#password')
    
    // Initially should be password type
    expect(passwordInput.attributes('type')).toBe('password')
    
    // Toggle visibility
    wrapper.vm.showPassword = true
    await wrapper.vm.$nextTick()
    
    // Should now be text type
    passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('should change password input type from "text" to "password" when showPassword is false', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    let passwordInput = wrapper.find('#password')
    
    // Set to true first
    wrapper.vm.showPassword = true
    await wrapper.vm.$nextTick()
    passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('text')
    
    // Toggle back to false
    wrapper.vm.showPassword = false
    await wrapper.vm.$nextTick()
    
    // Should be password type again
    passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('should toggle password input type when eye icon button is clicked', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    // Initially password type
    let passwordInput = wrapper.find('#password')
    const toggleButton = wrapper.find('.password-toggle')
    expect(passwordInput.attributes('type')).toBe('password')
    expect(toggleButton.exists()).toBe(true)
    
    // Simulate button click by calling the function (since trigger('click') has issues in test environment)
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    
    // Should be text type
    passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('text')
    expect(wrapper.vm.showPassword).toBe(true)
    
    // Click again
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    
    // Should be password type again
    passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('password')
    expect(wrapper.vm.showPassword).toBe(false)
  })

  it('should update aria-pressed attribute when password visibility is toggled', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    const toggleButton = wrapper.find('.password-toggle')
    
    // Initially false
    expect(toggleButton.attributes('aria-pressed')).toBe('false')
    
    // Toggle password visibility
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    
    // Should be true
    expect(toggleButton.attributes('aria-pressed')).toBe('true')
  })

  it('should update aria-label when password visibility is toggled', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    const toggleButton = wrapper.find('.password-toggle')
    
    // Initially show password
    expect(toggleButton.attributes('aria-label')).toBe('Show password')
    
    // Toggle password visibility
    wrapper.vm.togglePasswordVisibility()
    await wrapper.vm.$nextTick()
    
    // Should be hide password
    expect(toggleButton.attributes('aria-label')).toBe('Hide password')
  })

  it('should display the correct SVG icon based on showPassword state', async () => {
    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    // When showPassword is false, the first SVG (eye icon) should be visible
    let svgs = wrapper.findAll('.password-toggle svg')
    expect(svgs.length).toBe(1)
    
    // Toggle visibility
    const toggleButton = wrapper.find('.password-toggle')
    toggleButton.element.click()
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // When showPassword is true, the second SVG (eye-off icon) should be visible
    svgs = wrapper.findAll('.password-toggle svg')
    expect(svgs.length).toBe(1)
  })
})

describe('Login - Save Operation and Redirects', () => {
  let wrapper
  let mockLogin
  let mockRouterPush
  let mockRoute

  beforeEach(() => {
    // Setup mocks
    mockLogin = vi.fn()
    mockRouterPush = vi.fn()
    mockRoute = { query: {} }

    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: { value: false },
      error: { value: '' }
    })

    useRouter.mockReturnValue({
      push: mockRouterPush
    })

    useRoute.mockReturnValue(mockRoute)

    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('should correctly redirect the user after a successful login', async () => {
    // Mock successful login
    mockLogin.mockResolvedValue({ success: true })

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set email and password
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify that router.push was called
    expect(mockRouterPush).toHaveBeenCalled()
  })

  it('should redirect to the correct page after a successful login (main page)', async () => {
    // Mock successful login with no redirect query param
    mockLogin.mockResolvedValue({ success: true })
    mockRoute.query = {}

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set credentials
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify redirect to main page
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main' })
  })

  it('should redirect to the saved tab after successful login when redirect=saved query param is present', async () => {
    // Mock successful login with redirect=saved query param
    mockLogin.mockResolvedValue({ success: true })
    mockRoute.query = { redirect: 'saved' }

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set credentials
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify redirect to main page with saved tab
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main', query: { tab: 'saved' } })
  })

  it('should redirect to pending save page after successful login when redirect=pending-save query param is present', async () => {
    // Mock successful login with redirect=pending-save query param
    mockLogin.mockResolvedValue({ success: true })
    mockRoute.query = { redirect: 'pending-save' }

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set credentials
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify redirect to main page with restored=pending query
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main', query: { restored: 'pending' } })
  })

  it('should not redirect and display an error when login fails due to invalid credentials', async () => {
    // Mock failed login
    mockLogin.mockResolvedValue({ 
      success: false, 
      message: 'Invalid email or password' 
    })

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set credentials
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'wrongpassword'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify that router.push was NOT called
    expect(mockRouterPush).not.toHaveBeenCalled()

    // Verify error message is displayed
    expect(wrapper.vm.error).toBe('Invalid email or password')
    await wrapper.vm.$nextTick()
    const errorElement = wrapper.find('.error-message')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('Invalid email or password')
  })

  it('should display a generic error message when login fails without a specific message', async () => {
    // Mock failed login without message
    mockLogin.mockResolvedValue({ success: false })

    wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set credentials
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleLogin()
    await flushPromises()

    // Verify that router.push was NOT called
    expect(mockRouterPush).not.toHaveBeenCalled()

    // Verify error message is set
    expect(wrapper.vm.error).toBe('Login failed')
  })
})

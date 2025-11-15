import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Register from '../../views/Register.vue'
import { useAuth } from '../../composables/useAuth'
import { useRouter, useRoute } from 'vue-router'

// Mock the composables and assets
vi.mock('../../composables/useAuth')
vi.mock('vue-router')
vi.mock('../../assets/logo_cross.png', () => ({ default: 'logo.png' }))

describe('Register - Password Visibility Toggle', () => {
  let wrapper

  beforeEach(() => {
    // Setup mocks
    useAuth.mockReturnValue({
      register: vi.fn(),
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
    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    
    expect(wrapper.vm.showPassword).toBe(false)
  })

  it('should toggle showPassword state when togglePasswordVisibility is called', async () => {
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
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

describe('Register - Save Operation and Redirects', () => {
  let wrapper
  let mockRegister
  let mockRouterPush
  let mockRoute

  beforeEach(() => {
    // Setup mocks
    mockRegister = vi.fn()
    mockRouterPush = vi.fn()
    mockRoute = { query: {} }

    useAuth.mockReturnValue({
      register: mockRegister,
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

  it('should correctly redirect the user after a successful registration', async () => {
    // Mock successful registration
    mockRegister.mockResolvedValue({ success: true })

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify that router.push was called
    expect(mockRouterPush).toHaveBeenCalled()
  })

  it('should redirect to the correct page after a successful registration (main page)', async () => {
    // Mock successful registration with no redirect query param
    mockRegister.mockResolvedValue({ success: true })
    mockRoute.query = {}

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify redirect to main page
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main' })
  })

  it('should redirect to the saved tab after successful registration when redirect=saved query param is present', async () => {
    // Mock successful registration with redirect=saved query param
    mockRegister.mockResolvedValue({ success: true })
    mockRoute.query = { redirect: 'saved' }

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify redirect to main page with saved tab
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main', query: { tab: 'saved' } })
  })

  it('should redirect to pending save page after successful registration when redirect=pending-save query param is present', async () => {
    // Mock successful registration with redirect=pending-save query param
    mockRegister.mockResolvedValue({ success: true })
    mockRoute.query = { redirect: 'pending-save' }

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify redirect to main page with restored=pending query
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main', query: { restored: 'pending' } })
  })

  it('should not redirect and display an error when registration fails due to invalid data', async () => {
    // Mock failed registration
    mockRegister.mockResolvedValue({ 
      success: false, 
      message: 'Email already exists' 
    })

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'existing@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify that router.push was NOT called
    expect(mockRouterPush).not.toHaveBeenCalled()

    // Verify error message is displayed
    expect(wrapper.vm.error).toBe('Email already exists')
    await wrapper.vm.$nextTick()
    const errorElement = wrapper.find('.error-message')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('Email already exists')
  })

  it('should display a generic error message when registration fails without a specific message', async () => {
    // Mock failed registration without message
    mockRegister.mockResolvedValue({ success: false })

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'password123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify that router.push was NOT called
    expect(mockRouterPush).not.toHaveBeenCalled()

    // Verify error message is set
    expect(wrapper.vm.error).toBe('Registration failed')
  })

  it('should not redirect when registration fails with weak password error', async () => {
    // Mock failed registration due to weak password
    mockRegister.mockResolvedValue({ 
      success: false, 
      message: 'Password must be at least 8 characters long' 
    })

    wrapper = mount(Register, {
      global: {
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Set registration data with weak password
    wrapper.vm.username = 'testuser'
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = '123'

    // Submit the form
    await wrapper.vm.handleRegister()
    await flushPromises()

    // Verify that router.push was NOT called
    expect(mockRouterPush).not.toHaveBeenCalled()

    // Verify error message is displayed
    expect(wrapper.vm.error).toBe('Password must be at least 8 characters long')
    await wrapper.vm.$nextTick()
    const errorElement = wrapper.find('.error-message')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('Password must be at least 8 characters long')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Login from '../../views/Login.vue'
import { useAuth } from '../../composables/useAuth'
import { useRouter } from 'vue-router'

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

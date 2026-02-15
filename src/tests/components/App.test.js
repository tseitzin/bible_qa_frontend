import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../App.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: { value: { path: '/' } }
  })
}))

vi.mock('../../composables/usePageAnalytics.js', () => ({
  usePageAnalytics: () => ({
    setupTracking: vi.fn(() => vi.fn()),
    trackClick: vi.fn()
  })
}))

describe('App.vue', () => {
  const mountApp = () => (
    mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<div class="router-view-stub">router view</div>'
          }
        }
      }
    })
  )

  it('renders the router view shell', () => {
    const wrapper = mountApp()
    expect(wrapper.find('.router-view-stub').exists()).toBe(true)
  })

  it('renders only the router view stub', () => {
    const wrapper = mountApp()
    expect(wrapper.html().trim()).toBe('<div class="router-view-stub">router view</div>')
  })
})

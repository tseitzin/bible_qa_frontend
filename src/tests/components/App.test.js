import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../App.vue'

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

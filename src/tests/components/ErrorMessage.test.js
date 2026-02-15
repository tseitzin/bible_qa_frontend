import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '../../components/ErrorMessage.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

describe('ErrorMessage', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(ErrorMessage, {
      props,
      global: {
        components: { BaseButton }
      }
    })
  }

  it('does not render when error is empty', () => {
    wrapper = createWrapper({ error: '' })

    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('renders when error is provided', () => {
    wrapper = createWrapper({ error: 'Something went wrong' })

    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('displays the error message text', () => {
    wrapper = createWrapper({ error: 'Network connection failed' })

    expect(wrapper.find('.error-text').text()).toBe('Network connection failed')
  })

  it('displays the error title', () => {
    wrapper = createWrapper({ error: 'Some error' })

    expect(wrapper.find('.error-title').text()).toBe('Something went wrong')
  })

  it('has role="alert" for accessibility', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('has aria-live="polite" for accessibility', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('displays suggestions list', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const suggestions = wrapper.findAll('.suggestions-list li')
    expect(suggestions.length).toBe(3)
    expect(suggestions[0].text()).toContain('Check your internet connection')
    expect(suggestions[1].text()).toContain('Refresh the page')
    expect(suggestions[2].text()).toContain('Make sure your question is clear')
  })

  it('emits dismiss event when dismiss button is clicked', async () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const dismissButton = wrapper.find('.dismiss-button')
    await dismissButton.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('dismiss')
    expect(wrapper.emitted().dismiss).toHaveLength(1)
  })

  it('emits retry and dismiss events when retry button is clicked', async () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const retryButton = wrapper.find('.retry-button')
    await retryButton.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('retry')
    expect(wrapper.emitted().retry).toHaveLength(1)
    expect(wrapper.emitted()).toHaveProperty('dismiss')
    expect(wrapper.emitted().dismiss).toHaveLength(1)
  })

  it('renders dismiss and retry buttons', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('.dismiss-button').exists()).toBe(true)
    expect(wrapper.find('.retry-button').exists()).toBe(true)
    expect(wrapper.find('.dismiss-button').text()).toContain('Dismiss')
    expect(wrapper.find('.retry-button').text()).toContain('Try Again')
  })
})

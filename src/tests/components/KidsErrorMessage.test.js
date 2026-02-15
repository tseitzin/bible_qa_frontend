import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import KidsErrorMessage from '../../components/kids/KidsErrorMessage.vue'

describe('KidsErrorMessage', () => {
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
    return mount(KidsErrorMessage, {
      props
    })
  }

  it('does not render when error is empty', () => {
    wrapper = createWrapper({ error: '' })

    expect(wrapper.find('.kids-error-message').exists()).toBe(false)
  })

  it('renders when error is provided', () => {
    wrapper = createWrapper({ error: 'Something broke' })

    expect(wrapper.find('.kids-error-message').exists()).toBe(true)
  })

  it('has role="alert" for accessibility', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('has aria-live="polite" for accessibility', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('displays kid-friendly error title', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('.kids-error-title').text()).toContain('Oops! Something went wrong')
  })

  it('shows network-friendly message for network errors', () => {
    wrapper = createWrapper({ error: 'Network connection failed' })

    expect(wrapper.find('.kids-error-text').text()).toContain('internet connection')
  })

  it('shows server-friendly message for server errors', () => {
    wrapper = createWrapper({ error: 'Server error 500' })

    expect(wrapper.find('.kids-error-text').text()).toContain('taking a little break')
  })

  it('shows timeout-friendly message for timeout errors', () => {
    wrapper = createWrapper({ error: 'Request timeout' })

    expect(wrapper.find('.kids-error-text').text()).toContain('taking too long')
  })

  it('shows generic friendly message for unknown errors', () => {
    wrapper = createWrapper({ error: 'Unknown error' })

    expect(wrapper.find('.kids-error-text').text()).toContain('Something unexpected happened')
  })

  it('displays kid-friendly suggestion items', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const suggestions = wrapper.findAll('.kids-suggestions-list li')
    expect(suggestions.length).toBe(4)
    expect(suggestions[0].text()).toContain('internet is working')
    expect(suggestions[1].text()).toContain('asking your question again')
    expect(suggestions[2].text()).toContain('question is clear')
    expect(suggestions[3].text()).toContain('parents or teacher')
  })

  it('emits dismiss event when Okay button is clicked', async () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const dismissBtn = wrapper.find('.kids-dismiss-button')
    await dismissBtn.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('dismiss')
    expect(wrapper.emitted().dismiss).toHaveLength(1)
  })

  it('emits retry and dismiss events when Try Again button is clicked', async () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    const retryBtn = wrapper.find('.kids-retry-button')
    await retryBtn.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('retry')
    expect(wrapper.emitted().retry).toHaveLength(1)
    expect(wrapper.emitted()).toHaveProperty('dismiss')
    expect(wrapper.emitted().dismiss).toHaveLength(1)
  })

  it('displays comfort section with encouraging message', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('.comfort-section').exists()).toBe(true)
    expect(wrapper.find('.comfort-message').text()).toContain('God is always with you')
  })

  it('renders Okay and Try Again buttons with emojis', () => {
    wrapper = createWrapper({ error: 'Error occurred' })

    expect(wrapper.find('.kids-dismiss-button').text()).toContain('Okay!')
    expect(wrapper.find('.kids-retry-button').text()).toContain('Try Again')
  })
})

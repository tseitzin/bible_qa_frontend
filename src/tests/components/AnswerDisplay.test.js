import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerDisplay from '../../components/AnswerDisplay.vue'

// Mock navigator.clipboard for copy functionality
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

describe('AnswerDisplay', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders nothing when no answer is provided', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: ''
      }
    })

    expect(wrapper.find('.answer-display').exists()).toBe(false)
  })

  it('renders answer when answer is provided', () => {
    const testAnswer = 'God is love according to 1 John 4:8'
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: testAnswer
      }
    })

    expect(wrapper.find('.answer-display').exists()).toBe(true)
    expect(wrapper.find('.answer-text').text()).toBe(testAnswer)
    expect(wrapper.find('.answer-title').text()).toBe('Biblical Answer')
  })

  it('shows action buttons', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    const buttons = wrapper.findAll('.action-button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('Copy')
    expect(buttons[1].text()).toContain('Share')
    expect(buttons[2].text()).toContain('Save')
  })

  it('copies answer to clipboard when copy button is clicked', async () => {
    const testAnswer = 'Test answer for copying'
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: testAnswer
      }
    })

    const copyButton = wrapper.findAll('.action-button')[0]
    await copyButton.trigger('click')

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testAnswer)
  })

  it('displays timestamp', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    expect(wrapper.find('.timestamp').exists()).toBe(true)
    expect(wrapper.find('.timestamp').text()).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)
  })

  it('has proper header with icon and title', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    expect(wrapper.find('.answer-icon').exists()).toBe(true)
    expect(wrapper.find('.answer-title').text()).toBe('Biblical Answer')
  })

  it('applies transition classes', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    // The transition wrapper should be present
    expect(wrapper.find('.answer-display').exists()).toBe(true)
  })
})

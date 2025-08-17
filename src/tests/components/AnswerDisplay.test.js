import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerDisplay from '../../components/AnswerDisplay.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

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

  describe('Save Functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Spy on the actual service method instead of mocking the module
      vi.spyOn(savedAnswersService, 'save').mockReturnValue({ 
        success: true, 
        id: 'test-id', 
        message: 'Answer saved successfully!' 
      })
    })

    it('should call savedAnswersService when save button is clicked', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      // Wait for component to be fully mounted
      await wrapper.vm.$nextTick()

      // Find the save button specifically by its text content
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      await saveButton.trigger('click')
      
      // Wait for the async method to complete
      await wrapper.vm.$nextTick()
      
      // Add a small delay to ensure the method completes
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(savedAnswersService.save).toHaveBeenCalledWith('What is love?', 'Test biblical answer')
    })

    it('should show success feedback after saving', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.vm.saveSuccess).toBe(true)
      expect(wrapper.vm.saveMessage).toBe('Answer saved successfully!')
    })

    it('should handle save errors gracefully', async () => {
      savedAnswersService.save.mockReturnValue({ 
        success: false, 
        message: 'Storage limit reached' 
      })

      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.vm.saveSuccess).toBe(false)
      expect(wrapper.vm.saveMessage).toBe('Storage limit reached')
    })

    it('should emit answerSaved event after successful save', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.emitted('answerSaved')).toBeTruthy()
      expect(wrapper.emitted('answerSaved')[0]).toEqual(['test-id'])
    })

    it('should reset save feedback after timeout', async () => {
      vi.useFakeTimers()

      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      
      // Need to advance past the initial async delay in the saveAnswer method
      vi.advanceTimersByTime(1)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.saveSuccess).toBe(true)

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.saveSuccess).toBe(null)
      expect(wrapper.vm.saveMessage).toBe('')

      vi.useRealTimers()
    })

    it('should disable save button while saving', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      // Initially enabled
      expect(saveButton.element.disabled).toBe(false)

      // Click to save
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Should be disabled during save process
      expect(saveButton.element.disabled).toBe(true)
    })

    it('should handle missing question prop', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer'
          // question prop is missing
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(savedAnswersService.save).toHaveBeenCalledWith('', 'Test biblical answer')
    })

    it('should display save status in button text', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      // Initially shows "Save Answer"
      expect(saveButton.text()).toContain('Save')
      
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      // After successful save, should show success indication
      expect(wrapper.vm.saveSuccess).toBe(true)
    })
  })
})

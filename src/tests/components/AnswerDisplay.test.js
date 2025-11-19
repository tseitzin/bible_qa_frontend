import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

const routerPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}))

const mockCurrentUser = ref({ id: 'user-123' })

vi.mock('../../composables/useAuth.js', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}))

const savedAnswersServiceMock = vi.hoisted(() => ({
  save: vi.fn(),
}))

vi.mock('../../services/savedAnswersService.js', () => ({
  savedAnswersService: savedAnswersServiceMock,
}))

import AnswerDisplay from '../../components/AnswerDisplay.vue'

const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}

const shareMock = vi.fn().mockResolvedValue(undefined)

const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
  })

  Object.defineProperty(navigator, 'share', {
    value: shareMock,
    writable: true,
  })

  window.confirm = vi.fn().mockReturnValue(false)

  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  }
})

describe('AnswerDisplay', () => {
  let wrapper

  const mountComponent = (props = {}) => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test biblical answer',
        question: 'What is love?',
        questionId: 42,
        ...props,
      },
      attachTo: document.body,
    })
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
    savedAnswersServiceMock.save.mockReset()
    savedAnswersServiceMock.save.mockResolvedValue({ success: true, id: 'saved-id', message: 'Answer saved successfully!' })
    mockCurrentUser.value = { id: 'user-123' }
    routerPush.mockReset()
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  it('does not render when no answer is provided', () => {
    const localWrapper = mountComponent({ answer: '' })
    expect(localWrapper.find('.answer-display').exists()).toBe(false)
  })

  it('renders answer content when provided', async () => {
    const localWrapper = mountComponent({ answer: 'God is love according to 1 John 4:8' })
    await nextTick()
    expect(localWrapper.find('.answer-title').text()).toBe('Biblical Answer')
    expect(localWrapper.find('.answer-display').exists()).toBe(true)
    expect(localWrapper.find('.answer-text').text()).toContain('God is love according to 1 John 4:8')
  })

  it('shows action buttons', () => {
    const localWrapper = mountComponent()
    const buttons = localWrapper.findAll('.action-button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('Copy')
    expect(buttons[1].text()).toContain('Share')
    expect(buttons[2].text()).toContain('Save')
  })

  it('copies answer to clipboard when copy button is clicked', async () => {
    const localWrapper = mountComponent({ answer: 'Copy this answer' })
    const copyButton = localWrapper.findAll('.action-button')[0]
    await copyButton.trigger('click')
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Copy this answer')
  })

  it('shares the answer when share button is clicked and share API is available', async () => {
    const localWrapper = mountComponent({ answer: 'Share this answer' })
    const shareButton = localWrapper.findAll('.action-button')[1]
    await shareButton.trigger('click')
    expect(shareMock).toHaveBeenCalledWith({
      title: 'Bible Q&A Answer',
      text: 'Share this answer',
    })
  })

  describe('save functionality', () => {
    it('calls savedAnswersService with questionId when user is logged in', async () => {
      const localWrapper = mountComponent()
      const saveButton = localWrapper.findAll('.action-button')[2]

      await saveButton.trigger('click')
      await flushPromises()
      await waitForAsync()

      expect(savedAnswersServiceMock.save).toHaveBeenCalledWith(42)
      expect(localWrapper.emitted('answerSaved')).toBeTruthy()
      expect(localWrapper.emitted('answerSaved')[0]).toEqual(['saved-id'])
      expect(localWrapper.vm.saveSuccess).toBe(true)
    })

    it('disables the save button while saving', async () => {
      let resolveSave
      savedAnswersServiceMock.save.mockImplementation(() => new Promise((resolve) => {
        resolveSave = resolve
      }))

      const localWrapper = mountComponent()
      const saveButton = localWrapper.findAll('.action-button')[2]

      expect(saveButton.element.disabled).toBe(false)

      await saveButton.trigger('click')
      await flushPromises()
      await waitForAsync()
      expect(typeof resolveSave).toBe('function')
      expect(saveButton.element.disabled).toBe(true)

      resolveSave({ success: true, id: 'saved-id' })
      await flushPromises()
      await waitForAsync()
      expect(saveButton.element.disabled).toBe(false)
    })

    it('prompts user to login when not authenticated', async () => {
      mockCurrentUser.value = null
      window.confirm = vi.fn().mockReturnValue(true)

      const localWrapper = mountComponent()
      const saveButton = localWrapper.findAll('.action-button')[2]

      await saveButton.trigger('click')
      await flushPromises()
      await waitForAsync()

      expect(window.confirm).toHaveBeenCalled()
      expect(savedAnswersServiceMock.save).not.toHaveBeenCalled()
      expect(localWrapper.emitted('loginRequired')).toEqual([
        [{ question: 'What is love?', answer: 'Test biblical answer', questionId: 42 }]
      ])
      expect(localWrapper.vm.saveSuccess).toBeNull()
    })

    it('sets saveSuccess to false when questionId is missing', async () => {
      const localWrapper = mountComponent({ questionId: null })
      const saveButton = localWrapper.findAll('.action-button')[2]

      await saveButton.trigger('click')
      await flushPromises()

      expect(savedAnswersServiceMock.save).not.toHaveBeenCalled()
      expect(localWrapper.vm.saveSuccess).toBe(false)
    })

    it('resets saveSuccess after timeout', async () => {
      vi.useFakeTimers()

      const localWrapper = mountComponent()
      const saveButton = localWrapper.findAll('.action-button')[2]

      await saveButton.trigger('click')
      await flushPromises()
      await vi.runOnlyPendingTimersAsync()

      expect(localWrapper.vm.saveSuccess).toBe(true)

      vi.advanceTimersByTime(3000)
      await nextTick()

      expect(localWrapper.vm.saveSuccess).toBeNull()

      vi.useRealTimers()
    })
  })

  describe('follow-up functionality', () => {
    it('emits followUpQuestion event when follow-up is submitted', async () => {
      const localWrapper = mountComponent()
      const input = localWrapper.find('input.followup-input')
      await input.setValue('Tell me more about grace')

      const button = localWrapper.find('.followup-button')
      await button.trigger('click')

      expect(localWrapper.emitted('followUpQuestion')).toEqual([['Tell me more about grace']])
    })

    it('does not emit followUpQuestion when input is empty', async () => {
      const localWrapper = mountComponent()
      const button = localWrapper.find('.followup-button')
      await button.trigger('click')

      expect(localWrapper.emitted('followUpQuestion')).toBeUndefined()
    })
  })
})

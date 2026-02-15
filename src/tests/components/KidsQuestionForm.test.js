import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import KidsQuestionForm from '../../components/kids/KidsQuestionForm.vue'

vi.mock('../../composables/useSpeechToText.js', () => ({
  useSpeechToText: () => ({
    isListening: ref(false),
    isSupported: ref(false),
    transcript: ref(''),
    error: ref(''),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    clearTranscript: vi.fn()
  })
}))

describe('KidsQuestionForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  const createWrapper = (props = {}) => {
    return mount(KidsQuestionForm, {
      props: {
        question: '',
        loading: false,
        ...props
      }
    })
  }

  it('renders the question form container', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.kids-question-form').exists()).toBe(true)
  })

  it('renders the form title', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.kids-form-title').text()).toContain('Ask Me Anything!')
  })

  it('renders the form subtitle', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.kids-form-subtitle').text()).toContain('What do you want to know about God and the Bible?')
  })

  it('renders the textarea for input', () => {
    wrapper = createWrapper()

    const textarea = wrapper.find('.kids-textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('maxlength')).toBe('300')
  })

  it('renders the mascot section with speech bubble', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.mascot-character').exists()).toBe(true)
    expect(wrapper.find('.speech-bubble').exists()).toBe(true)
  })

  it('displays suggestions when question is empty and not loading', () => {
    wrapper = createWrapper({ question: '', loading: false })

    expect(wrapper.find('.kids-suggestions').exists()).toBe(true)
    expect(wrapper.text()).toContain('Try asking about these!')
  })

  it('hides suggestions when there is a question', async () => {
    wrapper = createWrapper({ question: '' })

    const textarea = wrapper.find('.kids-textarea')
    await textarea.setValue('What is prayer?')

    expect(wrapper.find('.kids-suggestions').exists()).toBe(false)
  })

  it('fills in a suggestion when clicked', async () => {
    wrapper = createWrapper()

    const suggestionButtons = wrapper.findAll('.kids-suggestion-button')
    expect(suggestionButtons.length).toBeGreaterThan(0)

    await suggestionButtons[0].trigger('click')
    await flushPromises()

    expect(wrapper.emitted()).toHaveProperty('update:question')
  })

  it('disables submit button when question is empty', () => {
    wrapper = createWrapper({ question: '' })

    const submitBtn = wrapper.find('.kids-submit-button')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when question has content', async () => {
    wrapper = createWrapper({ question: '' })

    const textarea = wrapper.find('.kids-textarea')
    await textarea.setValue('Who is baby Jesus?')

    const submitBtn = wrapper.find('.kids-submit-button')
    expect(submitBtn.attributes('disabled')).toBeUndefined()
  })

  it('emits submit event when form is submitted', async () => {
    wrapper = createWrapper({ question: '' })

    const textarea = wrapper.find('.kids-textarea')
    await textarea.setValue('Who is baby Jesus?')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted()).toHaveProperty('submit')
    expect(wrapper.emitted().submit[0]).toEqual(['Who is baby Jesus?'])
  })

  it('does not emit submit when question is empty', async () => {
    wrapper = createWrapper({ question: '' })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted().submit).toBeFalsy()
  })

  it('shows loading state when loading prop is true', () => {
    wrapper = createWrapper({ question: 'Test', loading: true })

    expect(wrapper.find('.kids-loading-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('Looking through the Bible for you!')
  })

  it('disables textarea when loading', () => {
    wrapper = createWrapper({ question: 'Test', loading: true })

    const textarea = wrapper.find('.kids-textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('shows clear button when question has content', async () => {
    wrapper = createWrapper({ question: '' })

    const textarea = wrapper.find('.kids-textarea')
    await textarea.setValue('Some question')

    expect(wrapper.find('.kids-clear-button').exists()).toBe(true)
  })

  it('hides clear button when question is empty', () => {
    wrapper = createWrapper({ question: '' })

    expect(wrapper.find('.kids-clear-button').exists()).toBe(false)
  })

  it('clears the question and emits clear event on clear button click', async () => {
    wrapper = createWrapper({ question: '' })

    const textarea = wrapper.find('.kids-textarea')
    await textarea.setValue('Some question')

    const clearBtn = wrapper.find('.kids-clear-button')
    await clearBtn.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('clear')
    expect(wrapper.emitted()).toHaveProperty('update:question')
    const updateEvents = wrapper.emitted()['update:question']
    const lastUpdate = updateEvents[updateEvents.length - 1]
    expect(lastUpdate).toEqual([''])
  })

  it('shows character count', async () => {
    wrapper = createWrapper({ question: '' })

    expect(wrapper.find('.kids-char-count').exists()).toBe(true)
    expect(wrapper.text()).toContain('/300')
  })

  it('displays submit button with Ask Question text', () => {
    wrapper = createWrapper()

    const submitBtn = wrapper.find('.kids-submit-button')
    expect(submitBtn.text()).toContain('Ask Question!')
  })

  it('displays Thinking text on submit button when loading', () => {
    wrapper = createWrapper({ question: 'Test', loading: true })

    const submitBtn = wrapper.find('.kids-submit-button')
    expect(submitBtn.text()).toContain('Thinking...')
  })
})

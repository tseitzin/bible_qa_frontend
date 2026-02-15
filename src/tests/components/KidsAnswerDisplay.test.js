import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import KidsAnswerDisplay from '../../components/kids/KidsAnswerDisplay.vue'

describe('KidsAnswerDisplay', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(KidsAnswerDisplay, {
      props,
      global: {
        stubs: {
          ScriptureText: {
            template: '<span class="scripture-text">{{ text }}</span>',
            props: ['text', 'textClass', 'navigationSource']
          }
        }
      }
    })
  }

  it('does not render when answer is empty and not loading', () => {
    wrapper = createWrapper({ answer: '', loading: false })

    expect(wrapper.find('.kids-answer-display').exists()).toBe(false)
  })

  it('renders when answer is provided', () => {
    wrapper = createWrapper({ answer: 'God loves you!', loading: false })

    expect(wrapper.find('.kids-answer-display').exists()).toBe(true)
  })

  it('renders when loading is true', () => {
    wrapper = createWrapper({ answer: '', loading: true })

    expect(wrapper.find('.kids-answer-display').exists()).toBe(true)
  })

  it('shows loading state when loading without answer', () => {
    wrapper = createWrapper({ answer: '', loading: true })

    expect(wrapper.find('.kids-loading-inline').exists()).toBe(true)
    expect(wrapper.text()).toContain('Looking through the Bible for you!')
  })

  it('displays the answer title when done loading', () => {
    wrapper = createWrapper({ answer: 'God is love.', loading: false })

    expect(wrapper.find('.answer-title').text()).toContain("Here's what I found!")
  })

  it('shows finding title when loading without answer', () => {
    wrapper = createWrapper({ answer: '', loading: true })

    expect(wrapper.find('.answer-title').text()).toContain('Finding your answer!')
  })

  it('displays the answer text via ScriptureText', () => {
    wrapper = createWrapper({ answer: 'Jesus loves the little children.', loading: false })

    expect(wrapper.find('.scripture-text').text()).toBe('Jesus loves the little children.')
  })

  it('displays stream status when provided', () => {
    wrapper = createWrapper({
      answer: 'Partial answer...',
      loading: true,
      isStreaming: true,
      streamStatus: 'Searching scriptures...'
    })

    expect(wrapper.find('.stream-status').exists()).toBe(true)
    expect(wrapper.text()).toContain('Searching scriptures...')
  })

  it('shows typing indicator during streaming', () => {
    wrapper = createWrapper({
      answer: 'Partial...',
      loading: true,
      isStreaming: true
    })

    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    expect(wrapper.findAll('.typing-dot').length).toBe(3)
  })

  it('shows reading info when answer is complete', () => {
    wrapper = createWrapper({
      answer: 'God created the world in six days and rested on the seventh day.',
      loading: false,
      isStreaming: false
    })

    expect(wrapper.find('.reading-info').exists()).toBe(true)
    expect(wrapper.text()).toContain('minute')
    expect(wrapper.text()).toContain('words')
  })

  it('shows the question prompt when question prop is set', () => {
    wrapper = createWrapper({
      answer: 'God loves you!',
      question: 'Does God love me?',
      loading: false
    })

    expect(wrapper.find('.question-prompt').exists()).toBe(true)
    expect(wrapper.find('.question-prompt__text').text()).toBe('Does God love me?')
  })

  it('shows feedback section when answer is complete', () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    expect(wrapper.find('.kids-feedback').exists()).toBe(true)
    expect(wrapper.text()).toContain('Did this help you learn?')
  })

  it('shows encouragement message when answer is complete', () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    expect(wrapper.find('.encouragement').exists()).toBe(true)
    expect(wrapper.find('.encouragement-text').text()).toBeTruthy()
  })

  it('shows follow-up section when answer is complete', () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    expect(wrapper.find('.followup-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('Want to know more?')
  })

  it('emits followUpQuestion when follow-up is submitted', async () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    const input = wrapper.find('.followup-input')
    await input.setValue('Tell me more about love')

    const button = wrapper.find('.kids-followup-button')
    await button.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('followUpQuestion')
    expect(wrapper.emitted().followUpQuestion[0]).toEqual(['Tell me more about love'])
  })

  it('does not emit followUpQuestion when input is empty', async () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    const button = wrapper.find('.kids-followup-button')
    await button.trigger('click')

    expect(wrapper.emitted().followUpQuestion).toBeFalsy()
  })

  it('shows copy button when answer is complete', () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    const copyButton = wrapper.find('.kids-action-button--copy')
    expect(copyButton.exists()).toBe(true)
    expect(copyButton.text()).toContain('Copy')
  })

  it('shows answer badge when not loading', () => {
    wrapper = createWrapper({
      answer: 'God is love.',
      loading: false,
      isStreaming: false
    })

    expect(wrapper.find('.answer-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('Bible Answer')
  })
})

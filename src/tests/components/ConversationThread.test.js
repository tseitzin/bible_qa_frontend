import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConversationThread from '../../components/ConversationThread.vue'

describe('ConversationThread', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const mockThread = [
    { id: 1, question: 'What is faith?', answer: 'Faith is believing in things unseen.' },
    { id: 2, question: 'Can you explain more?', answer: 'Faith is the substance of things hoped for.' },
    { id: 3, question: 'Any Bible verse?', answer: 'Hebrews 11:1 defines faith clearly.' }
  ]

  const createWrapper = (props = {}) => {
    return mount(ConversationThread, {
      props: {
        thread: [],
        ...props
      },
      global: {
        stubs: {
          ScriptureText: {
            template: '<span class="scripture-text">{{ text }}</span>',
            props: ['text']
          }
        }
      }
    })
  }

  it('renders the conversation thread container', () => {
    wrapper = createWrapper({ thread: mockThread })

    expect(wrapper.find('.conversation-thread').exists()).toBe(true)
  })

  it('renders one item per thread entry', () => {
    wrapper = createWrapper({ thread: mockThread })

    const items = wrapper.findAll('.thread-item')
    expect(items.length).toBe(3)
  })

  it('renders no items when thread is empty', () => {
    wrapper = createWrapper({ thread: [] })

    const items = wrapper.findAll('.thread-item')
    expect(items.length).toBe(0)
  })

  it('labels the first item as Original Question', () => {
    wrapper = createWrapper({ thread: mockThread })

    const labels = wrapper.findAll('.thread-label')
    expect(labels[0].text()).toBe('Original Question')
  })

  it('labels subsequent items as Follow-up with index', () => {
    wrapper = createWrapper({ thread: mockThread })

    const labels = wrapper.findAll('.thread-label')
    expect(labels[1].text()).toBe('Follow-up 1')
    expect(labels[2].text()).toBe('Follow-up 2')
  })

  it('applies follow-up class only to items after the first', () => {
    wrapper = createWrapper({ thread: mockThread })

    const items = wrapper.findAll('.thread-item')
    expect(items[0].classes()).not.toContain('follow-up')
    expect(items[1].classes()).toContain('follow-up')
    expect(items[2].classes()).toContain('follow-up')
  })

  it('displays question text for each thread item', () => {
    wrapper = createWrapper({ thread: mockThread })

    const questionTexts = wrapper.findAll('.question-section .scripture-text')
    expect(questionTexts[0].text()).toBe('What is faith?')
    expect(questionTexts[1].text()).toBe('Can you explain more?')
  })

  it('displays answer text for each thread item', () => {
    wrapper = createWrapper({ thread: mockThread })

    const answerTexts = wrapper.findAll('.answer-section .scripture-text')
    expect(answerTexts[0].text()).toBe('Faith is believing in things unseen.')
    expect(answerTexts[1].text()).toBe('Faith is the substance of things hoped for.')
  })

  it('renders question and answer section headers', () => {
    wrapper = createWrapper({ thread: [mockThread[0]] })

    const headers = wrapper.findAll('h4')
    expect(headers.length).toBe(2)
    expect(headers[0].text()).toBe('Question:')
    expect(headers[1].text()).toBe('Answer:')
  })

  it('renders ScriptureText components for questions and answers', () => {
    wrapper = createWrapper({ thread: [mockThread[0]] })

    const scriptureTexts = wrapper.findAll('.scripture-text')
    expect(scriptureTexts.length).toBe(2)
  })
})

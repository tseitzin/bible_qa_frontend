import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionForm from '../../components/QuestionForm.vue'
import BaseTextarea from '../../components/ui/BaseTextarea.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue'

describe('QuestionForm', () => {
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
    return mount(QuestionForm, {
      props,
      global: {
        components: {
          BaseTextarea,
          BaseButton,
          LoadingSpinner
        }
      }
    })
  }

  it('renders with default props', () => {
    wrapper = createWrapper()

    expect(wrapper.findComponent(BaseTextarea).exists()).toBe(true)
    expect(wrapper.findComponent(BaseButton).exists()).toBe(true)
    expect(wrapper.findComponent(BaseButton).text()).toContain('Ask Question')
  })

  it('shows loading spinner when loading', () => {
    wrapper = createWrapper({
      loading: true
    })

    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true)
    expect(wrapper.findComponent(BaseButton).text()).toContain('Searching Scripture...')
  })

  it('disables form when loading', () => {
    wrapper = createWrapper({
      loading: true,
      question: 'Test question'
    })

    expect(wrapper.findComponent(BaseTextarea).props('disabled')).toBe(true)
    expect(wrapper.findComponent(BaseButton).props('disabled')).toBe(true)
  })

  it('disables submit button when question is empty', () => {
    wrapper = createWrapper({
      question: ''
    })

    expect(wrapper.findComponent(BaseButton).props('disabled')).toBe(true)
  })

  it('enables submit button when question has content', () => {
    wrapper = createWrapper({
      question: 'What is love?'
    })

    expect(wrapper.findComponent(BaseButton).props('disabled')).toBe(false)
  })

  it('emits submit event when form is submitted', async () => {
    wrapper = createWrapper({
      question: 'Test question'
    })

    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted()).toHaveProperty('submit')
    expect(wrapper.emitted().submit[0]).toEqual(['Test question'])
  })

  it('does not submit when question is empty', async () => {
    wrapper = createWrapper({
      question: '   '
    })

    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted().submit).toBeFalsy()
  })

  it('emits question updates', async () => {
    wrapper = createWrapper()

    await wrapper.findComponent(BaseTextarea).vm.$emit('update:modelValue', 'New question')

    expect(wrapper.emitted()).toHaveProperty('update:question')
    expect(wrapper.emitted()['update:question'][0]).toEqual(['New question'])
  })

  it('renders with proper labels and help text', () => {
    wrapper = createWrapper()

    const textarea = wrapper.findComponent(BaseTextarea)
    expect(textarea.props('label')).toBe('Your Bible Question')
    expect(textarea.props('helpText')).toBe('Ask clear, specific questions for the best answers')
    expect(textarea.props('maxLength')).toBe(500)
    expect(textarea.props('showCharCount')).toBe(true)
  })

  it('has proper placeholder text', () => {
    wrapper = createWrapper()

    const textarea = wrapper.findComponent(BaseTextarea)
    expect(textarea.props('placeholder')).toContain('Ask anything about the Bible')
  })
})

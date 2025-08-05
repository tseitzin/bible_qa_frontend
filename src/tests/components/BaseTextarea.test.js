import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTextarea from '../../components/ui/BaseTextarea.vue'

describe('BaseTextarea', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders with default props', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.classes()).toContain('base-textarea')
    expect(wrapper.find('.textarea-wrapper').exists()).toBe(true)
  })

  it('renders with label', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: 'Test Label'
      }
    })

    const label = wrapper.find('.textarea-label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Test Label')
  })

  it('renders with placeholder', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        placeholder: 'Enter text here'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('Enter text here')
  })

  it('shows required indicator when required', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: 'Test Label',
        required: true
      }
    })

    const requiredIndicator = wrapper.find('.required-indicator')
    expect(requiredIndicator.exists()).toBe(true)
    expect(requiredIndicator.text()).toBe('*')
  })

  it('shows help text when provided', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        helpText: 'This is help text'
      }
    })

    const helpText = wrapper.find('.help-text')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toContain('This is help text')
  })

  it('shows error text when provided', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        error: 'This is an error'
      }
    })

    const errorText = wrapper.find('.error-text')
    expect(errorText.exists()).toBe(true)
    expect(errorText.text()).toContain('This is an error')
    expect(wrapper.find('.base-textarea').classes()).toContain('base-textarea--error')
  })

  it('shows character count when enabled', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'Hello',
        maxLength: 100,
        showCharCount: true,
        label: 'Test'
      }
    })

    const charCount = wrapper.find('.char-count-header')
    expect(charCount.exists()).toBe(true)
    expect(charCount.text()).toContain('5/100')
  })

  it('shows character count at bottom when no label', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'Hello',
        maxLength: 100,
        showCharCount: true
      }
    })

    const charCount = wrapper.find('.char-count-bottom')
    expect(charCount.exists()).toBe(true)
    expect(charCount.text()).toContain('5/100')
  })

  it('applies warning class when character count is near limit', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'a'.repeat(85), // 85% of 100
        maxLength: 100,
        showCharCount: true
      }
    })

    const charCount = wrapper.find('.char-count')
    expect(charCount.classes()).toContain('char-count--warning')
  })

  it('applies danger class when character count exceeds limit', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'a'.repeat(105), // 105% of 100
        maxLength: 100,
        showCharCount: true
      }
    })

    const charCount = wrapper.find('.char-count')
    expect(charCount.classes()).toContain('char-count--danger')
  })

  it('emits update:modelValue when input changes', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('New value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['New value'])
  })

  it('emits focus event when textarea is focused', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event when textarea loses focus', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('applies disabled state correctly', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
    expect(textarea.classes()).toContain('base-textarea--disabled')
  })

  it('shows floating label when enabled', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: 'Floating Label',
        floatingLabel: true
      }
    })

    const floatingLabel = wrapper.find('.floating-label')
    expect(floatingLabel.exists()).toBe(true)
    expect(floatingLabel.text()).toBe('Floating Label')
    expect(wrapper.find('.base-textarea').classes()).toContain('base-textarea--floating')
  })

  it('activates floating label when textarea has value', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'Some text',
        label: 'Floating Label',
        floatingLabel: true
      }
    })

    const floatingLabel = wrapper.find('.floating-label')
    expect(floatingLabel.classes()).toContain('floating-label--active')
  })

  it('activates floating label when textarea is focused', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: 'Floating Label',
        floatingLabel: true
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('focus')

    const floatingLabel = wrapper.find('.floating-label')
    expect(floatingLabel.classes()).toContain('floating-label--active')
  })

  it('shows focus indicator when focused', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('focus')

    const focusIndicator = wrapper.find('.focus-indicator')
    expect(focusIndicator.classes()).toContain('focus-indicator--active')
  })

  it('sets correct aria attributes', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: 'Test Label',
        helpText: 'Help text',
        error: 'Error text'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('aria-label')).toBe('Test Label')
    expect(textarea.attributes('aria-describedby')).toContain('help')
    expect(textarea.attributes('aria-invalid')).toBe('true')
  })

  it('handles keydown events', async () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('respects rows prop', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        rows: 10
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('rows')).toBe('10')
  })

  it('respects maxlength prop', () => {
    wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        maxLength: 200
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('maxlength')).toBe('200')
  })
})

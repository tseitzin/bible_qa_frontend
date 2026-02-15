import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders when show is true (default)', () => {
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('does not render when show is false', () => {
    wrapper = mount(LoadingSpinner, {
      props: { show: false }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
  })

  it('renders with default medium size', () => {
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.spinner--md').exists()).toBe(true)
  })

  it('applies small size class', () => {
    wrapper = mount(LoadingSpinner, {
      props: { size: 'sm' }
    })

    expect(wrapper.find('.spinner--sm').exists()).toBe(true)
    expect(wrapper.find('.spinner--md').exists()).toBe(false)
  })

  it('applies large size class', () => {
    wrapper = mount(LoadingSpinner, {
      props: { size: 'lg' }
    })

    expect(wrapper.find('.spinner--lg').exists()).toBe(true)
  })

  it('does not show message when none provided', () => {
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })

  it('shows message when provided', () => {
    wrapper = mount(LoadingSpinner, {
      props: { message: 'Loading data...' }
    })

    expect(wrapper.find('.loading-message').exists()).toBe(true)
    expect(wrapper.find('.loading-message').text()).toBe('Loading data...')
  })

  it('applies center class when center prop is true', () => {
    wrapper = mount(LoadingSpinner, {
      props: { center: true }
    })

    expect(wrapper.find('.loading-spinner--center').exists()).toBe(true)
  })

  it('does not apply center class by default', () => {
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-spinner--center').exists()).toBe(false)
  })

  it('validates size prop', () => {
    const validator = LoadingSpinner.props.size.validator

    expect(validator('sm')).toBe(true)
    expect(validator('md')).toBe(true)
    expect(validator('lg')).toBe(true)
    expect(validator('xl')).toBe(false)
    expect(validator('invalid')).toBe(false)
  })
})

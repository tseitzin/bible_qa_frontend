import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../../components/ui/BaseButton.vue'

describe('BaseButton', () => {
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
    wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn--primary')
    expect(wrapper.classes()).toContain('btn--md')
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('applies variant classes correctly', () => {
    wrapper = mount(BaseButton, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary'
      }
    })

    expect(wrapper.classes()).toContain('btn--secondary')
    expect(wrapper.classes()).not.toContain('btn--primary')
  })

  it('applies size classes correctly', () => {
    wrapper = mount(BaseButton, {
      props: {
        size: 'lg'
      },
      slots: {
        default: 'Large'
      }
    })

    expect(wrapper.classes()).toContain('btn--lg')
    expect(wrapper.classes()).not.toContain('btn--md')
  })

  it('shows disabled state', () => {
    wrapper = mount(BaseButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled'
      }
    })

    expect(wrapper.classes()).toContain('btn--disabled')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows loading state', () => {
    wrapper = mount(BaseButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading'
      }
    })

    expect(wrapper.classes()).toContain('btn--loading')
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows full width class', () => {
    wrapper = mount(BaseButton, {
      props: {
        fullWidth: true
      },
      slots: {
        default: 'Full Width'
      }
    })

    expect(wrapper.classes()).toContain('btn--full-width')
  })

  it('emits click event when clicked', async () => {
    wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted().click).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    wrapper = mount(BaseButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted().click).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    wrapper = mount(BaseButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted().click).toBeFalsy()
  })

  it('validates variant prop', () => {
    const validator = BaseButton.props.variant.validator
    
    expect(validator('primary')).toBe(true)
    expect(validator('secondary')).toBe(true)
    expect(validator('ghost')).toBe(true)
    expect(validator('danger')).toBe(true)
    expect(validator('invalid')).toBe(false)
  })

  it('validates size prop', () => {
    const validator = BaseButton.props.size.validator
    
    expect(validator('sm')).toBe(true)
    expect(validator('md')).toBe(true)
    expect(validator('lg')).toBe(true)
    expect(validator('invalid')).toBe(false)
  })
})

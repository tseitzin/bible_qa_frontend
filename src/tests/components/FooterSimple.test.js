import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FooterSimple from '../../components/FooterSimple.vue'

describe('FooterSimple', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(FooterSimple, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  it('renders the footer element', () => {
    wrapper = createWrapper()

    expect(wrapper.find('footer.footer').exists()).toBe(true)
  })

  it('displays the brand copyright text', () => {
    wrapper = createWrapper()

    expect(wrapper.find('.footer-brand').text()).toContain('2025 Word of Life Answers')
  })

  it('renders the footer navigation', () => {
    wrapper = createWrapper()

    const nav = wrapper.find('nav.footer-links')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Footer')
  })

  it('contains link to About page', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('a')
    const aboutLink = links.find(link => link.text() === 'About')
    expect(aboutLink).toBeDefined()
    expect(aboutLink.attributes('href')).toBe('/about')
  })

  it('contains link to AI & Scripture page', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('a')
    const aiLink = links.find(link => link.text() === 'AI & Scripture')
    expect(aiLink).toBeDefined()
    expect(aiLink.attributes('href')).toBe('/ai-scripture')
  })

  it('contains link to Privacy page', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('a')
    const privacyLink = links.find(link => link.text() === 'Privacy')
    expect(privacyLink).toBeDefined()
    expect(privacyLink.attributes('href')).toBe('/privacy')
  })

  it('contains link to Terms page', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('a')
    const termsLink = links.find(link => link.text() === 'Terms')
    expect(termsLink).toBeDefined()
    expect(termsLink.attributes('href')).toBe('/terms')
  })

  it('contains link to Contact page', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('a')
    const contactLink = links.find(link => link.text() === 'Contact')
    expect(contactLink).toBeDefined()
    expect(contactLink.attributes('href')).toBe('/contact')
  })

  it('renders exactly five navigation links', () => {
    wrapper = createWrapper()

    const links = wrapper.findAll('nav.footer-links a')
    expect(links.length).toBe(5)
  })
})

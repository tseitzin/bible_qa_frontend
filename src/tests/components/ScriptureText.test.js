import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    fetchVerses: vi.fn(),
    fetchChapter: vi.fn(),
    getVerse: vi.fn(),
  },
}))

import ScriptureText from '../../components/ScriptureText.vue'

const mountScriptureText = async (text) => {
  const wrapper = mount(ScriptureText, {
    props: {
      text,
      wrapperClass: 'scripture-text-wrapper',
      textClass: 'scripture-text',
    },
    attachTo: document.body,
  })

  await nextTick()
  return wrapper
}

describe('ScriptureText', () => {
  it('canonicalizes book aliases correctly', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('Gen')).toBe('Genesis')
    expect(canonicalizeBookName('Gen.')).toBe('Genesis')
    expect(canonicalizeBookName('1 Sam')).toBe('1 Samuel')
    expect(canonicalizeBookName('Matt')).toBe('Matthew')
    expect(canonicalizeBookName('rev')).toBe('Revelation')

    wrapper.unmount()
  })

  it('returns null for invalid book names', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('InvalidBook')).toBeNull()
    expect(canonicalizeBookName('')).toBeNull()
    expect(canonicalizeBookName('   ')).toBeNull()

    wrapper.unmount()
  })

  it('creates segments with canonical book references', async () => {
    const wrapper = await mountScriptureText('According to Genesis 1:1, in the beginning God created the heavens.')
    const segments = wrapper.vm.segments

    expect(segments.length).toBeGreaterThanOrEqual(3)
    const reference = segments.find((segment) => segment.type === 'reference')
    expect(reference).toBeDefined()
    expect(reference.display).toBe('Genesis 1:1')
    expect(reference.book).toBe('Genesis')

    wrapper.unmount()
  })

  it('identifies references for common aliases', async () => {
    const wrapper = await mountScriptureText('As Gen 1:1 states, and Matt 5:3 confirms.')
    const segments = wrapper.vm.segments
    const references = segments.filter((segment) => segment.type === 'reference')

    expect(references).toHaveLength(2)
    expect(references[0].book).toBe('Genesis')
    expect(references[1].book).toBe('Matthew')

    wrapper.unmount()
  })

  it('handles continuation references separated by commas and semicolons', async () => {
    const wrapper = await mountScriptureText('See John 3:16, 14:6; and 1:1.')
    const segments = wrapper.vm.segments
    const references = segments.filter((segment) => segment.type === 'reference')

    expect(references.length).toBeGreaterThanOrEqual(3)
    references.forEach((segment) => {
      expect(segment.book).toBe('John')
    })

    wrapper.unmount()
  })

  it('supports chapter-only references', async () => {
    const wrapper = await mountScriptureText('Genesis 1 describes creation.')
    const segments = wrapper.vm.segments
    const reference = segments.find((segment) => segment.type === 'reference')

    expect(reference).toBeDefined()
    expect(reference.display).toBe('Genesis 1')
    expect(reference.chapterReference).toBe(true)

    wrapper.unmount()
  })

  it('returns plain text segments when no references exist', async () => {
    const wrapper = await mountScriptureText('This is just plain text with no Bible references.')
    const segments = wrapper.vm.segments

    expect(segments).toHaveLength(1)
    expect(segments[0].type).toBe('text')
    expect(segments[0].text).toBe('This is just plain text with no Bible references.')

    wrapper.unmount()
  })
})

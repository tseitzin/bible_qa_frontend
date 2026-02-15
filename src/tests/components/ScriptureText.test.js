import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    fetchVerses: vi.fn(),
    fetchChapter: vi.fn(),
    getVerse: vi.fn(),
  },
}))

import { bibleApi } from '../../services/bibleApi.js'
const mockGetVerse = bibleApi.getVerse

vi.mock('../../utils/referenceParser.js', () => ({
  parseReference: vi.fn((ref) => {
    if (typeof ref !== 'string' || !ref.trim()) return null
    // Simple parser for test purposes
    const match = ref.match(/^(\d?\s*[A-Za-z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i)
    if (!match) return null
    const book = match[1].trim()
    const chapter = Number(match[2])
    const startVerse = match[3] ? Number(match[3]) : null
    const endVerse = match[4] ? Number(match[4]) : startVerse
    return {
      reference: ref.trim(),
      book,
      chapter,
      startVerse,
      endVerse: startVerse == null ? null : endVerse,
    }
  }),
  isChapterOnlyReference: vi.fn((ref) => {
    if (typeof ref !== 'string') return false
    const match = ref.match(/^(\d?\s*[A-Za-z\s]+?)\s+(\d+)$/)
    return !!match
  }),
}))

import ScriptureText from '../../components/ScriptureText.vue'

/**
 * Helper to mount ScriptureText with sensible defaults.
 * Attaches to document.body so teleport targets exist.
 */
const mountScriptureText = async (text, extraProps = {}) => {
  const wrapper = mount(ScriptureText, {
    props: {
      text,
      wrapperClass: 'scripture-text-wrapper',
      textClass: 'scripture-text',
      ...extraProps,
    },
    attachTo: document.body,
    global: {
      stubs: {
        teleport: true,
      },
    },
  })
  await nextTick()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ----------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------
describe('ScriptureText — rendering', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the wrapper with the provided wrapperClass', async () => {
    const wrapper = await mountScriptureText('Hello')
    expect(wrapper.find('.scripture-text-wrapper').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders the text container with the provided textClass', async () => {
    const wrapper = await mountScriptureText('Hello')
    expect(wrapper.find('.scripture-text').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders custom wrapperClass and textClass', async () => {
    const wrapper = await mountScriptureText('Hello', {
      wrapperClass: 'custom-wrapper',
      textClass: 'custom-text',
    })
    expect(wrapper.find('.custom-wrapper').exists()).toBe(true)
    expect(wrapper.find('.custom-text').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders plain text when no references are present', async () => {
    const wrapper = await mountScriptureText('This is just plain text.')
    const textEl = wrapper.find('.scripture-text')
    expect(textEl.text()).toBe('This is just plain text.')
    expect(wrapper.findAll('.scripture-reference').length).toBe(0)
    wrapper.unmount()
  })

  it('renders empty string when text prop is empty', async () => {
    const wrapper = await mountScriptureText('')
    const textEl = wrapper.find('.scripture-text')
    expect(textEl.text()).toBe('')
    wrapper.unmount()
  })

  it('renders a scripture reference as a clickable span', async () => {
    const wrapper = await mountScriptureText('Read Genesis 1:1 today.')
    const refs = wrapper.findAll('.scripture-reference')
    expect(refs.length).toBe(1)
    expect(refs[0].text()).toBe('Genesis 1:1')
    wrapper.unmount()
  })

  it('renders multiple references in the same text', async () => {
    const wrapper = await mountScriptureText('See Genesis 1:1 and John 3:16 for more.')
    const refs = wrapper.findAll('.scripture-reference')
    expect(refs.length).toBe(2)
    expect(refs[0].text()).toBe('Genesis 1:1')
    expect(refs[1].text()).toBe('John 3:16')
    wrapper.unmount()
  })

  it('renders text segments between references', async () => {
    const wrapper = await mountScriptureText('Before Genesis 1:1 and after.')
    const textEl = wrapper.find('.scripture-text')
    expect(textEl.text()).toContain('Before')
    expect(textEl.text()).toContain('Genesis 1:1')
    expect(textEl.text()).toContain('and after.')
    wrapper.unmount()
  })

  it('applies scripture-reference--clickable class when enableReferenceClick is true', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })
    const ref = wrapper.find('.scripture-reference')
    expect(ref.classes()).toContain('scripture-reference--clickable')
    wrapper.unmount()
  })

  it('does not apply scripture-reference--clickable class by default', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const ref = wrapper.find('.scripture-reference')
    expect(ref.classes()).not.toContain('scripture-reference--clickable')
    wrapper.unmount()
  })

  it('sets role="button" on references when enableReferenceClick is true', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })
    const ref = wrapper.find('.scripture-reference')
    expect(ref.attributes('role')).toBe('button')
    wrapper.unmount()
  })

  it('does not set role attribute when enableReferenceClick is false', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const ref = wrapper.find('.scripture-reference')
    expect(ref.attributes('role')).toBeUndefined()
    wrapper.unmount()
  })

  it('sets tabindex="0" on references for keyboard accessibility', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const ref = wrapper.find('.scripture-reference')
    expect(ref.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('sets aria-label on references when enableReferenceClick is true', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })
    const ref = wrapper.find('.scripture-reference')
    expect(ref.attributes('aria-label')).toContain('Open')
    wrapper.unmount()
  })

  it('renders slot content', async () => {
    const wrapper = mount(ScriptureText, {
      props: { text: 'Hello' },
      slots: {
        default: '<p class="slot-content">Extra</p>',
      },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    await nextTick()
    expect(wrapper.find('.slot-content').exists()).toBe(true)
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Book canonicalization
// ----------------------------------------------------------------
describe('ScriptureText — book canonicalization', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('canonicalizes book aliases correctly', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('Gen')).toBe('Genesis')
    expect(canonicalizeBookName('Gen.')).toBe('Genesis')
    expect(canonicalizeBookName('1 Sam')).toBe('1 Samuel')
    expect(canonicalizeBookName('Matt')).toBe('Matthew')
    expect(canonicalizeBookName('rev')).toBe('Revelation')
    expect(canonicalizeBookName('Exod')).toBe('Exodus')
    expect(canonicalizeBookName('Prov')).toBe('Proverbs')
    expect(canonicalizeBookName('Heb')).toBe('Hebrews')
    expect(canonicalizeBookName('Eph')).toBe('Ephesians')

    wrapper.unmount()
  })

  it('returns null for invalid book names', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('InvalidBook')).toBeNull()
    expect(canonicalizeBookName('')).toBeNull()
    expect(canonicalizeBookName('   ')).toBeNull()
    expect(canonicalizeBookName(null)).toBeNull()
    expect(canonicalizeBookName(undefined)).toBeNull()

    wrapper.unmount()
  })

  it('is case-insensitive', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('genesis')).toBe('Genesis')
    expect(canonicalizeBookName('GENESIS')).toBe('Genesis')
    expect(canonicalizeBookName('gEnEsIs')).toBe('Genesis')

    wrapper.unmount()
  })

  it('handles numbered books', async () => {
    const wrapper = await mountScriptureText('')
    const { canonicalizeBookName } = wrapper.vm

    expect(canonicalizeBookName('1 Cor')).toBe('1 Corinthians')
    expect(canonicalizeBookName('2 Tim')).toBe('2 Timothy')
    expect(canonicalizeBookName('1 Pet')).toBe('1 Peter')
    expect(canonicalizeBookName('3 Jn')).toBe('3 John')

    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Segment parsing
// ----------------------------------------------------------------
describe('ScriptureText — segment parsing', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('creates segments with canonical book references', async () => {
    const wrapper = await mountScriptureText('According to Genesis 1:1, in the beginning God created the heavens.')
    const segments = wrapper.vm.segments

    expect(segments.length).toBeGreaterThanOrEqual(3)
    const reference = segments.find((s) => s.type === 'reference')
    expect(reference).toBeDefined()
    expect(reference.display).toBe('Genesis 1:1')
    expect(reference.book).toBe('Genesis')
    wrapper.unmount()
  })

  it('identifies references for common aliases', async () => {
    const wrapper = await mountScriptureText('As Gen 1:1 states, and Matt 5:3 confirms.')
    const segments = wrapper.vm.segments
    const references = segments.filter((s) => s.type === 'reference')

    expect(references).toHaveLength(2)
    expect(references[0].book).toBe('Genesis')
    expect(references[1].book).toBe('Matthew')
    wrapper.unmount()
  })

  it('handles continuation references separated by commas and semicolons', async () => {
    const wrapper = await mountScriptureText('See John 3:16, 14:6; and 1:1.')
    const segments = wrapper.vm.segments
    const references = segments.filter((s) => s.type === 'reference')

    expect(references.length).toBeGreaterThanOrEqual(3)
    references.forEach((s) => {
      expect(s.book).toBe('John')
    })
    wrapper.unmount()
  })

  it('supports chapter-only references', async () => {
    const wrapper = await mountScriptureText('Genesis 1 describes creation.')
    const segments = wrapper.vm.segments
    const reference = segments.find((s) => s.type === 'reference')

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

  it('returns a text segment for empty text', async () => {
    const wrapper = await mountScriptureText('')
    const segments = wrapper.vm.segments
    expect(segments).toHaveLength(0)
    wrapper.unmount()
  })

  it('handles verse ranges', async () => {
    const wrapper = await mountScriptureText('Romans 8:28-30 is key.')
    const segments = wrapper.vm.segments
    const reference = segments.find((s) => s.type === 'reference')

    expect(reference).toBeDefined()
    expect(reference.display).toBe('Romans 8:28-30')
    expect(reference.book).toBe('Romans')
    expect(reference.hasVerseSpec).toBe(true)
    wrapper.unmount()
  })

  it('handles chapter ranges', async () => {
    const wrapper = await mountScriptureText('Read Genesis 1-3 for the creation account.')
    const segments = wrapper.vm.segments
    const reference = segments.find((s) => s.type === 'reference')

    expect(reference).toBeDefined()
    expect(reference.display).toBe('Genesis 1-3')
    expect(reference.chapterReference).toBe(true)
    wrapper.unmount()
  })

  it('handles references at the start of text', async () => {
    const wrapper = await mountScriptureText('John 3:16 is well known.')
    const segments = wrapper.vm.segments
    expect(segments[0].type).toBe('reference')
    expect(segments[0].display).toBe('John 3:16')
    wrapper.unmount()
  })

  it('handles references at the end of text', async () => {
    const wrapper = await mountScriptureText('A well known verse is John 3:16')
    const segments = wrapper.vm.segments
    const lastSegment = segments[segments.length - 1]
    // The last segment may be text or reference depending on trailing chars
    const reference = segments.find((s) => s.type === 'reference')
    expect(reference).toBeDefined()
    expect(reference.book).toBe('John')
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Click interactions
// ----------------------------------------------------------------
describe('ScriptureText — click interactions', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('emits reference-click when enableReferenceClick is true and reference is clicked', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })

    const referenceEl = wrapper.find('.scripture-reference')
    await referenceEl.trigger('click')

    expect(wrapper.emitted()['reference-click']).toBeDefined()
    expect(wrapper.emitted()['reference-click'].length).toBe(1)
    // The emitted value should be the normalized reference string
    expect(wrapper.emitted()['reference-click'][0][0]).toBe('John 3:16')
    wrapper.unmount()
  })

  it('does not emit reference-click when enableReferenceClick is false', async () => {
    const wrapper = await mountScriptureText('John 3:16')

    const referenceEl = wrapper.find('.scripture-reference')
    await referenceEl.trigger('click')

    expect(wrapper.emitted()['reference-click']).toBeUndefined()
    wrapper.unmount()
  })

  it('emits reference-click on Enter key press when enabled', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })

    const referenceEl = wrapper.find('.scripture-reference')
    await referenceEl.trigger('keydown.enter')

    expect(wrapper.emitted()['reference-click']).toBeDefined()
    wrapper.unmount()
  })

  it('emits reference-click on Space key press when enabled', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      enableReferenceClick: true,
    })

    const referenceEl = wrapper.find('.scripture-reference')
    await referenceEl.trigger('keydown.space')

    expect(wrapper.emitted()['reference-click']).toBeDefined()
    wrapper.unmount()
  })

  it('does not emit reference-click on Enter when enableReferenceClick is false', async () => {
    const wrapper = await mountScriptureText('John 3:16')

    const referenceEl = wrapper.find('.scripture-reference')
    await referenceEl.trigger('keydown.enter')

    expect(wrapper.emitted()['reference-click']).toBeUndefined()
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Verse popup
// ----------------------------------------------------------------
describe('ScriptureText — verse popup', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows popup on mouseenter', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('mouseenter')
    await nextTick()

    expect(wrapper.vm.versePopup.visible).toBe(true)
    wrapper.unmount()
  })

  it('fetches verse data on mouseenter', async () => {
    mockGetVerse.mockResolvedValue({
      reference: 'John 3:16',
      text: 'For God so loved the world...',
    })

    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('mouseenter')
    await flushPromises()

    expect(mockGetVerse).toHaveBeenCalled()
    expect(wrapper.vm.versePopup.loading).toBe(false)
    wrapper.unmount()
  })

  it('shows error state when verse fetch fails', async () => {
    mockGetVerse.mockRejectedValue(new Error('Network error'))

    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('mouseenter')
    await flushPromises()

    expect(wrapper.vm.versePopup.loading).toBe(false)
    expect(wrapper.vm.versePopup.error).toBeTruthy()
    wrapper.unmount()
  })

  it('hides popup on mouseleave', async () => {
    vi.useFakeTimers()

    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')

    // Show popup
    await refEl.trigger('mouseenter')
    await nextTick()
    expect(wrapper.vm.versePopup.visible).toBe(true)

    // Trigger leave
    await refEl.trigger('mouseleave')
    vi.advanceTimersByTime(200)

    expect(wrapper.vm.versePopup.visible).toBe(false)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('hides popup immediately on Escape key', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')

    // Show popup
    await refEl.trigger('mouseenter')
    await nextTick()
    expect(wrapper.vm.versePopup.visible).toBe(true)

    // Press Escape
    await refEl.trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.vm.versePopup.visible).toBe(false)
    wrapper.unmount()
  })

  it('sets popup display from segment display', async () => {
    const wrapper = await mountScriptureText('Matthew 5:3')
    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('mouseenter')
    await nextTick()

    expect(wrapper.vm.versePopup.display).toBe('Matthew 5:3')
    wrapper.unmount()
  })

  it('caches verse data and uses cache on second hover', async () => {
    mockGetVerse.mockResolvedValue({
      reference: 'John 3:16',
      text: 'For God so loved the world...',
    })

    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')

    // First hover
    await refEl.trigger('mouseenter')
    await flushPromises()

    const firstCallCount = mockGetVerse.mock.calls.length
    expect(firstCallCount).toBeGreaterThan(0)

    // Hide popup
    wrapper.vm.hideVersePopup(true)
    await nextTick()

    // Second hover - should use cache
    await refEl.trigger('mouseenter')
    await flushPromises()

    // API should not be called again
    expect(mockGetVerse.mock.calls.length).toBe(firstCallCount)
    expect(wrapper.vm.versePopup.loading).toBe(false)
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------
describe('ScriptureText — props', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('uses default props when none are provided', async () => {
    const wrapper = mount(ScriptureText, {
      props: { text: 'Hello' },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    await nextTick()

    expect(wrapper.find('.scripture-text-wrapper').exists()).toBe(true)
    expect(wrapper.find('.scripture-text').exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts custom readLinkText', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      readLinkText: 'Read more',
    })
    expect(wrapper.vm.$props.readLinkText).toBe('Read more')
    wrapper.unmount()
  })

  it('accepts navigationSource prop', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      navigationSource: 'search-results',
    })
    expect(wrapper.vm.$props.navigationSource).toBe('search-results')
    wrapper.unmount()
  })

  it('accepts bibleGatewayVersion prop', async () => {
    const wrapper = await mountScriptureText('John 3:16', {
      bibleGatewayVersion: 'NIV',
    })
    expect(wrapper.vm.$props.bibleGatewayVersion).toBe('NIV')
    wrapper.unmount()
  })

  it('accepts allowBookOnly prop', async () => {
    const wrapper = await mountScriptureText('Genesis', {
      allowBookOnly: true,
    })
    expect(wrapper.vm.$props.allowBookOnly).toBe(true)
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Text watcher and lifecycle
// ----------------------------------------------------------------
describe('ScriptureText — lifecycle', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('hides popup when text prop changes to empty', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    const refEl = wrapper.find('.scripture-reference')

    // Show popup
    await refEl.trigger('mouseenter')
    await nextTick()
    expect(wrapper.vm.versePopup.visible).toBe(true)

    // Change text to empty
    await wrapper.setProps({ text: '' })
    await nextTick()

    expect(wrapper.vm.versePopup.visible).toBe(false)
    wrapper.unmount()
  })

  it('updates segments when text prop changes', async () => {
    const wrapper = await mountScriptureText('John 3:16')
    expect(wrapper.findAll('.scripture-reference').length).toBe(1)
    expect(wrapper.find('.scripture-reference').text()).toBe('John 3:16')

    await wrapper.setProps({ text: 'Romans 8:28 is also important.' })
    await nextTick()

    const refs = wrapper.findAll('.scripture-reference')
    expect(refs.length).toBe(1)
    expect(refs[0].text()).toBe('Romans 8:28')
    wrapper.unmount()
  })

  it('cleans up on unmount (clears hide timeout)', async () => {
    vi.useFakeTimers()
    const wrapper = await mountScriptureText('John 3:16')

    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('mouseenter')
    await nextTick()
    await refEl.trigger('mouseleave')

    // Unmount before the timeout fires
    wrapper.unmount()

    // Advancing timers should not throw
    expect(() => vi.advanceTimersByTime(500)).not.toThrow()

    vi.useRealTimers()
  })
})

// ----------------------------------------------------------------
// Utility functions — parseChapterRange
// ----------------------------------------------------------------
describe('ScriptureText — parseChapterRange', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('parses a single chapter', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('5', undefined)
    expect(result).not.toBeNull()
    expect(result.chapters).toEqual([5])
    expect(result.startChapter).toBe(5)
    expect(result.endChapter).toBe(5)
    wrapper.unmount()
  })

  it('parses a chapter range', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('1-3', undefined)
    expect(result).not.toBeNull()
    expect(result.chapters).toEqual([1, 2, 3])
    expect(result.startChapter).toBe(1)
    expect(result.endChapter).toBe(3)
    wrapper.unmount()
  })

  it('returns null for reversed chapter range', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('5-2', undefined)
    expect(result).toBeNull()
    wrapper.unmount()
  })

  it('returns null for triple-part range', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('1-2-3', undefined)
    expect(result).toBeNull()
    wrapper.unmount()
  })

  it('uses fallback chapter when input is empty', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('', 7)
    expect(result).not.toBeNull()
    expect(result.chapters).toEqual([7])
    expect(result.usedFallback).toBe(true)
    wrapper.unmount()
  })

  it('returns null when both input and fallback are empty/invalid', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseChapterRange('', undefined)
    expect(result).toBeNull()
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Utility functions — parseVerseRange
// ----------------------------------------------------------------
describe('ScriptureText — parseVerseRange', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns type "none" for empty input', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('', 1)
    expect(result.type).toBe('none')
    wrapper.unmount()
  })

  it('parses a single verse', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('16', 3)
    expect(result).not.toBeNull()
    expect(result.type).toBe('single')
    expect(result.start).toEqual({ chapter: 3, verse: 16 })
    wrapper.unmount()
  })

  it('parses a single-chapter verse range', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('1-5', 3)
    expect(result).not.toBeNull()
    expect(result.type).toBe('singleChapterRange')
    expect(result.start.verse).toBe(1)
    expect(result.end.verse).toBe(5)
    expect(result.points.length).toBe(5)
    wrapper.unmount()
  })

  it('parses a cross-chapter verse range', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('3:16-4:1', 3)
    expect(result).not.toBeNull()
    expect(result.type).toBe('multiChapterRange')
    expect(result.start).toEqual({ chapter: 3, verse: 16 })
    expect(result.end).toEqual({ chapter: 4, verse: 1 })
    wrapper.unmount()
  })

  it('returns null for invalid ranges (end before start)', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('5-2', 3)
    expect(result).toBeNull()
    wrapper.unmount()
  })

  it('returns null for triple-part ranges', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.parseVerseRange('1-2-3', 3)
    expect(result).toBeNull()
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Utility functions — buildTruncatedSnippet
// ----------------------------------------------------------------
describe('ScriptureText — buildTruncatedSnippet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns full text when under the limit', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.buildTruncatedSnippet('Short text.', 100)
    expect(result).toBe('Short text.')
    wrapper.unmount()
  })

  it('truncates long text with ellipsis', async () => {
    const wrapper = await mountScriptureText('')
    const longText = 'This is a long sentence that should be truncated at a reasonable word boundary.'
    const result = wrapper.vm.buildTruncatedSnippet(longText, 30)
    expect(result.endsWith('\u2026')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(longText.length)
    wrapper.unmount()
  })

  it('returns empty string for empty input', async () => {
    const wrapper = await mountScriptureText('')
    const result = wrapper.vm.buildTruncatedSnippet('')
    expect(result).toBe('')
    wrapper.unmount()
  })

  it('returns full text when charLimit is zero or negative', async () => {
    const wrapper = await mountScriptureText('')
    const text = 'Hello world.'
    expect(wrapper.vm.buildTruncatedSnippet(text, 0)).toBe(text)
    expect(wrapper.vm.buildTruncatedSnippet(text, -10)).toBe(text)
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Utility functions — readingViewLink
// ----------------------------------------------------------------
describe('ScriptureText — readingViewLink', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('generates a reading view link with ref parameter', async () => {
    const wrapper = await mountScriptureText('', { navigationSource: 'answer' })
    const link = wrapper.vm.readingViewLink('John 3:16')
    expect(link).toContain('/reading?')
    expect(link).toContain('ref=John+3%3A16')
    expect(link).toContain('source=answer')
    wrapper.unmount()
  })

  it('returns "#" for empty reference', async () => {
    const wrapper = await mountScriptureText('')
    const link = wrapper.vm.readingViewLink('')
    expect(link).toBe('#')
    wrapper.unmount()
  })

  it('includes fullChapter param for chapter-only references', async () => {
    const wrapper = await mountScriptureText('')
    const link = wrapper.vm.readingViewLink('Genesis 1')
    expect(link).toContain('fullChapter=1')
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Utility functions — stripToChapterReference
// ----------------------------------------------------------------
describe('ScriptureText — stripToChapterReference', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('strips verse part from a full reference', async () => {
    const wrapper = await mountScriptureText('')
    expect(wrapper.vm.stripToChapterReference('John 3:16')).toBe('John 3')
    wrapper.unmount()
  })

  it('returns the reference unchanged if no colon', async () => {
    const wrapper = await mountScriptureText('')
    expect(wrapper.vm.stripToChapterReference('John 3')).toBe('John 3')
    wrapper.unmount()
  })

  it('returns empty string for falsy input', async () => {
    const wrapper = await mountScriptureText('')
    expect(wrapper.vm.stripToChapterReference('')).toBe('')
    expect(wrapper.vm.stripToChapterReference(null)).toBe('')
    expect(wrapper.vm.stripToChapterReference(undefined)).toBe('')
    wrapper.unmount()
  })
})

// ----------------------------------------------------------------
// Focus and blur popup
// ----------------------------------------------------------------
describe('ScriptureText — focus/blur interactions', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows popup on focus', async () => {
    const wrapper = await mountScriptureText('Psalm 23:1')
    const refEl = wrapper.find('.scripture-reference')
    await refEl.trigger('focus')
    await nextTick()

    expect(wrapper.vm.versePopup.visible).toBe(true)
    wrapper.unmount()
  })

  it('hides popup on blur', async () => {
    vi.useFakeTimers()
    const wrapper = await mountScriptureText('Psalm 23:1')
    const refEl = wrapper.find('.scripture-reference')

    await refEl.trigger('focus')
    await nextTick()
    expect(wrapper.vm.versePopup.visible).toBe(true)

    await refEl.trigger('blur')
    vi.advanceTimersByTime(200)

    expect(wrapper.vm.versePopup.visible).toBe(false)

    vi.useRealTimers()
    wrapper.unmount()
  })
})

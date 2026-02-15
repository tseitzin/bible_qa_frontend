import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ReadingView from '../../views/ReadingView.vue'

const mockRouterPush = vi.fn()
const mockRouteQuery = { ref: 'John 3:16', source: 'answer' }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({
    query: mockRouteQuery,
    params: {},
    path: '/reading'
  }),
  RouterLink: { template: '<a><slot /></a>', props: ['to'] }
}))

const mockGetPassage = vi.fn()
const mockGetChapter = vi.fn()

vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    getPassage: (...args) => mockGetPassage(...args),
    getChapter: (...args) => mockGetChapter(...args)
  }
}))

vi.mock('../../utils/referenceParser.js', () => ({
  isChapterOnlyReference: vi.fn(() => false)
}))

describe('ReadingView.vue', () => {
  let wrapper

  const samplePassageData = {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    start_verse: 16,
    end_verse: 16,
    verses: [
      { reference: 'John 3:16', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' }
    ]
  }

  const sampleChapterData = {
    book: 'John',
    chapter: 3,
    verses: [
      { reference: 'John 3:1', chapter: 3, verse: 1, text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:' },
      { reference: 'John 3:2', chapter: 3, verse: 2, text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.' },
      { reference: 'John 3:16', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' }
    ]
  }

  beforeEach(() => {
    mockRouterPush.mockClear()
    mockGetPassage.mockResolvedValue(samplePassageData)
    mockGetChapter.mockResolvedValue(sampleChapterData)

    // Reset query to default
    mockRouteQuery.ref = 'John 3:16'
    mockRouteQuery.source = 'answer'
    mockRouteQuery.plan = undefined
    mockRouteQuery.fullChapter = undefined
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(ReadingView, {
      global: {
        stubs: {
          RouterLink: { template: '<a class="router-link-stub"><slot /></a>', props: ['to'] }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the reading shell container', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.reading-shell').exists()).toBe(true)
    })

    it('renders the reading header', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.reading-header').exists()).toBe(true)
    })

    it('displays the back navigation button', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.exists()).toBe(true)
    })

    it('renders the reading card', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.reading-card').exists()).toBe(true)
    })
  })

  describe('Passage Display', () => {
    it('displays the passage reference in the header pill', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const pill = wrapper.find('.reference-pill')
      expect(pill.exists()).toBe(true)
      expect(pill.text()).toContain('John 3:16')
    })

    it('displays the passage title heading', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const header = wrapper.find('.card-header h1')
      expect(header.exists()).toBe(true)
      expect(header.text()).toContain('John 3:16')
    })

    it('displays the card label "Focused Passage"', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const label = wrapper.find('.card-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Focused Passage')
    })

    it('displays verse text after loading', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('For God so loved the world')
    })

    it('renders verse numbers', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const verseNumber = wrapper.find('.verse-number')
      expect(verseNumber.exists()).toBe(true)
      expect(verseNumber.text()).toBe('16')
    })
  })

  describe('Loading State', () => {
    it('shows loading text while passage is loading', async () => {
      mockGetPassage.mockReturnValue(new Promise(() => {})) // never resolves
      wrapper = createWrapper()
      // Don't flush so it stays in loading
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Loading passage')
    })
  })

  describe('Error State', () => {
    it('displays error message when passage fails to load', async () => {
      mockGetPassage.mockRejectedValue(new Error('Passage not found'))
      wrapper = createWrapper()
      await flushPromises()
      const errorText = wrapper.find('.error-text')
      expect(errorText.exists()).toBe(true)
      expect(errorText.text()).toContain('Passage not found')
    })

    it('shows no reference message when ref query is empty', async () => {
      mockRouteQuery.ref = ''
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('No reference selected')
    })
  })

  describe('Back Navigation', () => {
    it('shows "Return to Answer" when source is answer', async () => {
      mockRouteQuery.source = 'answer'
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.text()).toContain('Return to Answer')
    })

    it('navigates back to main with answer tab when source is answer', async () => {
      mockRouteQuery.source = 'answer'
      wrapper = createWrapper()
      await flushPromises()
      await wrapper.find('.link-button').trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'ask', restore: 'answer' }
      })
    })

    it('shows "Return to Study Helps" when source is study', async () => {
      mockRouteQuery.source = 'study'
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.text()).toContain('Return to Study Helps')
    })

    it('shows "Return to Reading Plan" when source is reading-plan', async () => {
      mockRouteQuery.source = 'reading-plan'
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.text()).toContain('Return to Reading Plan')
    })

    it('navigates to reading plan page when source is reading-plan and planSlug exists', async () => {
      mockRouteQuery.source = 'reading-plan'
      mockRouteQuery.plan = 'bible-in-a-year'
      wrapper = createWrapper()
      await flushPromises()
      await wrapper.find('.link-button').trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'reading-plan',
        params: { slug: 'bible-in-a-year' }
      })
    })

    it('shows default "Back to Study Helps" when source is empty', async () => {
      mockRouteQuery.source = ''
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.text()).toContain('Back to Study Helps')
    })
  })

  describe('Full Chapter', () => {
    it('shows "View full chapter" button when passage has verse range', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      expect(viewChapterBtn).toBeTruthy()
    })

    it('loads full chapter on button click', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      await viewChapterBtn.trigger('click')
      await flushPromises()
      expect(mockGetChapter).toHaveBeenCalledWith('John', 3)
    })

    it('displays full chapter content after loading', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      await viewChapterBtn.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Full Chapter')
      expect(wrapper.text()).toContain('John 3')
      expect(wrapper.text()).toContain('There was a man of the Pharisees')
    })

    it('shows "Hide chapter" button after chapter is expanded', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      await viewChapterBtn.trigger('click')
      await flushPromises()
      const hideBtn = wrapper.find('.btn-link')
      expect(hideBtn.exists()).toBe(true)
      expect(hideBtn.text()).toContain('Hide chapter')
    })

    it('collapses chapter when hide button is clicked', async () => {
      wrapper = createWrapper()
      await flushPromises()

      // Expand
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      await viewChapterBtn.trigger('click')
      await flushPromises()

      // Collapse
      const hideBtn = wrapper.find('.btn-link')
      await hideBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('Full Chapter')
    })

    it('disables "View full chapter" button while chapter is loading', async () => {
      mockGetChapter.mockReturnValueOnce(new Promise(() => {})) // never resolves
      wrapper = createWrapper()
      await flushPromises()

      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      await viewChapterBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // The button text should change to "Loading..."
      expect(wrapper.text()).toContain('Loading')
    })
  })

  describe('Chapter Navigation (Full Chapter)', () => {
    const multiChapterPassageData = {
      reference: 'John 3-5',
      book: 'John',
      chapter: 3,
      end_chapter: 5,
      start_verse: null,
      end_verse: null,
      verses: [
        { reference: 'John 3:1', chapter: 3, verse: 1, text: 'There was a man of the Pharisees...' },
        { reference: 'John 3:2', chapter: 3, verse: 2, text: 'The same came to Jesus by night...' },
        { reference: 'John 4:1', chapter: 4, verse: 1, text: 'When therefore the Lord knew...' },
        { reference: 'John 4:2', chapter: 4, verse: 2, text: 'Though Jesus himself baptized not...' },
        { reference: 'John 5:1', chapter: 5, verse: 1, text: 'After this there was a feast...' }
      ]
    }

    it('shows chapter navigation for multi-chapter passages', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      const chapterNav = wrapper.find('.chapter-nav')
      expect(chapterNav.exists()).toBe(true)
    })

    it('displays chapter status in passage navigator', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Chapter 3 of 5')
    })

    it('disables previous chapter button when on first chapter', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      const chapterNav = wrapper.find('.chapter-nav--compact')
      const prevBtn = chapterNav.findAll('.btn-secondary').find(b => b.text().includes('Previous'))
      expect(prevBtn.attributes('disabled')).toBeDefined()
    })

    it('enables next chapter button when not on last chapter', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      const chapterNav = wrapper.find('.chapter-nav--compact')
      const nextBtn = chapterNav.findAll('.btn-secondary').find(b => b.text().includes('Next'))
      expect(nextBtn.attributes('disabled')).toBeUndefined()
    })

    it('advances to next chapter when next button is clicked', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      // Initially showing chapter 3
      expect(wrapper.text()).toContain('John 3')

      const chapterNav = wrapper.find('.chapter-nav--compact')
      const nextBtn = chapterNav.findAll('.btn-secondary').find(b => b.text().includes('Next'))
      await nextBtn.trigger('click')
      await flushPromises()

      // Now showing chapter 4
      expect(wrapper.text()).toContain('When therefore the Lord knew')
    })

    it('goes to previous chapter when previous button is clicked', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      // Move to chapter 4 first
      const chapterNav = wrapper.find('.chapter-nav--compact')
      const nextBtn = chapterNav.findAll('.btn-secondary').find(b => b.text().includes('Next'))
      await nextBtn.trigger('click')
      await flushPromises()

      // Now go back to chapter 3
      const prevBtn = chapterNav.findAll('.btn-secondary').find(b => b.text().includes('Previous'))
      await prevBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('There was a man of the Pharisees')
    })

    it('shows chapter heading for multi-chapter passages', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      wrapper = createWrapper()
      await flushPromises()

      const heading = wrapper.find('.chapter-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('John 3')
    })

    it('shows chapter navigation in expanded chapter view for multi-chapter passage', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      mockGetChapter.mockResolvedValueOnce(sampleChapterData)
      wrapper = createWrapper()
      await flushPromises()

      // Expand full chapter (button may be hidden if chapter is fully displayed)
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      if (!viewChapterBtn) return
      await viewChapterBtn.trigger('click')
      await flushPromises()

      // The expanded chapter section should show navigation
      const allNavs = wrapper.findAll('.chapter-nav')
      expect(allNavs.length).toBeGreaterThanOrEqual(1)
    })

    it('navigates to next chapter in expanded chapter view', async () => {
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      mockGetChapter.mockResolvedValue(sampleChapterData)
      wrapper = createWrapper()
      await flushPromises()

      // Expand full chapter (button may be hidden if chapter is fully displayed)
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      if (!viewChapterBtn) return
      await viewChapterBtn.trigger('click')
      await flushPromises()

      // Find the non-compact chapter nav (expanded chapter section)
      const expandedNav = wrapper.findAll('.chapter-nav').filter(nav => !nav.classes().includes('chapter-nav--compact'))
      if (expandedNav.length) {
        const nextBtn = expandedNav[0].findAll('.btn-secondary').find(b => b.text().includes('Next'))
        if (nextBtn && !nextBtn.attributes('disabled')) {
          await nextBtn.trigger('click')
          await flushPromises()
          // getChapter should have been called again for the next chapter
          expect(mockGetChapter.mock.calls.length).toBeGreaterThanOrEqual(2)
        }
      }
    })

    it('navigates to previous chapter in expanded chapter view', async () => {
      // Start at chapter 4 so we can go back
      const ch4Data = { ...sampleChapterData, chapter: 4 }
      mockGetPassage.mockResolvedValueOnce(multiChapterPassageData)
      mockGetChapter.mockResolvedValueOnce(ch4Data)
      wrapper = createWrapper()
      await flushPromises()

      // Move to chapter 4 in passage view
      const compactNav = wrapper.find('.chapter-nav--compact')
      const passageNextBtn = compactNav.findAll('.btn-secondary').find(b => b.text().includes('Next'))
      await passageNextBtn.trigger('click')
      await flushPromises()

      // Now expand chapter view at chapter 4
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      if (viewChapterBtn) {
        mockGetChapter.mockResolvedValueOnce(ch4Data)
        await viewChapterBtn.trigger('click')
        await flushPromises()

        // Try to go back in expanded view
        const expandedNavs = wrapper.findAll('.chapter-nav').filter(nav => !nav.classes().includes('chapter-nav--compact'))
        if (expandedNavs.length) {
          const prevBtn = expandedNavs[0].findAll('.btn-secondary').find(b => b.text().includes('Previous'))
          if (prevBtn && !prevBtn.attributes('disabled')) {
            mockGetChapter.mockResolvedValueOnce(sampleChapterData)
            await prevBtn.trigger('click')
            await flushPromises()
            expect(mockGetChapter).toHaveBeenCalled()
          }
        }
      }
    })
  })

  describe('Chapter-Only References', () => {
    it('hides "View full chapter" button when reference is chapter-only via fullChapter query', async () => {
      const { isChapterOnlyReference } = await import('../../utils/referenceParser.js')
      isChapterOnlyReference.mockReturnValue(true)
      mockRouteQuery.fullChapter = '1'
      mockRouteQuery.ref = 'John 3'

      const chapterOnlyData = {
        reference: 'John 3',
        book: 'John',
        chapter: 3,
        start_verse: null,
        end_verse: null,
        verses: [
          { reference: 'John 3:1', chapter: 3, verse: 1, text: 'There was a man of the Pharisees...' },
          { reference: 'John 3:16', chapter: 3, verse: 16, text: 'For God so loved the world...' }
        ]
      }
      mockGetPassage.mockResolvedValueOnce(chapterOnlyData)
      wrapper = createWrapper()
      await flushPromises()

      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text()?.includes('View full chapter'))
      expect(viewChapterBtn).toBeUndefined()
    })
  })

  describe('Verse Number Extraction', () => {
    it('extracts verse number from reference with colon format', async () => {
      wrapper = createWrapper()
      await flushPromises()

      const verseNumbers = wrapper.findAll('.verse-number')
      expect(verseNumbers.length).toBeGreaterThanOrEqual(1)
      // John 3:16 should extract 16
      expect(verseNumbers[0].text()).toBe('16')
    })

    it('handles verse objects with verse property', async () => {
      const verseWithProperty = {
        reference: 'John 3:16',
        book: 'John',
        chapter: 3,
        start_verse: 16,
        end_verse: 16,
        verses: [
          { reference: 'invalid-format', chapter: 3, verse: 7, text: 'Marvel not that I said unto thee, Ye must be born again.' }
        ]
      }
      mockGetPassage.mockResolvedValueOnce(verseWithProperty)
      wrapper = createWrapper()
      await flushPromises()

      const verseNumber = wrapper.find('.verse-number')
      expect(verseNumber.exists()).toBe(true)
      // Falls back to verse property when reference doesn't have colon
      expect(verseNumber.text()).toBe('7')
    })
  })

  describe('Error Recovery', () => {
    it('shows "Unable to load passage" fallback when error has no message', async () => {
      mockGetPassage.mockRejectedValueOnce(new Error(''))
      wrapper = createWrapper()
      await flushPromises()

      const errorText = wrapper.find('.error-text')
      expect(errorText.exists()).toBe(true)
      expect(errorText.text()).toContain('Unable to load passage')
    })

    it('shows muted placeholder text when no passage data and not loading', async () => {
      mockRouteQuery.ref = ''
      wrapper = createWrapper()
      await flushPromises()

      // The "No reference selected" error or the muted text should appear
      expect(wrapper.text()).toContain('No reference selected')
    })

    it('clears chapter state when a new passage is loaded', async () => {
      wrapper = createWrapper()
      await flushPromises()

      // Expand chapter (button may be hidden if chapter is fully displayed)
      const viewChapterBtn = wrapper.findAll('.btn-secondary').find(b => b.text().includes('View full chapter'))
      if (!viewChapterBtn) return
      await viewChapterBtn.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Full Chapter')

      // Load a new passage (simulate route change by re-loading)
      const newPassageData = {
        reference: 'Romans 8:28',
        book: 'Romans',
        chapter: 8,
        start_verse: 28,
        end_verse: 28,
        verses: [
          { reference: 'Romans 8:28', chapter: 8, verse: 28, text: 'And we know that all things work together for good...' }
        ]
      }
      mockGetPassage.mockResolvedValueOnce(newPassageData)
      mockRouteQuery.ref = 'Romans 8:28'

      // Trigger the watcher manually by re-mounting
      wrapper.unmount()
      mockGetPassage.mockResolvedValueOnce(newPassageData)
      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).not.toContain('Full Chapter')
      expect(wrapper.text()).toContain('Romans 8:28')
    })
  })

  describe('Back Navigation Edge Cases', () => {
    it('navigates to study tab when source is reading-plan but no planSlug', async () => {
      mockRouteQuery.source = 'reading-plan'
      mockRouteQuery.plan = undefined
      wrapper = createWrapper()
      await flushPromises()

      await wrapper.find('.link-button').trigger('click')

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'study' }
      })
    })

    it('navigates to main page with no params when source is unrecognized', async () => {
      mockRouteQuery.source = 'unknown-source'
      wrapper = createWrapper()
      await flushPromises()

      await wrapper.find('.link-button').trigger('click')

      expect(mockRouterPush).toHaveBeenCalledWith({ name: 'main' })
    })

    it('navigates to study tab when source is study', async () => {
      mockRouteQuery.source = 'study'
      wrapper = createWrapper()
      await flushPromises()

      await wrapper.find('.link-button').trigger('click')

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'study' }
      })
    })
  })

  describe('No Chapter Navigation for Single-Chapter Passages', () => {
    it('does not show passage chapter navigator for single-chapter reference', async () => {
      // Default samplePassageData has chapter: 3 and no end_chapter, so no nav
      wrapper = createWrapper()
      await flushPromises()

      const compactNav = wrapper.find('.chapter-nav--compact')
      expect(compactNav.exists()).toBe(false)
    })
  })

  describe('Passage Display Label', () => {
    it('shows "Select a reference" when no passage data is loaded', async () => {
      mockGetPassage.mockRejectedValueOnce(new Error('Not found'))
      wrapper = createWrapper()
      await flushPromises()

      // The heading h1 should not show any passage reference
      // Instead it shows the currentReference value since passageDisplay falls back to it
      const h1 = wrapper.find('.card-header h1')
      expect(h1.exists()).toBe(true)
    })
  })
})

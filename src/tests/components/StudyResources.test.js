import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudyResources from '../../components/StudyResources.vue'

const mockPush = vi.fn()
const mockRoute = { path: '/adults', query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

const mockTopics = [
  {
    topic: 'Faith',
    summary: 'Trusting in God',
    references: [{ passage: 'Hebrews 11:1', note: 'Definition of faith' }],
    keywords: ['faith', 'trust']
  },
  {
    topic: 'Hope',
    summary: 'Living in expectation',
    references: [{ passage: 'Romans 8:24', note: 'Saved in hope' }],
    keywords: ['hope']
  }
]

const mockPlans = [
  {
    slug: 'psalms-30',
    name: 'Psalms in 30 Days',
    description: 'Read through Psalms',
    duration_days: 30,
    metadata: { category: 'featured' }
  },
  {
    slug: 'bible-365',
    name: 'Bible in a Year',
    description: 'Read the entire Bible in 365 days',
    duration_days: 365,
    metadata: { category: 'annual' }
  }
]

vi.mock('../../services/studyResourcesService.js', () => ({
  studyResourcesService: {
    searchTopics: vi.fn(),
    listReadingPlans: vi.fn(),
    listDevotionalTemplates: vi.fn().mockResolvedValue([]),
    getCrossReferences: vi.fn().mockResolvedValue({ references: [] }),
    generateDevotional: vi.fn().mockResolvedValue(null)
  }
}))

vi.mock('../../services/userReadingPlanService.js', () => ({
  userReadingPlanService: {
    listPlans: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../../services/authService.js', () => ({
  default: {
    getCurrentUser: vi.fn().mockResolvedValue(null)
  }
}))

vi.mock('../../utils/referenceParser.js', () => ({
  parseReference: vi.fn((ref) => ({ reference: ref })),
  isChapterOnlyReference: vi.fn(() => false)
}))

import { studyResourcesService } from '../../services/studyResourcesService.js'
import authService from '../../services/authService.js'
import { userReadingPlanService } from '../../services/userReadingPlanService.js'
import { isChapterOnlyReference } from '../../utils/referenceParser.js'

describe('StudyResources', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
    vi.clearAllMocks()
    studyResourcesService.searchTopics.mockResolvedValue({ results: mockTopics })
    studyResourcesService.listReadingPlans.mockResolvedValue(mockPlans)
    studyResourcesService.listDevotionalTemplates.mockResolvedValue([])
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  const createWrapper = async () => {
    wrapper = mount(StudyResources, {
      global: {
        stubs: {
          ScriptureText: {
            template: '<span class="scripture-text" @click="$emit(\'reference-click\', text)">{{ text }}</span>',
            props: ['text', 'wrapperClass', 'textClass', 'readLinkText', 'enableReferenceClick', 'navigationSource'],
            emits: ['reference-click']
          }
        }
      }
    })
    await flushPromises()
    return wrapper
  }

  it('renders the study panel container', async () => {
    await createWrapper()

    expect(wrapper.find('.study-panel').exists()).toBe(true)
  })

  it('loads topics on mount', async () => {
    await createWrapper()

    expect(studyResourcesService.searchTopics).toHaveBeenCalled()
  })

  it('loads reading plans on mount', async () => {
    await createWrapper()

    expect(studyResourcesService.listReadingPlans).toHaveBeenCalled()
  })

  it('renders the Bible Topic Explorer section', async () => {
    await createWrapper()

    expect(wrapper.text()).toContain('Bible Topic Explorer')
  })

  it('renders the Reading Plans section', async () => {
    await createWrapper()

    expect(wrapper.text()).toContain('Reading Plans')
  })

  it('renders topic dropdown with available topics', async () => {
    await createWrapper()

    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    const options = select.findAll('option')
    // 1 disabled placeholder + 2 topics
    expect(options.length).toBe(3)
    expect(options[1].text()).toBe('Faith')
    expect(options[2].text()).toBe('Hope')
  })

  it('displays topic results when a topic is selected', async () => {
    await createWrapper()

    // Topics auto-select the first one on load
    expect(wrapper.find('.topic-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Faith')
    expect(wrapper.text()).toContain('Trusting in God')
  })

  it('shows featured plans section', async () => {
    await createWrapper()

    expect(wrapper.text()).toContain('Featured Plans')
    expect(wrapper.text()).toContain('Psalms in 30 Days')
  })

  it('shows annual plans section', async () => {
    await createWrapper()

    expect(wrapper.text()).toContain('Annual Journeys')
    expect(wrapper.text()).toContain('Bible in a Year')
  })

  it('displays plan duration in days', async () => {
    await createWrapper()

    expect(wrapper.text()).toContain('30 days')
    expect(wrapper.text()).toContain('365 days')
  })

  it('shows error state when topics fail to load', async () => {
    studyResourcesService.searchTopics.mockRejectedValueOnce(new Error('Network error'))

    await createWrapper()

    expect(wrapper.find('.error-text').exists()).toBe(true)
  })

  it('navigates to reading plan on plan card click', async () => {
    await createWrapper()

    const planCard = wrapper.find('.plan-card')
    await planCard.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'reading-plan',
      params: { slug: 'psalms-30' }
    })
  })

  describe('Topic Selection and Switching', () => {
    it('switches displayed topic when a different topic is selected', async () => {
      await createWrapper()

      // First topic is auto-selected
      expect(wrapper.text()).toContain('Trusting in God')

      // Select the second topic
      const select = wrapper.find('select')
      await select.setValue('Hope')
      await flushPromises()

      expect(wrapper.text()).toContain('Hope')
      expect(wrapper.text()).toContain('Living in expectation')
    })

    it('displays reference notes alongside passage references', async () => {
      await createWrapper()

      expect(wrapper.text()).toContain('Definition of faith')
    })

    it('shows muted placeholder text when no topic is selected yet', async () => {
      studyResourcesService.searchTopics.mockResolvedValueOnce({ results: [] })

      await createWrapper()

      expect(wrapper.find('.muted-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Select a topic to view its summary and references')
    })

    it('displays topic summary text in the topic card', async () => {
      await createWrapper()

      const topicCard = wrapper.find('.topic-card')
      expect(topicCard.find('.topic-summary').text()).toBe('Trusting in God')
    })

    it('renders scripture text references for each topic reference', async () => {
      await createWrapper()

      const scriptureTexts = wrapper.findAll('.scripture-text')
      expect(scriptureTexts.length).toBeGreaterThanOrEqual(1)
      expect(scriptureTexts[0].text()).toBe('Hebrews 11:1')
    })

    it('shows error detail from API response when topics fail to load', async () => {
      studyResourcesService.searchTopics.mockRejectedValueOnce({
        response: { data: { detail: 'Server overloaded' } }
      })

      await createWrapper()

      expect(wrapper.find('.error-text').text()).toBe('Server overloaded')
    })

    it('clears topic results when empty results are returned', async () => {
      studyResourcesService.searchTopics.mockResolvedValueOnce({ results: [] })

      await createWrapper()

      expect(wrapper.find('.topic-card').exists()).toBe(false)
    })
  })

  describe('Topic Reference Click Navigation', () => {
    it('navigates to reading view when a topic reference is clicked', async () => {
      await createWrapper()

      const scriptureText = wrapper.find('.scripture-text')
      await scriptureText.trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith({
        name: 'reading',
        query: expect.objectContaining({
          ref: 'Hebrews 11:1',
          source: 'study'
        })
      })
    })

    it('adds fullChapter flag for chapter-only references', async () => {
      isChapterOnlyReference.mockReturnValueOnce(true)

      await createWrapper()

      const scriptureText = wrapper.find('.scripture-text')
      await scriptureText.trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith({
        name: 'reading',
        query: expect.objectContaining({
          fullChapter: '1'
        })
      })
    })
  })

  describe('Reading Plans Display', () => {
    it('shows error state when reading plans fail to load', async () => {
      studyResourcesService.listReadingPlans.mockRejectedValueOnce(new Error('Plans error'))

      await createWrapper()

      const errorTexts = wrapper.findAll('.error-text')
      const planError = errorTexts.find(el => el.text().includes('Unable to load reading plans'))
      expect(planError).toBeTruthy()
    })

    it('shows error detail from API response when plans fail', async () => {
      studyResourcesService.listReadingPlans.mockRejectedValueOnce({
        response: { data: { detail: 'Database unavailable' } }
      })

      await createWrapper()

      const errorTexts = wrapper.findAll('.error-text')
      const planError = errorTexts.find(el => el.text().includes('Database unavailable'))
      expect(planError).toBeTruthy()
    })

    it('shows "No featured plans available yet" when no featured plans exist', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce([
        { slug: 'bible-365', name: 'Bible in a Year', description: 'Read it all', duration_days: 365, metadata: { category: 'annual' } }
      ])

      await createWrapper()

      expect(wrapper.text()).toContain('No featured plans available yet')
    })

    it('displays plan descriptions', async () => {
      await createWrapper()

      expect(wrapper.text()).toContain('Read through Psalms')
      expect(wrapper.text()).toContain('Read the entire Bible in 365 days')
    })

    it('shows "Featured" badge for featured plans', async () => {
      await createWrapper()

      const pills = wrapper.findAll('.plan-pill')
      const featuredPill = pills.find(p => p.text() === 'Featured')
      expect(featuredPill).toBeTruthy()
    })

    it('shows "Annual" badge for annual plans', async () => {
      await createWrapper()

      const pills = wrapper.findAll('.plan-pill')
      const annualPill = pills.find(p => p.text() === 'Annual')
      expect(annualPill).toBeTruthy()
    })

    it('shows plan count in featured plans header', async () => {
      await createWrapper()

      expect(wrapper.text()).toContain('1 options')
    })

    it('reloads reading plans when Reload button is clicked', async () => {
      await createWrapper()

      studyResourcesService.listReadingPlans.mockResolvedValueOnce(mockPlans)

      const reloadBtn = wrapper.findAll('button').find(b => b.text() === 'Reload')
      expect(reloadBtn).toBeTruthy()
      await reloadBtn.trigger('click')
      await flushPromises()

      expect(studyResourcesService.listReadingPlans).toHaveBeenCalledTimes(2)
    })

    it('navigates to annual plan on annual plan card click', async () => {
      await createWrapper()

      const planCards = wrapper.findAll('.plan-card')
      // The annual plan card should be the second one
      const annualCard = planCards.find(card => card.text().includes('Bible in a Year'))
      expect(annualCard).toBeTruthy()
      await annualCard.trigger('click')

      expect(mockPush).toHaveBeenCalledWith({
        name: 'reading-plan',
        params: { slug: 'bible-365' }
      })
    })
  })

  describe('Carousel Navigation', () => {
    const manyFeaturedPlans = [
      { slug: 'plan-1', name: 'Plan 1', description: 'Desc 1', duration_days: 7, metadata: { category: 'featured' } },
      { slug: 'plan-2', name: 'Plan 2', description: 'Desc 2', duration_days: 14, metadata: { category: 'featured' } },
      { slug: 'plan-3', name: 'Plan 3', description: 'Desc 3', duration_days: 21, metadata: { category: 'featured' } },
      { slug: 'plan-4', name: 'Plan 4', description: 'Desc 4', duration_days: 28, metadata: { category: 'featured' } },
      { slug: 'plan-5', name: 'Plan 5', description: 'Desc 5', duration_days: 35, metadata: { category: 'featured' } }
    ]

    it('disables previous arrow when at the beginning of featured carousel', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyFeaturedPlans)

      await createWrapper()

      const prevArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('previous featured'))
      expect(prevArrow).toBeTruthy()
      expect(prevArrow.attributes('disabled')).toBeDefined()
    })

    it('enables next arrow when there are more plans to show in featured carousel', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyFeaturedPlans)

      await createWrapper()

      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next featured'))
      expect(nextArrow).toBeTruthy()
      expect(nextArrow.attributes('disabled')).toBeUndefined()
    })

    it('advances featured carousel on next arrow click', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyFeaturedPlans)

      await createWrapper()

      // Initially shows plans 1-3
      expect(wrapper.text()).toContain('Plan 1')
      expect(wrapper.text()).toContain('Plan 3')
      expect(wrapper.text()).not.toContain('Plan 4')

      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next featured'))
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()

      // After advancing, plan 4 should be visible
      expect(wrapper.text()).toContain('Plan 4')
    })

    it('goes back in featured carousel on previous arrow click', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyFeaturedPlans)

      await createWrapper()

      // Advance first
      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next featured'))
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()

      // Then go back
      const prevArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('previous featured'))
      await prevArrow.trigger('click')
      await wrapper.vm.$nextTick()

      // Plan 1 should be visible again
      expect(wrapper.text()).toContain('Plan 1')
    })

    it('disables next arrow when at the end of featured carousel', async () => {
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyFeaturedPlans)

      await createWrapper()

      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next featured'))

      // Click next enough times to reach the end (5 plans, 3 visible, so 2 clicks)
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()

      expect(nextArrow.attributes('disabled')).toBeDefined()
    })

    it('handles annual carousel navigation', async () => {
      const manyAnnualPlans = [
        { slug: 'annual-1', name: 'Annual 1', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-2', name: 'Annual 2', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-3', name: 'Annual 3', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-4', name: 'Annual 4', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } }
      ]
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyAnnualPlans)

      await createWrapper()

      expect(wrapper.text()).toContain('Annual 1')
      expect(wrapper.text()).not.toContain('Annual 4')

      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next annual'))
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Annual 4')
    })

    it('disables previous arrow for annual carousel at beginning', async () => {
      const manyAnnualPlans = [
        { slug: 'annual-1', name: 'Annual 1', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-2', name: 'Annual 2', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-3', name: 'Annual 3', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-4', name: 'Annual 4', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } }
      ]
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyAnnualPlans)

      await createWrapper()

      const prevArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('previous annual'))
      expect(prevArrow.attributes('disabled')).toBeDefined()
    })

    it('navigates annual carousel back with previous arrow', async () => {
      const manyAnnualPlans = [
        { slug: 'annual-1', name: 'Annual 1', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-2', name: 'Annual 2', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-3', name: 'Annual 3', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } },
        { slug: 'annual-4', name: 'Annual 4', description: 'Desc', duration_days: 365, metadata: { category: 'annual' } }
      ]
      studyResourcesService.listReadingPlans.mockResolvedValueOnce(manyAnnualPlans)

      await createWrapper()

      // Advance
      const nextArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('next annual'))
      await nextArrow.trigger('click')
      await wrapper.vm.$nextTick()

      // Go back
      const prevArrow = wrapper.findAll('.carousel-arrow').find(btn => btn.attributes('aria-label')?.includes('previous annual'))
      await prevArrow.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Annual 1')
    })
  })

  describe('Tracked Plans', () => {
    it('loads tracked plans for authenticated users', async () => {
      authService.getCurrentUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' })
      userReadingPlanService.listPlans.mockResolvedValueOnce([
        { id: 10, plan: { slug: 'psalms-30' }, total_days: 30, completed_days: 15 }
      ])

      await createWrapper()

      expect(userReadingPlanService.listPlans).toHaveBeenCalled()
    })

    it('shows tracked progress percentage for tracked plans', async () => {
      authService.getCurrentUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' })
      userReadingPlanService.listPlans.mockResolvedValueOnce([
        { id: 10, plan: { slug: 'psalms-30' }, total_days: 30, completed_days: 15 }
      ])

      await createWrapper()

      expect(wrapper.text()).toContain('Tracked: 50% complete')
    })

    it('applies tracked styling to tracked plan cards', async () => {
      authService.getCurrentUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' })
      userReadingPlanService.listPlans.mockResolvedValueOnce([
        { id: 10, plan: { slug: 'psalms-30' }, total_days: 30, completed_days: 15 }
      ])

      await createWrapper()

      const trackedCard = wrapper.find('.plan-card--tracked')
      expect(trackedCard.exists()).toBe(true)
    })

    it('does not load tracked plans when user is not authenticated', async () => {
      authService.getCurrentUser.mockResolvedValueOnce(null)

      await createWrapper()

      expect(userReadingPlanService.listPlans).not.toHaveBeenCalled()
    })

    it('handles tracked plans fetch failure gracefully', async () => {
      authService.getCurrentUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' })
      userReadingPlanService.listPlans.mockRejectedValueOnce(new Error('Unauthorized'))

      await createWrapper()

      // Should not crash; no tracked card shown
      expect(wrapper.find('.plan-card--tracked').exists()).toBe(false)
    })

    it('handles getCurrentUser failure gracefully', async () => {
      authService.getCurrentUser.mockRejectedValueOnce(new Error('Auth error'))

      await createWrapper()

      expect(userReadingPlanService.listPlans).not.toHaveBeenCalled()
      expect(wrapper.find('.study-panel').exists()).toBe(true)
    })
  })

  describe('Loading and Template Handling', () => {
    it('loads devotional templates on mount', async () => {
      await createWrapper()

      expect(studyResourcesService.listDevotionalTemplates).toHaveBeenCalled()
    })

    it('handles template loading failure gracefully', async () => {
      studyResourcesService.listDevotionalTemplates.mockRejectedValueOnce(new Error('Template error'))

      await createWrapper()

      // Should not crash
      expect(wrapper.find('.study-panel').exists()).toBe(true)
      expect(console.error).toHaveBeenCalled()
    })

    it('calls all three loaders in parallel on mount', async () => {
      await createWrapper()

      expect(studyResourcesService.searchTopics).toHaveBeenCalledTimes(1)
      expect(studyResourcesService.listReadingPlans).toHaveBeenCalledTimes(1)
      expect(studyResourcesService.listDevotionalTemplates).toHaveBeenCalledTimes(1)
    })
  })

  describe('Plan Highlighting', () => {
    it('applies active class to highlighted plan card when plan query is set', async () => {
      mockRoute.query = { plan: 'psalms-30' }

      await createWrapper()

      const activeCard = wrapper.find('.plan-card--active')
      expect(activeCard.exists()).toBe(true)
      expect(activeCard.text()).toContain('Psalms in 30 Days')

      // Reset
      mockRoute.query = {}
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import ReadingPlanView from '../../views/ReadingPlanView.vue'

const mockRouterPush = vi.fn()
const mockRouterReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
  useRoute: () => ({
    params: { slug: 'test-plan' },
    query: {},
    path: '/reading-plan/test-plan'
  }),
  RouterLink: { template: '<a><slot /></a>', props: ['to'] }
}))

const mockListReadingPlans = vi.fn()
const mockGetReadingPlan = vi.fn()

vi.mock('../../services/studyResourcesService.js', () => ({
  studyResourcesService: {
    listReadingPlans: (...args) => mockListReadingPlans(...args),
    getReadingPlan: (...args) => mockGetReadingPlan(...args)
  }
}))

const mockListPlans = vi.fn()
const mockStartPlan = vi.fn()
const mockGetPlanDetail = vi.fn()
const mockUpdateDayCompletion = vi.fn()
const mockDeletePlan = vi.fn()

vi.mock('../../services/userReadingPlanService.js', () => ({
  default: {
    listPlans: (...args) => mockListPlans(...args),
    startPlan: (...args) => mockStartPlan(...args),
    getPlanDetail: (...args) => mockGetPlanDetail(...args),
    updateDayCompletion: (...args) => mockUpdateDayCompletion(...args),
    deletePlan: (...args) => mockDeletePlan(...args)
  }
}))

// Shared reactive ref so tests can toggle authentication
const mockIsAuthenticated = ref(false)

vi.mock('../../composables/useAuth.js', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated
  })
}))

vi.mock('../../utils/referenceParser.js', () => ({
  parseReference: vi.fn((ref) => ({ reference: ref })),
  isChapterOnlyReference: vi.fn(() => false)
}))

describe('ReadingPlanView.vue', () => {
  let wrapper

  const samplePlansList = [
    { slug: 'test-plan', name: 'Test Plan', duration_days: 30 },
    { slug: 'annual-plan', name: 'Annual Plan', duration_days: 365 }
  ]

  const samplePlanDetail = {
    plan: {
      name: 'Test Plan',
      description: 'A test reading plan for testing purposes.',
      duration_days: 30,
      metadata: { category: 'topical' }
    },
    schedule: [
      { day_number: 1, title: 'Day 1 Reading', passage: 'Genesis 1', notes: '', scheduled_date: '2025-01-01' },
      { day_number: 2, title: 'Day 2 Reading', passage: 'Genesis 2', notes: 'Creation continues', scheduled_date: '2025-01-02' },
      { day_number: 3, title: 'Day 3 Reading', passage: 'Genesis 3', notes: '', scheduled_date: '2025-01-03' }
    ]
  }

  beforeEach(() => {
    mockRouterPush.mockClear()
    mockRouterReplace.mockClear()
    mockListReadingPlans.mockResolvedValue(samplePlansList)
    mockGetReadingPlan.mockResolvedValue(samplePlanDetail)
    mockListPlans.mockResolvedValue([])
    mockStartPlan.mockClear()
    mockGetPlanDetail.mockClear()
    mockUpdateDayCompletion.mockClear()
    mockDeletePlan.mockClear()
    mockIsAuthenticated.value = false
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(ReadingPlanView, {
      global: {
        stubs: {
          ScriptureText: {
            template: '<span class="scripture-text-stub">{{ text }}</span>',
            props: ['text', 'wrapperClass', 'textClass', 'readLinkText', 'enableReferenceClick', 'allowBookOnly', 'navigationSource']
          },
          RouterLink: { template: '<a class="router-link-stub"><slot /></a>', props: ['to'] }
        }
      }
    })
  }

  describe('Rendering', () => {
    it('renders the reading plan view container', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.reading-plan-view').exists()).toBe(true)
    })

    it('renders the back navigation button', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.find('.link-button')
      expect(backButton.exists()).toBe(true)
      expect(backButton.text()).toContain('Back to Study Tools')
    })

    it('renders the plan switcher select', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const select = wrapper.find('.plan-switcher select')
      expect(select.exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('shows loading message while plan detail is loading', async () => {
      mockGetReadingPlan.mockReturnValue(new Promise(() => {})) // never resolves
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Loading reading plan')
    })
  })

  describe('Error State', () => {
    it('displays error message when plan fails to load', async () => {
      mockGetReadingPlan.mockRejectedValue({ response: { data: { detail: 'Plan not found' } } })
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.error-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Plan not found')
    })

    it('displays retry button on error', async () => {
      mockGetReadingPlan.mockRejectedValue(new Error('Network error'))
      wrapper = createWrapper()
      await flushPromises()
      const retryButton = wrapper.find('.btn-secondary')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Try Again')
    })

    it('retries loading on retry button click', async () => {
      mockGetReadingPlan.mockRejectedValueOnce(new Error('fail'))
      wrapper = createWrapper()
      await flushPromises()

      mockGetReadingPlan.mockResolvedValueOnce(samplePlanDetail)
      const retryButton = wrapper.findAll('.btn-secondary').find(b => b.text().includes('Try Again'))
      await retryButton.trigger('click')
      await flushPromises()

      expect(mockGetReadingPlan).toHaveBeenCalledTimes(2)
    })
  })

  describe('Plan Detail Display', () => {
    it('displays the plan name in the hero section', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const hero = wrapper.find('.plan-hero')
      expect(hero.exists()).toBe(true)
      expect(hero.text()).toContain('Test Plan')
    })

    it('displays the plan description', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('A test reading plan for testing purposes')
    })

    it('displays the plan duration', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('30 days')
    })
  })

  describe('Schedule Display', () => {
    it('renders the schedule list', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const scheduleList = wrapper.find('.schedule-list')
      expect(scheduleList.exists()).toBe(true)
    })

    it('renders schedule items for each day', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const items = wrapper.findAll('.schedule-list li')
      expect(items.length).toBe(3)
    })

    it('displays day numbers and titles', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Day 1')
      expect(wrapper.text()).toContain('Day 1 Reading')
      expect(wrapper.text()).toContain('Day 2')
    })

    it('displays the schedule preview header', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Schedule Preview')
      expect(wrapper.text()).toContain('Click any passage to open it inside Reading View')
    })
  })

  describe('Navigation', () => {
    it('navigates back to study tools when back button is clicked', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const backButton = wrapper.findAll('.link-button').find(b => b.text().includes('Back'))
      await backButton.trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'main',
        query: { tab: 'study', plan: 'test-plan' }
      })
    })
  })

  describe('Unauthenticated Tracking Panel', () => {
    it('shows create account and log in links when not authenticated', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Create a free account')
      const links = wrapper.findAll('.router-link-stub')
      const createAccountLink = links.find(l => l.text().includes('Create Account'))
      const loginLink = links.find(l => l.text().includes('Log In'))
      expect(createAccountLink).toBeTruthy()
      expect(loginLink).toBeTruthy()
    })
  })

  describe('Controls Section', () => {
    it('renders the start date input', async () => {
      wrapper = createWrapper()
      await flushPromises()
      const dateInput = wrapper.find('input[type="date"]')
      expect(dateInput.exists()).toBe(true)
    })

    it('displays tracking instructions', async () => {
      wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('How tracking works')
      expect(wrapper.text()).toContain('Select a start date to preview the full schedule')
    })

    it('refetches plan detail when start date changes', async () => {
      wrapper = createWrapper()
      await flushPromises()

      mockGetReadingPlan.mockClear()
      const dateInput = wrapper.find('.control-form input[type="date"]')
      await dateInput.setValue('2025-06-01')
      await dateInput.trigger('change')
      await flushPromises()

      expect(mockGetReadingPlan).toHaveBeenCalledWith('test-plan', expect.objectContaining({
        startDate: '2025-06-01'
      }))
    })
  })

  describe('Authenticated Tracking', () => {
    const sampleTrackedPlans = [
      {
        id: 100,
        plan: { slug: 'test-plan', name: 'Test Plan', metadata: { category: 'topical' } },
        nickname: '',
        start_date: '2025-01-01',
        completed_days: 1,
        total_days: 30,
        percent_complete: 3,
        completed_at: null
      }
    ]

    const sampleTrackedPlanDetail = {
      id: 100,
      plan: { slug: 'test-plan', name: 'Test Plan' },
      schedule: [
        { day_number: 1, title: 'Day 1 Reading', passage: 'Genesis 1', is_complete: true, completed_at: '2025-01-01T12:00:00Z' },
        { day_number: 2, title: 'Day 2 Reading', passage: 'Genesis 2', is_complete: false, completed_at: null },
        { day_number: 3, title: 'Day 3 Reading', passage: 'Genesis 3', is_complete: false, completed_at: null }
      ],
      completed_days: 1,
      percent_complete: 3,
      total_days: 30
    }

    it('loads user plans when authenticated', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)

      wrapper = createWrapper()
      await flushPromises()

      expect(mockListPlans).toHaveBeenCalled()
    })

    it('shows tracking summary row when user has a tracked plan', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)

      wrapper = createWrapper()
      await flushPromises()

      const summaryRow = wrapper.find('.tracking-summary-row')
      expect(summaryRow.exists()).toBe(true)
      expect(summaryRow.text()).toContain('1')
      expect(summaryRow.text()).toContain('30')
      expect(summaryRow.text()).toContain('3%')
    })

    it('shows completion toggles when user has a tracked plan with detail', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)

      wrapper = createWrapper()
      await flushPromises()

      const completionToggles = wrapper.findAll('.completion-toggle')
      expect(completionToggles.length).toBeGreaterThan(0)
    })

    it('marks a completed day with schedule-completed class', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)

      wrapper = createWrapper()
      await flushPromises()

      const items = wrapper.findAll('.schedule-list li')
      expect(items[0].classes()).toContain('schedule-completed')
      expect(items[1].classes()).not.toContain('schedule-completed')
    })

    it('toggles day completion and updates state', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)
      mockUpdateDayCompletion.mockResolvedValue({
        is_complete: true,
        completed_at: '2025-01-02T15:00:00Z',
        completed_days: 2,
        percent_complete: 7,
        total_days: 30,
        plan_completed_at: null
      })

      wrapper = createWrapper()
      await flushPromises()

      // Find day 2 completion checkbox (which is not yet complete)
      const checkboxes = wrapper.findAll('.completion-toggle input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)

      // Toggle day 2 complete
      await checkboxes[1].setValue(true)
      await flushPromises()

      expect(mockUpdateDayCompletion).toHaveBeenCalledWith(100, 2, true)
    })

    it('creates a new tracked plan via form submission', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue([])
      mockStartPlan.mockResolvedValue({ id: 200 })

      wrapper = createWrapper()
      await flushPromises()

      // Fill in the create form
      const form = wrapper.find('.tracking-card--create')
      const dateInputs = form.findAll('input[type="date"]')
      const nicknameInput = form.find('input[type="text"]')
      await dateInputs[0].setValue('2025-03-01')
      await nicknameInput.setValue('My Plan')

      // Submit the form
      await form.trigger('submit')
      await flushPromises()

      expect(mockStartPlan).toHaveBeenCalledWith(expect.objectContaining({
        planSlug: 'test-plan',
        startDate: '2025-03-01',
        nickname: 'My Plan'
      }))
    })

    it('handles create plan failure', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue([])
      mockStartPlan.mockRejectedValue({ response: { data: { detail: 'Unable to start this plan' } } })

      wrapper = createWrapper()
      await flushPromises()

      const form = wrapper.find('.tracking-card--create')
      await form.trigger('submit')
      await flushPromises()

      expect(wrapper.text()).toContain('Unable to start this plan')
    })

    it('shows loading state for tracking panel', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockReturnValue(new Promise(() => {})) // never resolves

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Loading your plans')
    })

    it('shows "No saved plans yet" when authenticated with no tracked plans', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue([])

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('No saved plans yet')
    })

    it('deletes a tracked plan after confirmation', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)
      mockDeletePlan.mockResolvedValue(undefined)
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      wrapper = createWrapper()
      await flushPromises()

      const deleteButton = wrapper.findAll('.link-button--danger').find(b => b.text().includes('Delete'))
      expect(deleteButton).toBeTruthy()
      await deleteButton.trigger('click')
      await flushPromises()

      expect(mockDeletePlan).toHaveBeenCalledWith(100)
    })

    it('does not delete tracked plan when user cancels confirm', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      wrapper = createWrapper()
      await flushPromises()

      const deleteButton = wrapper.findAll('.link-button--danger').find(b => b.text().includes('Delete'))
      await deleteButton.trigger('click')
      await flushPromises()

      expect(mockDeletePlan).not.toHaveBeenCalled()
    })

    it('handles delete plan failure', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)
      mockDeletePlan.mockRejectedValue({ response: { data: { detail: 'Unable to delete this plan' } } })
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      wrapper = createWrapper()
      await flushPromises()

      const deleteButton = wrapper.findAll('.link-button--danger').find(b => b.text().includes('Delete'))
      await deleteButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Unable to delete this plan')
    })

    it('shows tracked plan selector with sorted plans', async () => {
      const multiplePlans = [
        {
          id: 100,
          plan: { slug: 'test-plan', name: 'Test Plan', metadata: { category: 'topical' } },
          nickname: 'Early plan',
          start_date: '2025-01-01',
          completed_days: 0,
          total_days: 30,
          percent_complete: 0,
          completed_at: null
        },
        {
          id: 101,
          plan: { slug: 'test-plan', name: 'Test Plan', metadata: { category: 'topical' } },
          nickname: 'Later plan',
          start_date: '2025-06-01',
          completed_days: 5,
          total_days: 30,
          percent_complete: 17,
          completed_at: null
        }
      ]
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(multiplePlans)
      mockGetPlanDetail.mockResolvedValue({ ...sampleTrackedPlanDetail, id: 101 })

      wrapper = createWrapper()
      await flushPromises()

      const options = wrapper.findAll('.tracking-card--select option')
      expect(options.length).toBe(2)
      // Later plan (more recent start_date) should be first
      expect(options[0].text()).toContain('Later plan')
      expect(options[1].text()).toContain('Early plan')
    })

    it('loads user plans error shows error text', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockRejectedValue({ response: { data: { detail: 'Server error' } } })

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Server error')
    })

    it('shows completed_at date for finished day', async () => {
      mockIsAuthenticated.value = true
      mockListPlans.mockResolvedValue(sampleTrackedPlans)
      mockGetPlanDetail.mockResolvedValue(sampleTrackedPlanDetail)

      wrapper = createWrapper()
      await flushPromises()

      // Day 1 has completed_at = '2025-01-01T12:00:00Z'
      const completionToggles = wrapper.findAll('.completion-toggle')
      expect(completionToggles[0].text()).toContain('Completed')
      expect(completionToggles[0].text()).toContain('Finished')
    })
  })

  describe('Pagination', () => {
    it('does not show pagination for plans with few days', async () => {
      wrapper = createWrapper()
      await flushPromises()

      // 3 days, page size is 30, so no pagination needed
      expect(wrapper.find('.schedule-pagination').exists()).toBe(false)
    })

    it('shows pagination for annual plans with many days', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'Read the Bible in a year.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: Array.from({ length: 60 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Genesis ${i + 1}`,
          notes: '',
          scheduled_date: `2025-01-${String(i + 1).padStart(2, '0')}`
        }))
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      const pagination = wrapper.find('.schedule-pagination')
      expect(pagination.exists()).toBe(true)
      expect(pagination.text()).toContain('Page 1 of 2')
    })

    it('navigates to next and previous pages', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'Read the Bible in a year.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: Array.from({ length: 60 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Genesis ${i + 1}`,
          notes: '',
          scheduled_date: `2025-01-${String(i + 1).padStart(2, '0')}`
        }))
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      // Go to next page
      const nextButton = wrapper.findAll('.schedule-pagination button').find(b => b.text().includes('Next'))
      await nextButton.trigger('click')
      await flushPromises()

      expect(wrapper.find('.schedule-pagination').text()).toContain('Page 2 of 2')

      // Go back to previous
      const prevButton = wrapper.findAll('.schedule-pagination button').find(b => b.text().includes('Previous'))
      await prevButton.trigger('click')
      await flushPromises()

      expect(wrapper.find('.schedule-pagination').text()).toContain('Page 1 of 2')
    })

    it('disables prev button on first page', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'Read the Bible in a year.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: Array.from({ length: 60 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Genesis ${i + 1}`,
          notes: '',
          scheduled_date: ''
        }))
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      const prevButton = wrapper.findAll('.schedule-pagination button').find(b => b.text().includes('Prev'))
      expect(prevButton.attributes('disabled')).toBeDefined()
    })

    it('disables next button on last page', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'Read the Bible in a year.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: Array.from({ length: 60 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Genesis ${i + 1}`,
          notes: '',
          scheduled_date: ''
        }))
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      // Navigate to last page
      const nextButton = wrapper.findAll('.schedule-pagination button').find(b => b.text().includes('Next'))
      await nextButton.trigger('click')
      await flushPromises()

      // Now next should be disabled
      const nextButtonUpdated = wrapper.findAll('.schedule-pagination button').find(b => b.text().includes('Next'))
      expect(nextButtonUpdated.attributes('disabled')).toBeDefined()
    })

    it('shows annual pagination labels for annual plans', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'A full year plan.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: Array.from({ length: 60 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Psalm ${i + 1}`,
          notes: '',
          scheduled_date: ''
        }))
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Previous Month')
      expect(wrapper.text()).toContain('Next Month')
      expect(wrapper.text()).toContain('Month 1')
    })
  })

  describe('Plan Switching', () => {
    it('navigates when plan switcher select value changes', async () => {
      wrapper = createWrapper()
      await flushPromises()

      const select = wrapper.find('.plan-switcher select')
      await select.setValue('annual-plan')
      await select.trigger('change')
      await flushPromises()

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'reading-plan',
        params: { slug: 'annual-plan' }
      })
    })
  })

  describe('Annual Plan Category', () => {
    it('shows Annual Journey pill for annual category plans', async () => {
      const annualDetail = {
        plan: {
          name: 'Annual Plan',
          description: 'A year-long plan.',
          duration_days: 365,
          metadata: { category: 'annual' }
        },
        schedule: [
          { day_number: 1, title: 'Day 1', passage: 'Genesis 1', notes: '', scheduled_date: '' }
        ]
      }
      mockGetReadingPlan.mockResolvedValue(annualDetail)

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.plan-pill').exists()).toBe(true)
      expect(wrapper.find('.plan-pill').text()).toBe('Annual Journey')
    })

    it('does not show category pill for non-annual plans', async () => {
      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('.plan-pill').exists()).toBe(false)
    })
  })

  describe('Error Fallback Message', () => {
    it('shows generic error when response has no detail', async () => {
      mockGetReadingPlan.mockRejectedValue(new Error('Network error'))
      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Unable to load plan detail')
    })
  })

  describe('Schedule Expansion', () => {
    it('re-fetches with explicit days when schedule is shorter than duration', async () => {
      const shortScheduleDetail = {
        plan: {
          name: 'Test Plan',
          description: 'A plan.',
          duration_days: 30,
          metadata: { category: 'topical' }
        },
        schedule: [
          { day_number: 1, title: 'Day 1', passage: 'Genesis 1', notes: '', scheduled_date: '' }
        ]
      }

      const fullScheduleDetail = {
        ...shortScheduleDetail,
        schedule: Array.from({ length: 30 }, (_, i) => ({
          day_number: i + 1,
          title: `Day ${i + 1}`,
          passage: `Genesis ${i + 1}`,
          notes: '',
          scheduled_date: ''
        }))
      }

      // First call to listReadingPlans returns the list (no duration_days hint)
      mockListReadingPlans.mockResolvedValue([
        { slug: 'test-plan', name: 'Test Plan' }  // no duration_days, triggers expansion path
      ])
      mockGetReadingPlan
        .mockResolvedValueOnce(shortScheduleDetail)  // first fetch: short schedule
        .mockResolvedValueOnce(fullScheduleDetail)    // second fetch: expanded schedule

      wrapper = createWrapper()
      await flushPromises()

      // Should have been called twice (initial + expansion)
      expect(mockGetReadingPlan).toHaveBeenCalledTimes(2)
      expect(mockGetReadingPlan).toHaveBeenLastCalledWith('test-plan', expect.objectContaining({
        days: 30
      }))
    })
  })

  describe('Schedule Notes', () => {
    it('displays notes when a schedule item has them', async () => {
      wrapper = createWrapper()
      await flushPromises()

      // Day 2 has notes: 'Creation continues'
      expect(wrapper.text()).toContain('Creation continues')
    })
  })
})

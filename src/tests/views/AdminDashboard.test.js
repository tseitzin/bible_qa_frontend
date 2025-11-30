import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AdminDashboard from '../../views/AdminDashboard.vue'
import { bibleApi } from '../../services/bibleApi.js'

// Mock the API
vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    getApiStats: vi.fn(),
    getApiLogs: vi.fn(),
    getEndpointStats: vi.fn(),
    getOpenAIStats: vi.fn(),
    getOpenAICalls: vi.fn(),
    getOpenAIUserUsage: vi.fn(),
    getUserStats: vi.fn(),
    listUsers: vi.fn(),
    getUserDetail: vi.fn(),
    toggleUserActive: vi.fn(),
    clearUserSavedAnswers: vi.fn(),
    resetUserAccount: vi.fn(),
    deleteUser: vi.fn(),
    cleanupGuestUsers: vi.fn()
  }
}))

// Mock router
const mockRouter = {
  push: vi.fn()
}

describe('AdminDashboard.vue', () => {
  let wrapper

  const mockStats = {
    total_requests: 1000,
    unique_users: 50,
    successful_requests: 950,
    error_requests: 50,
    openai_requests: 800
  }

  const mockLogs = {
    logs: [
      {
        id: 1,
        timestamp: '2024-01-15T10:30:00Z',
        user_id: 1,
        endpoint: '/api/ask',
        method: 'POST',
        status_code: 200,
        ip_address: '192.168.1.1'
      },
      {
        id: 2,
        timestamp: '2024-01-15T10:35:00Z',
        user_id: null,
        endpoint: '/api/health',
        method: 'GET',
        status_code: 200,
        ip_address: '192.168.1.2'
      }
    ]
  }

  const mockEndpointStats = {
    endpoints: [
      { endpoint: '/api/ask', request_count: 500, success_rate: 95.5 },
      { endpoint: '/api/health', request_count: 200, success_rate: 100.0 }
    ]
  }

  const mockOpenAIStats = {
    total_calls: 500,
    total_tokens_used: 1500000,
    avg_tokens_per_call: 3000,
    avg_response_time_ms: 2500,
    successful_calls: 475
  }

  const mockOpenAICalls = {
    calls: [
      {
        id: 1,
        timestamp: '2024-01-15T10:30:00Z',
        user_id: 1,
        question: 'What is love?',
        total_tokens: 3000,
        response_time_ms: 2400,
        status: 'success'
      }
    ]
  }

  const mockOpenAIUserUsage = {
    users: [
      {
        user_id: 1,
        call_count: 50,
        total_tokens: 150000,
        avg_tokens_per_call: 3000,
        last_call: '2024-01-15T10:30:00Z'
      }
    ]
  }

  const mockUserStats = {
    total_users: 100,
    active_users: 85,
    admin_users: 5,
    users_with_questions: 60
  }

  const mockUsers = [
    {
      id: 1,
      email: 'user@example.com',
      username: 'testuser',
      is_active: true,
      is_admin: false,
      question_count: 10,
      saved_answer_count: 5,
      last_activity: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      email: 'admin@example.com',
      username: 'adminuser',
      is_active: true,
      is_admin: true,
      question_count: 50,
      saved_answer_count: 20,
      last_activity: '2024-01-15T12:00:00Z',
      created_at: '2023-12-01T00:00:00Z'
    }
  ]

  const mockUserDetail = {
    id: 1,
    email: 'user@example.com',
    username: 'testuser',
    is_active: true,
    is_admin: false,
    question_count: 10,
    saved_answer_count: 5,
    last_activity: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    // Setup default mock responses
    bibleApi.getApiStats.mockResolvedValue(mockStats)
    bibleApi.getApiLogs.mockResolvedValue(mockLogs)
    bibleApi.getEndpointStats.mockResolvedValue(mockEndpointStats)
    bibleApi.getOpenAIStats.mockResolvedValue(mockOpenAIStats)
    bibleApi.getOpenAICalls.mockResolvedValue(mockOpenAICalls)
    bibleApi.getOpenAIUserUsage.mockResolvedValue(mockOpenAIUserUsage)
    bibleApi.getUserStats.mockResolvedValue(mockUserStats)
    bibleApi.listUsers.mockResolvedValue(mockUsers)
    bibleApi.getUserDetail.mockResolvedValue(mockUserDetail)
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(AdminDashboard, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    })
  }

  describe('Component Initialization', () => {
    it('renders the dashboard header', () => {
      wrapper = createWrapper()
      expect(wrapper.find('h1').text()).toBe('Admin Dashboard')
      expect(wrapper.find('.back-button').exists()).toBe(true)
    })

    it('loads initial data on mount', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick() // Wait for API calls

      expect(bibleApi.getApiStats).toHaveBeenCalled()
      expect(bibleApi.getApiLogs).toHaveBeenCalled()
      expect(bibleApi.getEndpointStats).toHaveBeenCalled()
    })

    it('navigates back to app when back button is clicked', async () => {
      wrapper = createWrapper()
      await wrapper.find('.back-button').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('renders all tab buttons', () => {
      wrapper = createWrapper()
      const tabs = wrapper.findAll('.tabs button')
      expect(tabs).toHaveLength(5)
      expect(tabs[0].text()).toBe('Statistics')
      expect(tabs[1].text()).toBe('API Logs')
      expect(tabs[2].text()).toBe('Endpoints')
      expect(tabs[3].text()).toBe('OpenAI Usage')
      expect(tabs[4].text()).toBe('Users')
    })
  })

  describe('Statistics Tab', () => {
    it('displays statistics correctly', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('1000') // total_requests
      expect(wrapper.text()).toContain('50') // unique_users
      expect(wrapper.text()).toContain('950') // successful_requests
    })

    it('calculates success rate correctly', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      // 950/1000 * 100 = 95.0%
      expect(wrapper.text()).toContain('95.0%')
    })

    it('handles missing stats data gracefully', async () => {
      bibleApi.getApiStats.mockResolvedValue({})
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      // Should show 0 for missing values
      const statValues = wrapper.findAll('.stat-value')
      expect(statValues.length).toBeGreaterThan(0)
    })

    it('displays error when stats fail to load', async () => {
      bibleApi.getApiStats.mockRejectedValue(new Error('Network error'))
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('Failed to load statistics')
    })
  })

  describe('API Logs Tab', () => {
    it('switches to logs tab and displays logs', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Guest') // user_id null shows as Guest
      expect(wrapper.text()).toContain('/api/ask')
      expect(wrapper.text()).toContain('POST')
    })

    it('filters logs by endpoint', async () => {
      wrapper = createWrapper()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      const endpointFilter = wrapper.find('input[placeholder="Filter by endpoint"]')
      await endpointFilter.setValue('/api/ask')
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350))

      expect(bibleApi.getApiLogs).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: '/api/ask' })
      )
    })

    it('filters logs by status code', async () => {
      wrapper = createWrapper()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      const statusFilter = wrapper.find('select')
      await statusFilter.setValue('200')
      await nextTick()

      expect(bibleApi.getApiLogs).toHaveBeenCalledWith(
        expect.objectContaining({ status_code: 200 })
      )
    })

    it('resets filters when reset button is clicked', async () => {
      wrapper = createWrapper()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      const endpointFilter = wrapper.find('input[placeholder="Filter by endpoint"]')
      await endpointFilter.setValue('/api/ask')

      const resetButton = wrapper.find('.filters button.btn-secondary')
      await resetButton.trigger('click')
      await nextTick()

      expect(endpointFilter.element.value).toBe('')
    })

    it('paginates logs correctly', async () => {
      // Create enough logs to enable pagination (need 50+ logs)
      const manyLogs = {
        logs: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          timestamp: '2024-01-15T10:30:00Z',
          user_id: i % 5 || null,
          endpoint: '/api/test',
          method: 'GET',
          status_code: 200,
          ip_address: '192.168.1.1'
        }))
      }
      bibleApi.getApiLogs.mockResolvedValue(manyLogs)

      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      // Clear previous calls and reset mock with many logs again
      bibleApi.getApiLogs.mockClear()
      bibleApi.getApiLogs.mockResolvedValue(manyLogs)

      const nextButton = wrapper.findAll('.pagination button')[1]
      await nextButton.trigger('click')
      await nextTick()

      expect(bibleApi.getApiLogs).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 50 })
      )
    })

    it('shows empty state when no logs', async () => {
      bibleApi.getApiLogs.mockResolvedValue({ logs: [] })
      wrapper = createWrapper()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('No logs found')
    })
  })

  describe('Endpoints Tab', () => {
    it('switches to endpoints tab and displays endpoint stats', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      const endpointsTab = wrapper.findAll('.tabs button')[2]
      await endpointsTab.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('/api/ask')
      expect(wrapper.text()).toContain('500') // request_count
      expect(wrapper.text()).toContain('95.5%') // success_rate
    })

    it('shows empty state when no endpoint stats', async () => {
      bibleApi.getEndpointStats.mockResolvedValue({ endpoints: [] })
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      const endpointsTab = wrapper.findAll('.tabs button')[2]
      await endpointsTab.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('No endpoint data available')
    })
  })

  describe('OpenAI Usage Tab', () => {
    it('switches to OpenAI tab and loads data', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(bibleApi.getOpenAIStats).toHaveBeenCalled()
      expect(bibleApi.getOpenAICalls).toHaveBeenCalled()
      expect(bibleApi.getOpenAIUserUsage).toHaveBeenCalled()
    })

    it('displays OpenAI stats correctly', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('500') // total_calls
      expect(wrapper.text()).toContain('1,500,000') // formatted total_tokens
      expect(wrapper.text()).toContain('3000') // avg_tokens_per_call
    })

    it('calculates OpenAI success rate correctly', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      // 475/500 * 100 = 95.0%
      expect(wrapper.text()).toContain('95.0%')
    })

    it('displays user token usage', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('150,000') // user total_tokens
    })

    it('shows recent OpenAI calls', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('What is love?')
      expect(wrapper.text()).toContain('3000') // total_tokens
    })
  })

  describe('Users Tab', () => {
    it('switches to users tab and loads user data', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(bibleApi.getUserStats).toHaveBeenCalled()
      expect(bibleApi.listUsers).toHaveBeenCalled()
    })

    it('displays user stats correctly', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('100') // total_users
      expect(wrapper.text()).toContain('85') // active_users
      expect(wrapper.text()).toContain('5') // admin_users
    })

    it('displays users list', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('user@example.com')
      expect(wrapper.text()).toContain('testuser')
      expect(wrapper.text()).toContain('admin@example.com')
    })

    it('searches users', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()

      const searchInput = wrapper.find('input[placeholder="Search by email or username"]')
      await searchInput.setValue('admin')
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350))

      expect(bibleApi.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'admin' })
      )
    })

    it('filters active users only', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()

      const activeCheckbox = wrapper.find('input[type="checkbox"]')
      await activeCheckbox.setValue(true)
      await nextTick()

      expect(bibleApi.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ active_only: true })
      )
    })

    it('views user detail when view button is clicked', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()
      await nextTick()

      const viewButton = wrapper.find('.action-buttons button[title="View Details"]')
      await viewButton.trigger('click')
      await nextTick()
      await nextTick()

      expect(bibleApi.getUserDetail).toHaveBeenCalledWith(1)
      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    })

    it('closes user detail modal', async () => {
      wrapper = createWrapper()
      await nextTick()

      const usersTab = wrapper.findAll('.tabs button')[4]
      await usersTab.trigger('click')
      await nextTick()
      await nextTick()

      const viewButton = wrapper.find('.action-buttons button[title="View Details"]')
      await viewButton.trigger('click')
      await nextTick()
      await nextTick()

      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('click')
      await nextTick()

      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('formats dates correctly', async () => {
      wrapper = createWrapper()
      await nextTick()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      // Check that timestamps are formatted (contains month abbreviation)
      const tableText = wrapper.find('.logs-table').text()
      expect(tableText).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    })

    it('handles null timestamps', async () => {
      const logsWithNull = {
        logs: [
          {
            id: 1,
            timestamp: null,
            user_id: 1,
            endpoint: '/api/test',
            method: 'GET',
            status_code: 200,
            ip_address: '127.0.0.1'
          }
        ]
      }
      bibleApi.getApiLogs.mockResolvedValue(logsWithNull)
      
      wrapper = createWrapper()
      await nextTick()

      const logsTab = wrapper.findAll('.tabs button')[1]
      await logsTab.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('N/A')
    })

    it('truncates long text correctly', async () => {
      const longQuestion = 'A'.repeat(100)
      bibleApi.getOpenAICalls.mockResolvedValue({
        calls: [{
          id: 1,
          timestamp: '2024-01-15T10:30:00Z',
          user_id: 1,
          question: longQuestion,
          total_tokens: 3000,
          response_time_ms: 2400,
          status: 'success'
        }]
      })

      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      // Should be truncated to 50 chars + '...'
      const questionCell = wrapper.find('.question-cell')
      expect(questionCell.text().length).toBeLessThan(longQuestion.length)
      expect(questionCell.text()).toContain('...')
    })

    it('formats numbers with commas', async () => {
      wrapper = createWrapper()
      await nextTick()

      const openaiTab = wrapper.findAll('.tabs button')[3]
      await openaiTab.trigger('click')
      await nextTick()
      await nextTick()

      // 1,500,000 should be formatted with commas
      expect(wrapper.text()).toContain('1,500,000')
    })
  })
})

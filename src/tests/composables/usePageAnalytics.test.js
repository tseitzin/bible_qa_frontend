import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { usePageAnalytics } from '../../composables/usePageAnalytics.js'
import { bibleApi } from '../../services/bibleApi.js'

// Mock vue-router
const mockRoute = { path: '/test-page' }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

// Mock the API
vi.mock('../../services/bibleApi.js', () => ({
  bibleApi: {
    logPageView: vi.fn(),
    updatePageMetrics: vi.fn(),
    logClickEvent: vi.fn()
  }
}))

describe('usePageAnalytics', () => {
  let originalSessionStorage

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Mock sessionStorage
    originalSessionStorage = globalThis.sessionStorage
    const sessionStore = {}
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        getItem: vi.fn((key) => sessionStore[key] ?? null),
        setItem: vi.fn((key, value) => { sessionStore[key] = String(value) }),
        removeItem: vi.fn((key) => { delete sessionStore[key] }),
        clear: vi.fn()
      },
      writable: true,
      configurable: true
    })

    // Mock document properties
    Object.defineProperty(document, 'title', { value: 'Test Page', writable: true, configurable: true })
    Object.defineProperty(document, 'referrer', { value: 'https://google.com', configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
      configurable: true
    })
  })

  it('returns expected properties and methods', () => {
    const analytics = usePageAnalytics()

    expect(analytics).toHaveProperty('setupTracking')
    expect(analytics).toHaveProperty('trackClick')
    expect(analytics).toHaveProperty('pageAnalyticsId')
    expect(analytics).toHaveProperty('maxScrollDepth')
    expect(typeof analytics.setupTracking).toBe('function')
    expect(typeof analytics.trackClick).toBe('function')
  })

  it('initializes with default values', () => {
    const { pageAnalyticsId, maxScrollDepth } = usePageAnalytics()

    expect(pageAnalyticsId.value).toBeNull()
    expect(maxScrollDepth.value).toBe(0)
  })

  it('logs page view on setupTracking', async () => {
    bibleApi.logPageView.mockResolvedValue({ page_analytics_id: 42 })

    const { setupTracking, pageAnalyticsId } = usePageAnalytics()
    const cleanup = setupTracking()

    // Flush the async logPageView call
    await flushPromises()

    expect(bibleApi.logPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        page_path: '/test-page',
        page_title: 'Test Page',
        referrer: 'https://google.com'
      })
    )
    expect(pageAnalyticsId.value).toBe(42)

    cleanup()
  })

  it('generates and reuses a session ID', async () => {
    bibleApi.logPageView.mockResolvedValue({ page_analytics_id: 1 })

    const { setupTracking } = usePageAnalytics()
    const cleanup = setupTracking()
    await flushPromises()

    // sessionStorage.setItem should have been called with the session ID
    expect(sessionStorage.getItem).toHaveBeenCalledWith('analytics_session_id')
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'analytics_session_id',
      expect.stringContaining('session_')
    )

    // The session ID should be included in the logPageView call
    expect(bibleApi.logPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: expect.stringContaining('session_')
      })
    )

    cleanup()
  })

  it('handles page view logging failure gracefully', async () => {
    bibleApi.logPageView.mockRejectedValue(new Error('API down'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { setupTracking, pageAnalyticsId } = usePageAnalytics()
    const cleanup = setupTracking()
    await flushPromises()

    expect(pageAnalyticsId.value).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to log page view:', expect.any(Error))

    consoleSpy.mockRestore()
    cleanup()
  })

  it('updates page metrics periodically', async () => {
    bibleApi.logPageView.mockResolvedValue({ page_analytics_id: 42 })
    bibleApi.updatePageMetrics.mockResolvedValue({})

    const { setupTracking } = usePageAnalytics()
    const cleanup = setupTracking()

    // Flush the page view
    await flushPromises()

    // Advance 5 seconds to trigger metrics update
    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(bibleApi.updatePageMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        page_analytics_id: 42,
        visit_duration_seconds: expect.any(Number),
        max_scroll_depth_percent: 0
      })
    )

    cleanup()
  })

  it('handles page metrics update failure gracefully', async () => {
    bibleApi.logPageView.mockResolvedValue({ page_analytics_id: 42 })
    bibleApi.updatePageMetrics.mockRejectedValue(new Error('Metrics error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { setupTracking } = usePageAnalytics()
    const cleanup = setupTracking()
    await flushPromises()

    // Trigger periodic update
    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update page metrics:', expect.any(Error))

    consoleSpy.mockRestore()
    cleanup()
  })

  it('does not update metrics when pageAnalyticsId is null', async () => {
    bibleApi.logPageView.mockResolvedValue({}) // No page_analytics_id returned

    const { setupTracking } = usePageAnalytics()
    const cleanup = setupTracking()
    await flushPromises()

    // Advance 5 seconds
    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(bibleApi.updatePageMetrics).not.toHaveBeenCalled()

    cleanup()
  })

  it('tracks button click events', async () => {
    bibleApi.logClickEvent.mockResolvedValue({})

    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'BUTTON',
        id: 'submit-btn',
        textContent: 'Submit Answer',
        className: 'btn-primary',
        isContentEditable: false,
        closest: vi.fn(() => null),
        getAttribute: vi.fn(() => null)
      },
      clientX: 100,
      clientY: 200
    }

    await trackClick(mockEvent)

    expect(bibleApi.logClickEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        page_path: '/test-page',
        element_type: 'button',
        element_id: 'submit-btn',
        element_text: 'Submit Answer',
        click_position_x: 100,
        click_position_y: 200
      })
    )
  })

  it('tracks link click events', async () => {
    bibleApi.logClickEvent.mockResolvedValue({})

    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'A',
        id: '',
        textContent: 'Go Home',
        className: 'nav-link',
        isContentEditable: false,
        closest: vi.fn(() => null),
        getAttribute: vi.fn(() => null)
      },
      clientX: 50,
      clientY: 75
    }

    await trackClick(mockEvent)

    expect(bibleApi.logClickEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        element_type: 'link',
        element_id: null,
        element_text: 'Go Home'
      })
    )
  })

  it('ignores clicks on input elements', async () => {
    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'INPUT',
        isContentEditable: false,
        closest: vi.fn(() => null)
      }
    }

    await trackClick(mockEvent)
    expect(bibleApi.logClickEvent).not.toHaveBeenCalled()
  })

  it('ignores clicks on textarea elements', async () => {
    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'TEXTAREA',
        isContentEditable: false,
        closest: vi.fn(() => null)
      }
    }

    await trackClick(mockEvent)
    expect(bibleApi.logClickEvent).not.toHaveBeenCalled()
  })

  it('ignores clicks on select elements', async () => {
    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'SELECT',
        isContentEditable: false,
        closest: vi.fn(() => null)
      }
    }

    await trackClick(mockEvent)
    expect(bibleApi.logClickEvent).not.toHaveBeenCalled()
  })

  it('uses provided elementType when given', async () => {
    bibleApi.logClickEvent.mockResolvedValue({})

    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'DIV',
        id: 'card',
        textContent: 'Card content',
        className: 'card',
        isContentEditable: false,
        closest: vi.fn(() => null),
        getAttribute: vi.fn(() => null)
      },
      clientX: 10,
      clientY: 20
    }

    await trackClick(mockEvent, 'card')

    expect(bibleApi.logClickEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        element_type: 'card'
      })
    )
  })

  it('falls back to aria-label when textContent is empty', async () => {
    bibleApi.logClickEvent.mockResolvedValue({})

    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'BUTTON',
        id: 'icon-btn',
        textContent: '',
        className: 'icon-button',
        isContentEditable: false,
        closest: vi.fn(() => null),
        getAttribute: vi.fn((attr) => {
          if (attr === 'aria-label') return 'Close dialog'
          return null
        })
      },
      clientX: 10,
      clientY: 20
    }

    await trackClick(mockEvent)

    expect(bibleApi.logClickEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        element_text: 'Close dialog'
      })
    )
  })

  it('handles click tracking failure gracefully', async () => {
    bibleApi.logClickEvent.mockRejectedValue(new Error('Click log failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { trackClick } = usePageAnalytics()

    const mockEvent = {
      target: {
        tagName: 'BUTTON',
        id: '',
        textContent: 'Click me',
        className: '',
        isContentEditable: false,
        closest: vi.fn(() => null),
        getAttribute: vi.fn(() => null)
      },
      clientX: 0,
      clientY: 0
    }

    await trackClick(mockEvent)

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log click event:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('cleanup removes event listeners and clears interval', async () => {
    bibleApi.logPageView.mockResolvedValue({ page_analytics_id: 42 })
    bibleApi.updatePageMetrics.mockResolvedValue({})

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { setupTracking } = usePageAnalytics()
    const cleanup = setupTracking()
    await flushPromises()

    cleanup()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    // Final metrics update should be called on cleanup
    expect(bibleApi.updatePageMetrics).toHaveBeenCalled()

    removeEventListenerSpy.mockRestore()
  })
})

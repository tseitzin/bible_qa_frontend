import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { bibleApi } from '../services/bibleApi.js'

// Generate a unique session ID for this browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

export function usePageAnalytics() {
  const route = useRoute()
  const pageAnalyticsId = ref(null)
  const maxScrollDepth = ref(0)
  const pageLoadTime = ref(null)
  
  // Track scroll depth
  const updateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // Calculate scroll percentage
    const scrollPercent = Math.round(
      (scrollTop / (documentHeight - windowHeight)) * 100
    )
    
    // Update max scroll depth (clamp between 0-100)
    const clampedPercent = Math.min(100, Math.max(0, scrollPercent))
    if (clampedPercent > maxScrollDepth.value) {
      maxScrollDepth.value = clampedPercent
    }
  }
  
  // Log page view to analytics
  const logPageView = async () => {
    try {
      const sessionId = getSessionId()
      const pagePath = route.path
      const pageTitle = document.title
      const referrer = document.referrer
      
      const response = await bibleApi.logPageView({
        session_id: sessionId,
        page_path: pagePath,
        page_title: pageTitle,
        referrer: referrer,
      })
      
      if (response.page_analytics_id) {
        pageAnalyticsId.value = response.page_analytics_id
      }
      
      // Record page load time
      pageLoadTime.value = Date.now()
    } catch (error) {
      console.error('Failed to log page view:', error)
    }
  }
  
  // Update page metrics (scroll depth and duration)
  const updatePageMetrics = async () => {
    if (!pageAnalyticsId.value || !pageLoadTime.value) return
    
    try {
      const durationSeconds = Math.round((Date.now() - pageLoadTime.value) / 1000)
      
      await bibleApi.updatePageMetrics({
        page_analytics_id: pageAnalyticsId.value,
        visit_duration_seconds: durationSeconds,
        max_scroll_depth_percent: maxScrollDepth.value,
      })
    } catch (error) {
      console.error('Failed to update page metrics:', error)
    }
  }
  
  // Track click events
  const trackClick = async (event, elementType = null) => {
    try {
      const target = event.target
      
      // Ignore clicks on input fields, textareas, and other form controls
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'SELECT' || 
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select')) {
        return // Don't track form input interactions
      }
      
      const sessionId = getSessionId()
      
      // Extract element details
      const elementId = target.id || null
      let elementText = target.textContent?.trim().substring(0, 100) || null
      // Convert className to string (it can be a DOMTokenList)
      const elementClass = target.className ? String(target.className) : null
      
      // Determine element type if not provided
      if (!elementType) {
        if (target.tagName === 'BUTTON') {
          elementType = 'button'
        } else if (target.tagName === 'A') {
          elementType = 'link'
        } else if (target.closest('button')) {
          elementType = 'button'
        } else if (target.closest('a')) {
          elementType = 'link'
        } else {
          elementType = target.tagName.toLowerCase()
        }
      }
      
      // If no text found, try to get better context
      if (!elementText || elementText.length === 0) {
        // Check for aria-label
        elementText = target.getAttribute('aria-label') || 
                     target.getAttribute('title') || 
                     target.getAttribute('alt') || null
        
        // If still no text and it's a button, try to get parent context
        if (!elementText && target.closest('.answer-card-header')) {
          elementText = 'Answer expand/collapse'
        } else if (!elementText && target.closest('.answer-card-actions')) {
          elementText = 'Answer action button'
        }
      }
      
      await bibleApi.logClickEvent({
        session_id: sessionId,
        page_path: route.path,
        page_analytics_id: pageAnalyticsId.value,
        element_type: elementType,
        element_id: elementId,
        element_text: elementText,
        element_class: elementClass,
        click_position_x: event.clientX,
        click_position_y: event.clientY,
      })
    } catch (error) {
      console.error('Failed to log click event:', error)
    }
  }
  
  // Setup tracking
  const setupTracking = () => {
    // Log initial page view
    logPageView()
    
    // Track scroll depth
    window.addEventListener('scroll', updateScrollDepth, { passive: true })
    updateScrollDepth() // Initial check
    
    // Update metrics periodically (every 5 seconds)
    const metricsInterval = setInterval(updatePageMetrics, 5000)
    
    // Update metrics on page unload
    const handleBeforeUnload = () => {
      updatePageMetrics()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', updateScrollDepth)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(metricsInterval)
      updatePageMetrics() // Final update
    }
  }
  
  return {
    setupTracking,
    trackClick,
    pageAnalyticsId,
    maxScrollDepth,
  }
}

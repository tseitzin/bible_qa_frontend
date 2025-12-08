import { ref, readonly } from 'vue'

// Shared reactive state - single source of truth
const isDevotion = ref(false)

// Theme constants
const THEME_KEY = 'bible_qa_theme'
const THEME_LIGHT = 'light'
const THEME_DEVOTION = 'devotion'

/**
 * Apply theme to the document
 * @param {boolean} devotionMode - Whether to enable devotion (dark) mode
 */
const applyTheme = (devotionMode) => {
  if (typeof document === 'undefined') return
  
  const theme = devotionMode ? THEME_DEVOTION : THEME_LIGHT
  document.documentElement.setAttribute('data-theme', theme)
  isDevotion.value = devotionMode
}

/**
 * Initialize theme from localStorage or system preference
 * Call this once on app startup
 */
const initTheme = () => {
  if (typeof window === 'undefined') return
  
  const savedTheme = localStorage.getItem(THEME_KEY)
  
  if (savedTheme) {
    // Use saved preference
    applyTheme(savedTheme === THEME_DEVOTION)
  } else {
    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark)
  }
}

/**
 * Toggle between light and devotion mode
 */
const toggleTheme = () => {
  if (typeof window === 'undefined') return
  
  const newValue = !isDevotion.value
  applyTheme(newValue)
  localStorage.setItem(THEME_KEY, newValue ? THEME_DEVOTION : THEME_LIGHT)
}

/**
 * Set a specific theme
 * @param {boolean} devotionMode - Whether to enable devotion (dark) mode
 */
const setTheme = (devotionMode) => {
  if (typeof window === 'undefined') return
  
  applyTheme(devotionMode)
  localStorage.setItem(THEME_KEY, devotionMode ? THEME_DEVOTION : THEME_LIGHT)
}

/**
 * Theme composable for Vue components
 * Provides reactive theme state and toggle functionality
 */
export function useTheme() {
  return {
    isDevotion: readonly(isDevotion),
    toggleTheme,
    setTheme,
    initTheme
  }
}

// Export initTheme separately for use in main.js before Vue mounts
export { initTheme }

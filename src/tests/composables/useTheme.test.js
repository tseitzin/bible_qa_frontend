import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useTheme', () => {
  let useTheme, initTheme

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    vi.clearAllMocks()

    // Reset data-theme attribute
    document.documentElement.removeAttribute('data-theme')

    // Dynamically import to get fresh module state (shared refs reset)
    const module = await import('../../composables/useTheme.js')
    useTheme = module.useTheme
    initTheme = module.initTheme
  })

  it('returns expected properties and methods', () => {
    const theme = useTheme()

    expect(theme).toHaveProperty('isDevotion')
    expect(theme).toHaveProperty('toggleTheme')
    expect(theme).toHaveProperty('setTheme')
    expect(theme).toHaveProperty('initTheme')
    expect(typeof theme.toggleTheme).toBe('function')
    expect(typeof theme.setTheme).toBe('function')
    expect(typeof theme.initTheme).toBe('function')
  })

  it('initializes isDevotion as false by default', () => {
    const { isDevotion } = useTheme()
    // Before initTheme, isDevotion starts false (module-level default)
    expect(isDevotion.value).toBe(false)
  })

  it('isDevotion is readonly', () => {
    const { isDevotion } = useTheme()

    // Attempting to set should warn (readonly ref)
    // The value should remain unchanged
    const originalValue = isDevotion.value
    isDevotion.value = !originalValue
    expect(isDevotion.value).toBe(originalValue)
  })

  it('initTheme defaults to light mode when no saved preference', () => {
    const { initTheme: init, isDevotion } = useTheme()

    init()

    expect(isDevotion.value).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('initTheme restores devotion mode from localStorage', () => {
    localStorage.setItem('bible_qa_theme', 'devotion')

    const { initTheme: init, isDevotion } = useTheme()

    init()

    expect(isDevotion.value).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('devotion')
  })

  it('initTheme restores light mode from localStorage', () => {
    localStorage.setItem('bible_qa_theme', 'light')

    const { initTheme: init, isDevotion } = useTheme()

    init()

    expect(isDevotion.value).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('toggleTheme switches from light to devotion', () => {
    const { initTheme: init, toggleTheme, isDevotion } = useTheme()

    init() // Start in light mode
    expect(isDevotion.value).toBe(false)

    toggleTheme()

    expect(isDevotion.value).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('devotion')
    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'devotion')
  })

  it('toggleTheme switches from devotion back to light', () => {
    localStorage.setItem('bible_qa_theme', 'devotion')

    const { initTheme: init, toggleTheme, isDevotion } = useTheme()

    init() // Start in devotion mode
    expect(isDevotion.value).toBe(true)

    toggleTheme()

    expect(isDevotion.value).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'light')
  })

  it('setTheme enables devotion mode', () => {
    const { initTheme: init, setTheme, isDevotion } = useTheme()

    init()
    setTheme(true)

    expect(isDevotion.value).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('devotion')
    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'devotion')
  })

  it('setTheme disables devotion mode', () => {
    localStorage.setItem('bible_qa_theme', 'devotion')

    const { initTheme: init, setTheme, isDevotion } = useTheme()

    init()
    setTheme(false)

    expect(isDevotion.value).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'light')
  })

  it('exported initTheme matches composable initTheme', () => {
    const { initTheme: composableInit } = useTheme()
    expect(initTheme).toBe(composableInit)
  })

  it('shares state across multiple useTheme calls', () => {
    const theme1 = useTheme()
    const theme2 = useTheme()

    theme1.initTheme()
    theme1.setTheme(true)

    // Both instances should reflect the shared state
    expect(theme1.isDevotion.value).toBe(true)
    expect(theme2.isDevotion.value).toBe(true)
  })

  it('toggleTheme persists preference to localStorage', () => {
    const { initTheme: init, toggleTheme } = useTheme()

    init()
    toggleTheme() // light -> devotion

    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'devotion')

    toggleTheme() // devotion -> light

    expect(localStorage.setItem).toHaveBeenCalledWith('bible_qa_theme', 'light')
  })
})

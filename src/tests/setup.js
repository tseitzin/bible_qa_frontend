import { beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock window.matchMedia (needed for theme tests)
Object.defineProperty(globalThis, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Global test setup
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

// Configure Vue Test Utils globally
config.global.stubs = {
  RouterLink: true,
  RouterView: true,
}

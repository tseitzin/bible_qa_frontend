/**
 * Unit tests for TriviaView.vue
 *
 * TriviaView is a thin phase-router that renders:
 *   - TriviaSetup   when gamePhase === 'setup'
 *   - TriviaGame    when gamePhase === 'playing'
 *   - TriviaResults when gamePhase === 'results'
 *
 * Strategy: mock useTrivia so we control gamePhase, stub all child components
 * so the view is rendered in isolation, and verify correct phase gating.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'

// ── Mock useTrivia ──────────────────────────────────────────────────────────
vi.mock('../../composables/useTrivia.js', () => ({
  useTrivia: vi.fn(),
}))

import { useTrivia } from '../../composables/useTrivia.js'
import TriviaView from '../../views/TriviaView.vue'

// ── Global component stubs (avoids network/auth/router issues) ─────────────
const GLOBAL_STUBS = {
  Navbar: { template: '<nav data-testid="navbar" />' },
  TriviaSetup: { template: '<div data-testid="trivia-setup" />' },
  TriviaGame: { template: '<div data-testid="trivia-game" />' },
  TriviaResults: { template: '<div data-testid="trivia-results" />' },
  Transition: {
    // Render slots immediately so phase-conditional content is visible
    template: '<div><slot /></div>',
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeMockTrivia(phase = 'setup', overrides = {}) {
  return {
    gamePhase: ref(phase),
    cleanup: vi.fn(),
    ...overrides,
  }
}

function mountView(phase = 'setup', overrides = {}) {
  vi.mocked(useTrivia).mockReturnValue(makeMockTrivia(phase, overrides))
  return mount(TriviaView, { global: { stubs: GLOBAL_STUBS } })
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('TriviaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Phase rendering ──────────────────────────────────────────────────────

  describe('phase-based rendering', () => {
    it('renders TriviaSetup when gamePhase is "setup"', () => {
      const wrapper = mountView('setup')
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="trivia-results"]').exists()).toBe(false)
    })

    it('renders TriviaGame when gamePhase is "playing"', () => {
      const wrapper = mountView('playing')
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="trivia-results"]').exists()).toBe(false)
    })

    it('renders TriviaResults when gamePhase is "results"', () => {
      const wrapper = mountView('results')
      expect(wrapper.find('[data-testid="trivia-results"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(false)
    })

    it('renders nothing trivia-specific for an unknown phase', () => {
      const wrapper = mountView('unknown_phase')
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="trivia-results"]').exists()).toBe(false)
    })
  })

  // ── Always-present structure ─────────────────────────────────────────────

  describe('always-present elements', () => {
    it('always renders the Navbar', () => {
      const wrapper = mountView('setup')
      expect(wrapper.find('[data-testid="navbar"]').exists()).toBe(true)
    })

    it('has the trivia-page root class', () => {
      const wrapper = mountView('setup')
      expect(wrapper.find('.trivia-page').exists()).toBe(true)
    })

    it('has the app-container', () => {
      const wrapper = mountView('setup')
      expect(wrapper.find('.app-container').exists()).toBe(true)
    })
  })

  // ── Lifecycle cleanup ────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('calls cleanup() when the component is unmounted', async () => {
      const cleanupFn = vi.fn()
      const wrapper = mountView('setup', { cleanup: cleanupFn })

      await wrapper.unmount()

      expect(cleanupFn).toHaveBeenCalledTimes(1)
    })

    it('calls useTrivia once on mount', () => {
      mountView('setup')
      expect(useTrivia).toHaveBeenCalledTimes(1)
    })
  })

  // ── Reactive phase changes ───────────────────────────────────────────────

  describe('reactive phase transitions', () => {
    it('switches from setup to playing when gamePhase ref changes', async () => {
      const gamePhase = ref('setup')
      vi.mocked(useTrivia).mockReturnValue({ gamePhase, cleanup: vi.fn() })

      const wrapper = mount(TriviaView, { global: { stubs: GLOBAL_STUBS } })
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(true)

      gamePhase.value = 'playing'
      await flushPromises()

      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="trivia-setup"]').exists()).toBe(false)
    })

    it('switches from playing to results when gamePhase ref changes', async () => {
      const gamePhase = ref('playing')
      vi.mocked(useTrivia).mockReturnValue({ gamePhase, cleanup: vi.fn() })

      const wrapper = mount(TriviaView, { global: { stubs: GLOBAL_STUBS } })
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(true)

      gamePhase.value = 'results'
      await flushPromises()

      expect(wrapper.find('[data-testid="trivia-results"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="trivia-game"]').exists()).toBe(false)
    })
  })
})

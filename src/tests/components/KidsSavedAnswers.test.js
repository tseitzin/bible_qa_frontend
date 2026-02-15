import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import KidsSavedAnswers from '../../components/kids/KidsSavedAnswers.vue'

const mockCurrentUser = ref(null)

vi.mock('../../composables/useAuth.js', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser
  })
}))

vi.mock('../../services/savedAnswersService.js', () => ({
  savedAnswersService: {
    getAll: vi.fn(),
    delete: vi.fn()
  }
}))

import { savedAnswersService } from '../../services/savedAnswersService.js'

const mockAnswers = [
  {
    id: '1',
    question: 'Who is baby Jesus?',
    answer: 'Jesus is the Son of God who came as a baby.',
    saved_at: new Date().toISOString(),
    word_count: 10,
    tags: ['jesus', 'birth']
  },
  {
    id: '2',
    question: 'Why did God make animals?',
    answer: 'God made animals because He loves creating beautiful things.',
    saved_at: new Date(Date.now() - 86400000).toISOString(),
    word_count: 9,
    tags: ['creation', 'animals']
  },
  {
    id: '3',
    question: 'What is prayer?',
    answer: 'Prayer is talking to God.',
    saved_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    word_count: 5,
    tags: ['prayer']
  }
]

describe('KidsSavedAnswers', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
    vi.clearAllMocks()
    mockCurrentUser.value = { id: 1, username: 'kiduser' }
    savedAnswersService.getAll.mockResolvedValue(mockAnswers)
    savedAnswersService.delete.mockResolvedValue({ success: true })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  const createWrapper = async () => {
    wrapper = mount(KidsSavedAnswers, {
      global: {
        stubs: {
          Transition: false,
          RouterLink: {
            template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
    await flushPromises()
    return wrapper
  }

  it('shows guest message when user is not logged in', async () => {
    mockCurrentUser.value = null
    await createWrapper()

    expect(wrapper.find('.kids-guest-message').exists()).toBe(true)
    expect(wrapper.text()).toContain('Sign In to Save Answers!')
  })

  it('shows login and register links for guest users', async () => {
    mockCurrentUser.value = null
    await createWrapper()

    expect(wrapper.find('.kids-btn-primary').exists()).toBe(true)
    expect(wrapper.find('.kids-btn-secondary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Log In')
    expect(wrapper.text()).toContain('Create Account')
  })

  it('loads saved answers on mount for authenticated user', async () => {
    await createWrapper()

    expect(savedAnswersService.getAll).toHaveBeenCalled()
  })

  it('renders the saved answers header for authenticated user', async () => {
    await createWrapper()

    expect(wrapper.find('.kids-saved-header').exists()).toBe(true)
    expect(wrapper.text()).toContain('My Saved Answers')
  })

  it('displays the count badge with correct number', async () => {
    await createWrapper()

    expect(wrapper.find('.kids-count-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('3 awesome answers!')
  })

  it('renders answer cards for each saved answer', async () => {
    await createWrapper()

    const cards = wrapper.findAll('.kids-answer-card')
    expect(cards.length).toBe(3)
  })

  it('displays question text on answer cards', async () => {
    await createWrapper()

    const questions = wrapper.findAll('.card-question')
    expect(questions[0].text()).toBe('Who is baby Jesus?')
    expect(questions[1].text()).toBe('Why did God make animals?')
  })

  it('shows empty state when no answers are saved', async () => {
    savedAnswersService.getAll.mockResolvedValueOnce([])
    await createWrapper()

    expect(wrapper.find('.kids-empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No saved answers yet!')
  })

  it('renders search input', async () => {
    await createWrapper()

    expect(wrapper.find('.kids-search-input').exists()).toBe(true)
  })

  it('filters answers based on search query', async () => {
    await createWrapper()

    const searchInput = wrapper.find('.kids-search-input')
    await searchInput.setValue('prayer')
    await flushPromises()

    const cards = wrapper.findAll('.kids-answer-card')
    expect(cards.length).toBe(1)
    expect(cards[0].text()).toContain('What is prayer?')
  })

  it('shows filtered empty state when search has no matches', async () => {
    await createWrapper()

    const searchInput = wrapper.find('.kids-search-input')
    await searchInput.setValue('nonexistent question xyz')
    await flushPromises()

    expect(wrapper.find('.kids-empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No matches found!')
  })

  it('clears search when clear button is clicked', async () => {
    await createWrapper()

    const searchInput = wrapper.find('.kids-search-input')
    await searchInput.setValue('prayer')
    await flushPromises()
    expect(wrapper.findAll('.kids-answer-card').length).toBe(1)

    const clearBtn = wrapper.find('.search-clear')
    await clearBtn.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.kids-answer-card').length).toBe(3)
  })

  it('expands an answer card when expand button is clicked', async () => {
    await createWrapper()

    const expandBtn = wrapper.find('.kids-expand-button')
    await expandBtn.trigger('click')
    await flushPromises()

    expect(wrapper.find('.card-content').exists()).toBe(true)
    expect(wrapper.find('.answer-text').text()).toContain('Jesus is the Son of God')
  })

  it('collapses an expanded card when expand button is clicked again', async () => {
    await createWrapper()

    await wrapper.find('.kids-expand-button').trigger('click')
    await flushPromises()
    expect(wrapper.vm.expandedCards.has('1')).toBe(true)

    // Click again to collapse
    await wrapper.find('.kids-expand-button').trigger('click')
    await flushPromises()
    expect(wrapper.vm.expandedCards.has('1')).toBe(false)
  })

  it('deletes an answer when delete is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    savedAnswersService.getAll
      .mockResolvedValueOnce(mockAnswers)
      .mockResolvedValueOnce(mockAnswers.slice(1))

    await createWrapper()
    expect(wrapper.findAll('.kids-answer-card').length).toBe(3)

    const deleteBtn = wrapper.find('.kids-delete-button')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(savedAnswersService.delete).toHaveBeenCalledWith('1')
    expect(wrapper.emitted('update')).toBeTruthy()
  })

  it('does not delete when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    await createWrapper()

    const deleteBtn = wrapper.find('.kids-delete-button')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(savedAnswersService.delete).not.toHaveBeenCalled()
  })

  it('exposes refresh method for parent components', async () => {
    await createWrapper()

    expect(typeof wrapper.vm.refresh).toBe('function')
    await wrapper.vm.refresh()
    expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
  })
})

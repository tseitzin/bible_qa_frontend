import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SavedAnswers from '../../components/SavedAnswers.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

vi.mock('../../services/savedAnswersService.js', () => ({
  savedAnswersService: {
    getAll: vi.fn(),
    delete: vi.fn(),
    getAllTags: vi.fn(),
    exportData: vi.fn()
  }
}))

const mockClick = vi.fn()
const originalCreateElement = document.createElement.bind(document)
const originalUrlCreate = global.URL?.createObjectURL
const originalUrlRevoke = global.URL?.revokeObjectURL

const mockAnswers = [
  {
    id: '1',
    question: 'What is love?',
    answer: 'Love is patient and kind.',
    saved_at: '2024-01-01T10:00:00.000Z',
    tags: ['love', 'relationships'],
    wordCount: 6
  },
  {
    id: '2',
    question: 'How should we pray?',
    answer: 'Jesus taught us to pray with faith.',
    saved_at: '2024-01-02T10:00:00.000Z',
    tags: ['prayer', 'jesus'],
    wordCount: 7
  },
  {
    id: '3',
    question: 'What about faith?',
    answer: 'Faith without works is dead.',
    saved_at: '2024-01-03T10:00:00.000Z',
    tags: ['faith', 'works'],
    wordCount: 5
  }
]

const mockTags = ['love', 'relationships', 'prayer', 'jesus', 'faith', 'works']

const mountComponent = async () => {
  const wrapper = mount(SavedAnswers)
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()

  savedAnswersService.getAll.mockResolvedValue(mockAnswers)
  savedAnswersService.delete.mockResolvedValue({ success: true })
  savedAnswersService.getAllTags.mockResolvedValue(mockTags)
  savedAnswersService.exportData.mockResolvedValue(JSON.stringify({ answers: mockAnswers }))

  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})

  vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
    if (String(tagName).toLowerCase() === 'a') {
      const anchor = originalCreateElement('a', options)
      anchor.click = mockClick
      return anchor
    }
    return originalCreateElement(tagName, options)
  })

  vi.spyOn(document.body, 'appendChild')
  vi.spyOn(document.body, 'removeChild')

})

afterEach(() => {
  vi.restoreAllMocks()
  mockClick.mockReset()

  if (originalUrlCreate) {
    global.URL.createObjectURL = originalUrlCreate
  } else {
    delete global.URL.createObjectURL
  }

  if (originalUrlRevoke) {
    global.URL.revokeObjectURL = originalUrlRevoke
  } else {
    delete global.URL.revokeObjectURL
  }

})

describe('SavedAnswers.vue', () => {
  it('loads saved answers on mount', async () => {
    await mountComponent()
    expect(savedAnswersService.getAll).toHaveBeenCalled()
  })

  it('renders saved answer cards after data load', async () => {
    const wrapper = await mountComponent()
    const cards = wrapper.findAll('.answer-card')
    expect(cards.length).toBe(mockAnswers.length)
  })

  it('shows empty state when no answers are stored', async () => {
    savedAnswersService.getAll.mockResolvedValueOnce([])
    const wrapper = await mountComponent()
    expect(wrapper.text()).toContain('No Saved Answers Yet')
  })

  it('filters answers using the search input', async () => {
    const wrapper = await mountComponent()
    const input = wrapper.find('input.search-input')
    await input.setValue('faith')
    await flushPromises()
    const cards = wrapper.findAll('.answer-card')
    expect(cards.length).toBe(2)
    expect(cards.some(card => card.text().toLowerCase().includes('faith'))).toBe(true)
  })

  it('shows filtered empty state when nothing matches search', async () => {
    const wrapper = await mountComponent()
    const input = wrapper.find('input.search-input')
    await input.setValue('nonexistent term')
    await flushPromises()
    expect(wrapper.text()).toContain('No Results Found')
  })

  it('clears the search query when clear button is clicked', async () => {
    const wrapper = await mountComponent()
    const input = wrapper.find('input.search-input')
    await input.setValue('love')
    await flushPromises()
    expect(wrapper.findAll('.answer-card').length).toBe(1)

    const clearButton = wrapper.find('button.search-clear')
    await clearButton.trigger('click')
    await flushPromises()

    expect(wrapper.vm.searchQuery).toBe('')
    expect(wrapper.findAll('.answer-card').length).toBe(mockAnswers.length)
  })

  it('renders tag filters and filters by selected tag', async () => {
    const wrapper = await mountComponent()
    const tagButtons = wrapper.findAll('.tags-filter .tag-button')
    expect(tagButtons.length).toBe(mockTags.length + 1)

    const faithButton = tagButtons.find(button => button.text() === 'faith')
    await faithButton.trigger('click')
    await flushPromises()
    const cards = wrapper.findAll('.answer-card')
    expect(cards.length).toBe(1)
    expect(cards[0].text()).toContain('faith')
  })

  it('expands and collapses a saved answer card', async () => {
    const wrapper = await mountComponent()
    const expandButton = wrapper.find('.answer-card .expand-button')
    await expandButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('.answer-card-content').exists()).toBe(true)

    await expandButton.trigger('click')
    await flushPromises()
    expect(wrapper.vm.expandedCards.has('1')).toBe(false)
  })

  it('requests deletion and emits an update when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    savedAnswersService.getAll
      .mockResolvedValueOnce(mockAnswers)
      .mockResolvedValueOnce(mockAnswers.slice(1))

    const wrapper = await mountComponent()
    const deleteButton = wrapper.find('.answer-card .delete-button')
    await deleteButton.trigger('click')
    await flushPromises()

    expect(savedAnswersService.delete).toHaveBeenCalledWith('1')
    expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted('update')).toBeTruthy()
  })

  it('gracefully handles failed deletions', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    savedAnswersService.delete.mockResolvedValueOnce({ success: false })

    const wrapper = await mountComponent()
    const deleteButton = wrapper.find('.answer-card .delete-button')
    await deleteButton.trigger('click')
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('opens and closes the export modal', async () => {
    const wrapper = await mountComponent()
    const exportButton = wrapper.find('button.btn--secondary')
    await exportButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('.modal').exists()).toBe(true)

    const closeButton = wrapper.find('.modal-close')
    await closeButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('downloads exported data when confirmed', async () => {
    const wrapper = await mountComponent()
    const exportButton = wrapper.find('button.btn--secondary')
    await exportButton.trigger('click')
    await flushPromises()

    const confirmButton = wrapper.find('.modal-footer .btn--primary')
    await confirmButton.trigger('click')
    await flushPromises()

    expect(savedAnswersService.exportData).toHaveBeenCalled()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })

  it('exposes a refresh method for parents to call', async () => {
    const wrapper = await mountComponent()
    await wrapper.vm.refresh()
    expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SavedAnswers from '../../components/SavedAnswers.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

// Mock the savedAnswersService
vi.mock('../../services/savedAnswersService.js', () => ({
  savedAnswersService: {
    getAll: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getAllTags: vi.fn(),
    getStats: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    getStorageInfo: vi.fn()
  }
}))

// Mock URL APIs used by export
const mockClick = vi.fn()
const originalCreateElement = document.createElement.bind(document)
const originalBodyAppendChild = document.body.appendChild.bind(document.body)
const originalBodyRemoveChild = document.body.removeChild.bind(document.body)

beforeEach(() => {
  // Reset URL mocks each test
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Only mock anchor elements for download; delegate others to real DOM
  vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
    if (String(tagName).toLowerCase() === 'a') {
      return Object.assign(originalCreateElement('a', options), {
        click: mockClick
      })
    }
    return originalCreateElement(tagName, options)
  })

  // Keep body append/remove behavior intact to avoid breaking mount
  vi.spyOn(document.body, 'appendChild').mockImplementation((node) => originalBodyAppendChild(node))
  vi.spyOn(document.body, 'removeChild').mockImplementation((node) => originalBodyRemoveChild(node))
})

describe('SavedAnswers.vue', () => {
  const mockAnswers = [
    {
      id: '1',
      question: 'What is love?',
      answer: 'Love is patient and kind...',
      timestamp: '2023-12-01T10:00:00.000Z',
      tags: ['love', 'relationships']
    },
    {
      id: '2',
      question: 'How should we pray?',
      answer: 'Jesus taught us to pray...',
      timestamp: '2023-12-02T10:00:00.000Z',
      tags: ['prayer', 'jesus']
    },
    {
      id: '3',
      question: 'What about faith?',
      answer: 'Faith without works is dead...',
      timestamp: '2023-12-03T10:00:00.000Z',
      tags: ['faith', 'works']
    }
  ]

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Default mock implementations
    savedAnswersService.getAll.mockReturnValue(mockAnswers)
    savedAnswersService.search.mockReturnValue(mockAnswers)
    savedAnswersService.delete.mockReturnValue({ success: true, message: 'Deleted successfully' })
    savedAnswersService.exportData.mockReturnValue(JSON.stringify({ answers: mockAnswers }))
    savedAnswersService.importData.mockReturnValue({ success: true, message: 'Import successful' })
    savedAnswersService.getStorageInfo.mockReturnValue({ used: 3, total: 100, remaining: 97, percentage: 3 })
    savedAnswersService.getAllTags.mockReturnValue(['love', 'relationships', 'prayer', 'jesus', 'faith', 'works'])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Mounting', () => {
    it('should render without crashing', () => {
      const wrapper = mount(SavedAnswers)
      expect(wrapper.exists()).toBe(true)
    })

    it('should load saved answers on mount', () => {
      mount(SavedAnswers)
      expect(savedAnswersService.getAll).toHaveBeenCalled()
    })

    it('should display correct number of answers', async () => {
      const wrapper = mount(SavedAnswers)
      await wrapper.vm.$nextTick()
      const answerCards = wrapper.findAll('.answer-card')
      expect(answerCards.length).toBe(3)
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no answers are saved', () => {
      savedAnswersService.getAll.mockReturnValue([])
      savedAnswersService.search.mockReturnValue([])
      
      const wrapper = mount(SavedAnswers)
      expect(wrapper.text()).toContain('No Saved Answers Yet')
    })

    it('should show empty state when search returns no results', async () => {
      savedAnswersService.search.mockReturnValue([])
      
      const wrapper = mount(SavedAnswers)
      const searchInput = wrapper.find('input.search-input')
      await searchInput.setValue('nonexistent')
      
      expect(wrapper.text()).toContain('No Results Found')
    })
  })

  describe('Search Functionality', () => {
    it('should call search service when search input changes', async () => {
      const wrapper = mount(SavedAnswers)
      const searchInput = wrapper.find('input.search-input')
      
      await searchInput.setValue('love')
      
      expect(savedAnswersService.search).toHaveBeenCalledWith('love')
    })

    it('should clear search when clear button is clicked', async () => {
      const wrapper = mount(SavedAnswers)
      const searchInput = wrapper.find('input.search-input')
      
      await searchInput.setValue('love')
      expect(wrapper.vm.searchQuery).toBe('love')
      
      const clearButton = wrapper.find('button.search-clear')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.searchQuery).toBe('')
    })
  })

  describe('Answer Card Interactions', () => {
    it('should expand answer when expand button is clicked', async () => {
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
  const firstExpand = wrapper.find('.answer-card .expand-button')
      
      expect(wrapper.vm.expandedCards.size).toBe(0)
      
  await firstExpand.trigger('click')
      
      // First item id is '1'
      expect(wrapper.vm.expandedCards.has('1')).toBe(true)
    })

    it('should collapse answer when expanded and button clicked again', async () => {
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
  const firstExpand = wrapper.find('.answer-card .expand-button')
      
  await firstExpand.trigger('click')
      expect(wrapper.vm.expandedCards.has('1')).toBe(true)
      
  await firstExpand.trigger('click')
      expect(wrapper.vm.expandedCards.has('1')).toBe(false)
    })
  })

  describe('Delete Functionality', () => {
    it('should delete answer when delete button is clicked', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
  const deleteButton = wrapper.find('.answer-card .delete-button')
      
      await deleteButton.trigger('click')
      
      expect(savedAnswersService.delete).toHaveBeenCalledWith('1')
    })

    it('should emit update event after successful deletion', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
  const deleteButton = wrapper.find('.answer-card .delete-button')
      
      await deleteButton.trigger('click')
      
      expect(wrapper.emitted('update')).toBeTruthy()
    })

    it('should refresh answers list after deletion', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      savedAnswersService.getAll.mockReturnValueOnce(mockAnswers)
        .mockReturnValueOnce(mockAnswers.slice(1)) // After deletion
      
      const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
      expect(wrapper.vm.savedAnswers.length).toBe(3)
      
      const deleteButton = wrapper.find('.answer-card .delete-button')
      await deleteButton.trigger('click')
      
      expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('Export Functionality', () => {
    it('should open export modal when export button is clicked', async () => {
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
  const exportButton = wrapper.find('.header-actions .btn.btn--secondary')
      
      await exportButton.trigger('click')
      
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should close export modal when close button is clicked', async () => {
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
      
      // Open modal
      // click export button
  const exportButton = wrapper.find('.header-actions .btn.btn--secondary')
      await exportButton.trigger('click')
      
      const closeButton = wrapper.find('.modal-close')
      await closeButton.trigger('click')
      
      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('should trigger download when export is confirmed', async () => {
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
      
  const exportButton = wrapper.find('.header-actions .btn.btn--secondary')
      await exportButton.trigger('click')
      
      const confirmButton = wrapper.find('.modal-footer button:last-child')
      await confirmButton.trigger('click')
      
      expect(savedAnswersService.exportData).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  // Optional: Accessibility basics present in component
  describe('Accessibility', () => {
    it('search input should be focusable and labeled via placeholder', () => {
      const wrapper = mount(SavedAnswers)
      const searchInput = wrapper.find('input.search-input')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toContain('Search')
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      savedAnswersService.delete.mockReturnValue({ success: false, message: 'Delete failed' })
      
  const wrapper = mount(SavedAnswers)
  await wrapper.vm.$nextTick()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const deleteButton = wrapper.find('.answer-card .delete-button')
      
      await deleteButton.trigger('click')
      
      // Should not crash and should handle the error
      expect(wrapper.exists()).toBe(true)
    })
  })
})

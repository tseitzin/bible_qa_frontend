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

    // Select all answers first (export button is disabled with no selection)
    const selectAllCheckbox = wrapper.find('.export-select-all input')
    if (selectAllCheckbox.exists()) {
      await selectAllCheckbox.setValue(true)
      await flushPromises()
    }

    const confirmButton = wrapper.find('.modal-footer .btn--primary')
    await confirmButton.trigger('click')
    await flushPromises()

    // The component generates a blob and triggers download internally
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })

  it('exposes a refresh method for parents to call', async () => {
    const wrapper = await mountComponent()
    await wrapper.vm.refresh()
    expect(savedAnswersService.getAll).toHaveBeenCalledTimes(2)
  })

  describe('Search and Filter', () => {
    it('filters answers by answer text, not just question text', async () => {
      const wrapper = await mountComponent()
      const input = wrapper.find('input.search-input')
      await input.setValue('patient')
      await flushPromises()
      const cards = wrapper.findAll('.answer-card')
      expect(cards.length).toBe(1)
      expect(cards[0].text()).toContain('What is love?')
    })

    it('combines search query and tag filter', async () => {
      const wrapper = await mountComponent()

      // First filter by tag 'faith'
      const tagButtons = wrapper.findAll('.tags-filter .tag-button')
      const faithButton = tagButtons.find(b => b.text() === 'faith')
      await faithButton.trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.answer-card').length).toBe(1)

      // Now also search for something that does not match the faith-tagged answer
      const input = wrapper.find('input.search-input')
      await input.setValue('love')
      await flushPromises()
      expect(wrapper.findAll('.answer-card').length).toBe(0)
      expect(wrapper.text()).toContain('No Results Found')
    })

    it('resets tag filter when All button is clicked', async () => {
      const wrapper = await mountComponent()
      const tagButtons = wrapper.findAll('.tags-filter .tag-button')

      // Select a specific tag first
      const prayerButton = tagButtons.find(b => b.text() === 'prayer')
      await prayerButton.trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.answer-card').length).toBe(1)

      // Click All button
      const allButton = tagButtons.find(b => b.text() === 'All')
      await allButton.trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.answer-card').length).toBe(mockAnswers.length)
    })

    it('does not render tags filter when no tags are available', async () => {
      savedAnswersService.getAllTags.mockResolvedValueOnce([])
      const wrapper = await mountComponent()
      expect(wrapper.find('.tags-filter').exists()).toBe(false)
    })

    it('handles getAllTags failure gracefully', async () => {
      savedAnswersService.getAllTags.mockRejectedValueOnce(new Error('tags error'))
      const wrapper = await mountComponent()
      expect(wrapper.find('.tags-filter').exists()).toBe(false)
    })
  })

  describe('Export Functionality', () => {
    const openExportModal = async (wrapper) => {
      const exportButton = wrapper.find('button.btn--secondary')
      await exportButton.trigger('click')
      await flushPromises()
    }

    it('export modal starts with no answers selected', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)
      expect(wrapper.find('.export-selection-count').text()).toContain('0 of 3 selected')
    })

    it('select all checkbox selects and deselects all answers', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      // Select all
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()
      expect(wrapper.find('.export-selection-count').text()).toContain('3 of 3 selected')

      // Deselect all
      await selectAllCheckbox.setValue(false)
      await flushPromises()
      expect(wrapper.find('.export-selection-count').text()).toContain('0 of 3 selected')
    })

    it('toggles individual answer selection in export modal', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      const checkboxes = wrapper.findAll('.export-answer-item input')
      expect(checkboxes.length).toBe(3)

      // Select first answer
      await checkboxes[0].setValue(true)
      await flushPromises()
      expect(wrapper.find('.export-selection-count').text()).toContain('1 of 3 selected')

      // Deselect it
      await checkboxes[0].setValue(false)
      await flushPromises()
      expect(wrapper.find('.export-selection-count').text()).toContain('0 of 3 selected')
    })

    it('export button is disabled when no answers are selected', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      const confirmButton = wrapper.find('.modal-footer .btn--primary')
      expect(confirmButton.attributes('disabled')).toBeDefined()
    })

    it('exports data as JSON format', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      // Select JSON format
      const jsonRadio = wrapper.findAll('.export-format-option input[type="radio"]')[1]
      await jsonRadio.setValue()
      await flushPromises()

      // Select all answers
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()

      // Click export
      const confirmButton = wrapper.find('.modal-footer .btn--primary')
      await confirmButton.trigger('click')
      await flushPromises()

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      const blobArg = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobArg).toBeInstanceOf(Blob)
      expect(blobArg.type).toBe('application/json')
    })

    it('exports data as text format', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      // Text format is the default, just select all and export
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()

      const confirmButton = wrapper.find('.modal-footer .btn--primary')
      await confirmButton.trigger('click')
      await flushPromises()

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      const blobArg = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobArg).toBeInstanceOf(Blob)
      expect(blobArg.type).toBe('text/plain;charset=utf-8')
    })

    it('exports data as PDF format', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      // Select PDF format
      const pdfRadio = wrapper.findAll('.export-format-option input[type="radio"]')[2]
      await pdfRadio.setValue()
      await flushPromises()

      // Select all answers
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()

      // Click export
      const confirmButton = wrapper.find('.modal-footer .btn--primary')
      await confirmButton.trigger('click')
      await flushPromises()

      // PDF uses jsPDF which calls doc.save() directly, not our blob helper
      // The modal should close after export
      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('closes modal via overlay click', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)
      expect(wrapper.find('.modal').exists()).toBe(true)

      const overlay = wrapper.find('.modal-overlay')
      await overlay.trigger('click')
      await flushPromises()
      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('closes modal via Cancel button', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)
      expect(wrapper.find('.modal').exists()).toBe(true)

      const cancelButton = wrapper.findAll('.modal-footer button').find(b => b.text().includes('Cancel'))
      await cancelButton.trigger('click')
      await flushPromises()
      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('displays export stats (total words and unique tags)', async () => {
      const wrapper = await mountComponent()
      await openExportModal(wrapper)

      // Select all
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()

      const statsSection = wrapper.find('.export-stats')
      expect(statsSection.exists()).toBe(true)
      // 3 answers selected
      expect(statsSection.text()).toContain('3')
    })

    it('does not show export button when there are no saved answers', async () => {
      savedAnswersService.getAll.mockResolvedValueOnce([])
      const wrapper = await mountComponent()
      const exportButton = wrapper.find('button.btn--secondary')
      expect(exportButton.exists()).toBe(false)
    })
  })

  describe('Expand and Card Content', () => {
    it('shows answer text inside expanded card', async () => {
      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const content = wrapper.find('.answer-card-content')
      expect(content.exists()).toBe(true)
      expect(content.text()).toContain('Love is patient and kind.')
    })

    it('shows meta info (date and word count) when expanded', async () => {
      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const meta = wrapper.find('.answer-meta')
      expect(meta.exists()).toBe(true)
      expect(meta.text()).toContain('6 words')
      // Date is formatted
      expect(meta.text()).toContain('Jan')
    })

    it('shows tags inside expanded card when answer has tags', async () => {
      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const tags = wrapper.find('.answer-tags')
      expect(tags.exists()).toBe(true)
      expect(tags.text()).toContain('love')
      expect(tags.text()).toContain('relationships')
    })

    it('shows conversation thread when answer has multiple thread entries', async () => {
      const answersWithThread = [
        {
          id: '10',
          question: 'Tell me about grace',
          answer: 'Grace is a gift.',
          saved_at: '2024-02-01T10:00:00.000Z',
          tags: [],
          conversation_thread: [
            { question: 'Tell me about grace', answer: 'Grace is a gift from God.' },
            { question: 'Can you explain more?', answer: 'Grace means unmerited favor.' }
          ]
        }
      ]
      savedAnswersService.getAll.mockResolvedValueOnce(answersWithThread)
      savedAnswersService.getAllTags.mockResolvedValueOnce([])

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      // Should show the ConversationThread component (stubbed by test-utils)
      // Also check that the meta shows message count
      const meta = wrapper.find('.answer-meta')
      expect(meta.text()).toContain('2 messages')
    })

    it('derives word count when not provided in the answer object', async () => {
      const answersWithoutWordCount = [
        {
          id: '20',
          question: 'What is hope?',
          answer: 'Hope is an anchor for the soul.',
          saved_at: '2024-03-01T10:00:00.000Z',
          tags: []
          // no wordCount property
        }
      ]
      savedAnswersService.getAll.mockResolvedValueOnce(answersWithoutWordCount)
      savedAnswersService.getAllTags.mockResolvedValueOnce([])

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const meta = wrapper.find('.answer-meta')
      // 'Hope is an anchor for the soul.' => 7 words
      expect(meta.text()).toContain('7 words')
    })
  })

  describe('Copy and Share', () => {
    it('copies answer text to clipboard and shows success state', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const copyButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Copy'))
      await copyButton.trigger('click')
      await flushPromises()

      expect(mockWriteText).toHaveBeenCalled()
      const copiedText = mockWriteText.mock.calls[0][0]
      expect(copiedText).toContain('What is love?')
      expect(copiedText).toContain('Love is patient and kind.')

      // Check success state shows 'Copied!'
      expect(wrapper.text()).toContain('Copied!')
    })

    it('falls back to copy when navigator.share is not available', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
      // Ensure share is not available
      delete navigator.share

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const shareButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Share'))
      await shareButton.trigger('click')
      await flushPromises()

      // Should fall back to clipboard copy
      expect(mockWriteText).toHaveBeenCalled()
    })

    it('uses navigator.share when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      navigator.share = mockShare

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const shareButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Share'))
      await shareButton.trigger('click')
      await flushPromises()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Bible Q&A - Saved Answer',
          text: expect.stringContaining('What is love?')
        })
      )

      // Cleanup
      delete navigator.share
    })

    it('falls back to copy when navigator.share throws non-abort error', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
      navigator.share = vi.fn().mockRejectedValue(new Error('Share failed'))

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const shareButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Share'))
      await shareButton.trigger('click')
      await flushPromises()

      expect(mockWriteText).toHaveBeenCalled()

      // Cleanup
      delete navigator.share
    })

    it('does nothing when navigator.share throws AbortError', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
      const abortError = new Error('User cancelled')
      abortError.name = 'AbortError'
      navigator.share = vi.fn().mockRejectedValue(abortError)

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const shareButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Share'))
      await shareButton.trigger('click')
      await flushPromises()

      // Should NOT fall back to copy on AbortError
      expect(mockWriteText).not.toHaveBeenCalled()

      // Cleanup
      delete navigator.share
    })

    it('handles clipboard.writeText failure gracefully', async () => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) } })

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const copyButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Copy'))
      await copyButton.trigger('click')
      await flushPromises()

      // Should not crash, error logged
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Delete', () => {
    it('does not delete when user cancels confirm dialog', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const wrapper = await mountComponent()
      const deleteButton = wrapper.find('.answer-card .delete-button')
      await deleteButton.trigger('click')
      await flushPromises()

      expect(savedAnswersService.delete).not.toHaveBeenCalled()
    })

    it('removes expanded card id from set after successful deletion', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      savedAnswersService.getAll
        .mockResolvedValueOnce(mockAnswers)
        .mockResolvedValueOnce(mockAnswers.slice(1))

      const wrapper = await mountComponent()

      // Expand card first
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()
      expect(wrapper.vm.expandedCards.has('1')).toBe(true)

      // Delete it
      const deleteButton = wrapper.find('.answer-card .delete-button')
      await deleteButton.trigger('click')
      await flushPromises()

      expect(wrapper.vm.expandedCards.has('1')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles loadSavedAnswers failure gracefully', async () => {
      savedAnswersService.getAll.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = await mountComponent()
      expect(wrapper.findAll('.answer-card').length).toBe(0)
      expect(wrapper.text()).toContain('No Saved Answers Yet')
    })

    it('handles non-array response from getAll', async () => {
      savedAnswersService.getAll.mockResolvedValueOnce(null)
      const wrapper = await mountComponent()
      expect(wrapper.findAll('.answer-card').length).toBe(0)
    })

    it('handles export failure gracefully', async () => {
      const wrapper = await mountComponent()
      const exportButton = wrapper.find('button.btn--secondary')
      await exportButton.trigger('click')
      await flushPromises()

      // Select all
      const selectAllCheckbox = wrapper.find('.export-select-all input')
      await selectAllCheckbox.setValue(true)
      await flushPromises()

      // Force URL.createObjectURL to throw
      global.URL.createObjectURL = vi.fn(() => { throw new Error('blob error') })

      const confirmButton = wrapper.find('.modal-footer .btn--primary')
      await confirmButton.trigger('click')
      await flushPromises()

      // Should not crash, error should be logged
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Saved Count Display', () => {
    it('shows saved count badge when answers exist', async () => {
      const wrapper = await mountComponent()
      const countBadge = wrapper.find('.saved-count')
      expect(countBadge.exists()).toBe(true)
      expect(countBadge.text()).toBe('3 saved')
    })

    it('does not show saved count badge when no answers', async () => {
      savedAnswersService.getAll.mockResolvedValueOnce([])
      const wrapper = await mountComponent()
      expect(wrapper.find('.saved-count').exists()).toBe(false)
    })
  })

  describe('Format Answer for Share (conversation thread)', () => {
    it('formats conversation thread with follow-up labels for copy', async () => {
      const answersWithThread = [
        {
          id: '30',
          question: 'What is mercy?',
          answer: 'Mercy is compassion.',
          saved_at: '2024-04-01T10:00:00.000Z',
          tags: [],
          conversation_thread: [
            { question: 'What is mercy?', answer: 'Mercy is compassion.' },
            { question: 'Give an example', answer: 'The Good Samaritan showed mercy.' }
          ]
        }
      ]
      savedAnswersService.getAll.mockResolvedValueOnce(answersWithThread)
      savedAnswersService.getAllTags.mockResolvedValueOnce([])

      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } })

      const wrapper = await mountComponent()
      const expandButton = wrapper.find('.answer-card .expand-button')
      await expandButton.trigger('click')
      await flushPromises()

      const copyButton = wrapper.findAll('.answer-card-actions button').find(b => b.text().includes('Copy'))
      await copyButton.trigger('click')
      await flushPromises()

      const copiedText = mockWriteText.mock.calls[0][0]
      expect(copiedText).toContain('Question: What is mercy?')
      expect(copiedText).toContain('Follow-up 1: Give an example')
      expect(copiedText).toContain('The Good Samaritan showed mercy.')
    })
  })
})

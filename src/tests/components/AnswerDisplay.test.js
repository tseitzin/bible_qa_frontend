import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerDisplay from '../../components/AnswerDisplay.vue'
import { savedAnswersService } from '../../services/savedAnswersService.js'

// Mock navigator.clipboard for copy functionality
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

describe('AnswerDisplay', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders nothing when no answer is provided', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: ''
      }
    })

    expect(wrapper.find('.answer-display').exists()).toBe(false)
  })

  it('renders answer when answer is provided', () => {
    const testAnswer = 'God is love according to 1 John 4:8'
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: testAnswer
      }
    })

    expect(wrapper.find('.answer-display').exists()).toBe(true)
    expect(wrapper.find('.answer-text').text()).toBe(testAnswer)
    expect(wrapper.find('.answer-title').text()).toBe('Biblical Answer')
  })

  it('shows action buttons', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    const buttons = wrapper.findAll('.action-button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('Copy')
    expect(buttons[1].text()).toContain('Share')
    expect(buttons[2].text()).toContain('Save')
  })

  it('copies answer to clipboard when copy button is clicked', async () => {
    const testAnswer = 'Test answer for copying'
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: testAnswer
      }
    })

    const copyButton = wrapper.findAll('.action-button')[0]
    await copyButton.trigger('click')

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testAnswer)
  })

  it('displays timestamp', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    expect(wrapper.find('.timestamp').exists()).toBe(true)
    expect(wrapper.find('.timestamp').text()).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)
  })

  it('has proper header with icon and title', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    expect(wrapper.find('.answer-icon').exists()).toBe(true)
    expect(wrapper.find('.answer-title').text()).toBe('Biblical Answer')
  })

  it('applies transition classes', () => {
    wrapper = mount(AnswerDisplay, {
      props: {
        answer: 'Test answer'
      }
    })

    // The transition wrapper should be present
    expect(wrapper.find('.answer-display').exists()).toBe(true)
  })

  describe('Bible Reference Parsing', () => {
    describe('canonicalizeBookName', () => {
      it('correctly returns the canonical name for a given book alias', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Test'
          }
        })

        const { canonicalizeBookName } = wrapper.vm

        // Test common aliases
        expect(canonicalizeBookName('Gen')).toBe('Genesis')
        expect(canonicalizeBookName('Gen.')).toBe('Genesis')
        expect(canonicalizeBookName('Exod')).toBe('Exodus')
        expect(canonicalizeBookName('1 Sam')).toBe('1 Samuel')
        expect(canonicalizeBookName('1Sam')).toBe('1 Samuel')
        expect(canonicalizeBookName('Matt')).toBe('Matthew')
        expect(canonicalizeBookName('Rev')).toBe('Revelation')
        expect(canonicalizeBookName('1 Cor')).toBe('1 Corinthians')
        expect(canonicalizeBookName('Ps')).toBe('Psalm')
      })

      it('handles various casing and punctuation for book names', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Test'
          }
        })

        const { canonicalizeBookName } = wrapper.vm

        // Test different casing
        expect(canonicalizeBookName('genesis')).toBe('Genesis')
        expect(canonicalizeBookName('GENESIS')).toBe('Genesis')
        expect(canonicalizeBookName('GeNeSiS')).toBe('Genesis')
        expect(canonicalizeBookName('gen')).toBe('Genesis')
        expect(canonicalizeBookName('GEN')).toBe('Genesis')

        // Test with and without periods
        expect(canonicalizeBookName('Gen.')).toBe('Genesis')
        expect(canonicalizeBookName('Gen')).toBe('Genesis')
        expect(canonicalizeBookName('gen.')).toBe('Genesis')
        expect(canonicalizeBookName('gen')).toBe('Genesis')

        // Test with spaces
        expect(canonicalizeBookName('1 john')).toBe('1 John')
        expect(canonicalizeBookName('1JOHN')).toBe('1 John')
        expect(canonicalizeBookName('1 John')).toBe('1 John')

        // Test spacing normalization (extra whitespace)
        expect(canonicalizeBookName('1  Samuel')).toBe('1 Samuel')
        expect(canonicalizeBookName('  Genesis  ')).toBe('Genesis')
      })

      it('returns null for invalid book names', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Test'
          }
        })

        const { canonicalizeBookName } = wrapper.vm

        expect(canonicalizeBookName('InvalidBook')).toBe(null)
        expect(canonicalizeBookName('XYZ')).toBe(null)
        expect(canonicalizeBookName('')).toBe(null)
        expect(canonicalizeBookName(null)).toBe(null)
        expect(canonicalizeBookName('   ')).toBe(null)
      })

      it('handles canonical names correctly', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Test'
          }
        })

        const { canonicalizeBookName } = wrapper.vm

        // Canonical names should return themselves
        expect(canonicalizeBookName('Genesis')).toBe('Genesis')
        expect(canonicalizeBookName('Exodus')).toBe('Exodus')
        expect(canonicalizeBookName('Matthew')).toBe('Matthew')
        expect(canonicalizeBookName('Revelation')).toBe('Revelation')
        expect(canonicalizeBookName('1 John')).toBe('1 John')
      })
    })

    describe('createSegments', () => {
      it('correctly identifies Bible references using canonical names', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'According to Genesis 1:1, in the beginning God created the heavens.'
          }
        })

        const segments = wrapper.vm.answerSegments
        
        // Should have 3 segments: text before, reference, text after
        expect(segments.length).toBeGreaterThanOrEqual(3)
        
        // Find the reference segment
        const referenceSegment = segments.find(s => s.type === 'reference')
        expect(referenceSegment).toBeDefined()
        expect(referenceSegment.display).toBe('Genesis 1:1')
        expect(referenceSegment.book).toBe('Genesis')
      })

      it('correctly identifies Bible references using aliases', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'As Gen 1:1 states, and Matt 5:3 confirms.'
          }
        })

        const segments = wrapper.vm.answerSegments
        
        // Find all reference segments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        expect(referenceSegments.length).toBe(2)
        
        // First reference (Gen 1:1)
        expect(referenceSegments[0].display).toBe('Gen 1:1')
        expect(referenceSegments[0].book).toBe('Genesis')
        
        // Second reference (Matt 5:3)
        expect(referenceSegments[1].display).toBe('Matt 5:3')
        expect(referenceSegments[1].book).toBe('Matthew')
      })

      it('correctly identifies continuation references following an alias', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'See Gen 1:1, 2, and 3 for more details.'
          }
        })

        const segments = wrapper.vm.answerSegments
        
        // Find all reference segments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        
        // Should have multiple reference segments for the continuation
        expect(referenceSegments.length).toBeGreaterThanOrEqual(3)
        
        // First reference
        expect(referenceSegments[0].display).toBe('Gen 1:1')
        expect(referenceSegments[0].book).toBe('Genesis')
        
        // Continuation references should also be to Genesis
        expect(referenceSegments[1].book).toBe('Genesis')
        expect(referenceSegments[2].book).toBe('Genesis')
      })

      it('correctly identifies continuation references with semicolons', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Read John 3:16; 14:6; and 1:1.'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        
        // Should identify all three references
        expect(referenceSegments.length).toBeGreaterThanOrEqual(3)
        
        // All should be in the book of John
        referenceSegments.forEach(segment => {
          expect(segment.book).toBe('John')
        })
      })

      it('correctly identifies chapter-only references', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Genesis 1 describes creation.'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegment = segments.find(s => s.type === 'reference')
        
        expect(referenceSegment).toBeDefined()
        expect(referenceSegment.display).toBe('Genesis 1')
        expect(referenceSegment.book).toBe('Genesis')
        expect(referenceSegment.chapterReference).toBe(true)
      })

      it('handles multiple references in one text', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'See Genesis 1:1 and Revelation 22:21 for beginning and end.'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        
        expect(referenceSegments.length).toBe(2)
        expect(referenceSegments[0].book).toBe('Genesis')
        expect(referenceSegments[1].book).toBe('Revelation')
      })

      it('does not create reference segments for invalid patterns', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Genesis alone without numbers or John with letters.'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        
        // Should not identify references without chapter/verse numbers
        expect(referenceSegments.length).toBe(0)
      })

      it('returns plain text segment when no references exist', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'This is just plain text with no Bible references.'
          }
        })

        const segments = wrapper.vm.answerSegments
        
        expect(segments.length).toBe(1)
        expect(segments[0].type).toBe('text')
        expect(segments[0].text).toBe('This is just plain text with no Bible references.')
      })
    })

    describe('bookPattern regex', () => {
      it('is correctly generated to include all book names and their aliases', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Test'
          }
        })

        // Test various book names and aliases are matched
        const testCases = [
          { text: 'Genesis 1:1', expectedBook: 'Genesis' },
          { text: 'Gen 1:1', expectedBook: 'Genesis' },
          { text: 'Gen. 1:1', expectedBook: 'Genesis' },
          { text: 'Exodus 20:1', expectedBook: 'Exodus' },
          { text: 'Exod 20:1', expectedBook: 'Exodus' },
          { text: 'Ex 20:1', expectedBook: 'Exodus' },
          { text: 'Matthew 5:3', expectedBook: 'Matthew' },
          { text: 'Matt 5:3', expectedBook: 'Matthew' },
          { text: 'Mt 5:3', expectedBook: 'Matthew' },
          { text: '1 John 4:8', expectedBook: '1 John' },
          { text: '1 Jn 4:8', expectedBook: '1 John' },
          { text: 'Revelation 22:21', expectedBook: 'Revelation' },
          { text: 'Rev 22:21', expectedBook: 'Revelation' },
          { text: 'Song of Solomon 1:1', expectedBook: 'Song of Solomon' },
          { text: 'Song 1:1', expectedBook: 'Song of Solomon' },
        ]

        testCases.forEach(({ text, expectedBook }) => {
          const testWrapper = mount(AnswerDisplay, {
            props: {
              answer: text
            }
          })

          const segments = testWrapper.vm.answerSegments
          const referenceSegment = segments.find(s => s.type === 'reference')
          
          expect(referenceSegment).toBeDefined()
          expect(referenceSegment.book).toBe(expectedBook)
          
          testWrapper.unmount()
        })
      })

      it('is sorted by length for proper matching (longer names first)', () => {
        // This ensures "1 John" is matched before "John", etc.
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: '1 John 4:8 and John 3:16'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegments = segments.filter(s => s.type === 'reference')
        
        expect(referenceSegments.length).toBe(2)
        
        // First reference should be "1 John" not just "John"
        expect(referenceSegments[0].book).toBe('1 John')
        expect(referenceSegments[0].display).toBe('1 John 4:8')
        
        // Second reference should be "John"
        expect(referenceSegments[1].book).toBe('John')
        expect(referenceSegments[1].display).toBe('John 3:16')
      })

      it('correctly matches multi-word book names', () => {
        wrapper = mount(AnswerDisplay, {
          props: {
            answer: 'Song of Solomon 1:1 is beautiful'
          }
        })

        const segments = wrapper.vm.answerSegments
        const referenceSegment = segments.find(s => s.type === 'reference')
        
        expect(referenceSegment).toBeDefined()
        expect(referenceSegment.book).toBe('Song of Solomon')
        expect(referenceSegment.display).toBe('Song of Solomon 1:1')
      })

      it('handles books with numbers correctly', () => {
        const testCases = [
          { text: '1 Samuel 1:1', expectedBook: '1 Samuel' },
          { text: '2 Samuel 1:1', expectedBook: '2 Samuel' },
          { text: '1 Kings 1:1', expectedBook: '1 Kings' },
          { text: '2 Kings 1:1', expectedBook: '2 Kings' },
          { text: '1 Chronicles 1:1', expectedBook: '1 Chronicles' },
          { text: '2 Chronicles 1:1', expectedBook: '2 Chronicles' },
          { text: '1 Corinthians 1:1', expectedBook: '1 Corinthians' },
          { text: '2 Corinthians 1:1', expectedBook: '2 Corinthians' },
          { text: '1 Thessalonians 1:1', expectedBook: '1 Thessalonians' },
          { text: '2 Thessalonians 1:1', expectedBook: '2 Thessalonians' },
          { text: '1 Timothy 1:1', expectedBook: '1 Timothy' },
          { text: '2 Timothy 1:1', expectedBook: '2 Timothy' },
          { text: '1 Peter 1:1', expectedBook: '1 Peter' },
          { text: '2 Peter 1:1', expectedBook: '2 Peter' },
          { text: '1 John 1:1', expectedBook: '1 John' },
          { text: '2 John 1:1', expectedBook: '2 John' },
          { text: '3 John 1:1', expectedBook: '3 John' },
        ]

        testCases.forEach(({ text, expectedBook }) => {
          const testWrapper = mount(AnswerDisplay, {
            props: {
              answer: text
            }
          })

          const segments = testWrapper.vm.answerSegments
          const referenceSegment = segments.find(s => s.type === 'reference')
          
          expect(referenceSegment).toBeDefined()
          expect(referenceSegment.book).toBe(expectedBook)
          
          testWrapper.unmount()
        })
      })
    })
  })

  describe('Save Functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Spy on the actual service method instead of mocking the module
      vi.spyOn(savedAnswersService, 'save').mockReturnValue({ 
        success: true, 
        id: 'test-id', 
        message: 'Answer saved successfully!' 
      })
    })

    it('should call savedAnswersService when save button is clicked', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      // Wait for component to be fully mounted
      await wrapper.vm.$nextTick()

      // Find the save button specifically by its text content
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      await saveButton.trigger('click')
      
      // Wait for the async method to complete
      await wrapper.vm.$nextTick()
      
      // Add a small delay to ensure the method completes
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(savedAnswersService.save).toHaveBeenCalledWith('What is love?', 'Test biblical answer')
    })

    it('should show success feedback after saving', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.vm.saveSuccess).toBe(true)
      expect(wrapper.vm.saveMessage).toBe('Answer saved successfully!')
    })

    it('should handle save errors gracefully', async () => {
      savedAnswersService.save.mockReturnValue({ 
        success: false, 
        message: 'Storage limit reached' 
      })

      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.vm.saveSuccess).toBe(false)
      expect(wrapper.vm.saveMessage).toBe('Storage limit reached')
    })

    it('should emit answerSaved event after successful save', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.emitted('answerSaved')).toBeTruthy()
      expect(wrapper.emitted('answerSaved')[0]).toEqual(['test-id'])
    })

    it('should reset save feedback after timeout', async () => {
      vi.useFakeTimers()

      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      
      // Need to advance past the initial async delay in the saveAnswer method
      vi.advanceTimersByTime(1)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.saveSuccess).toBe(true)

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.saveSuccess).toBe(null)
      expect(wrapper.vm.saveMessage).toBe('')

      vi.useRealTimers()
    })

    it('should disable save button while saving', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      // Initially enabled
      expect(saveButton.element.disabled).toBe(false)

      // Click to save
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Should be disabled during save process
      expect(saveButton.element.disabled).toBe(true)
    })

    it('should handle missing question prop', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer'
          // question prop is missing
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(savedAnswersService.save).toHaveBeenCalledWith('', 'Test biblical answer')
    })

    it('should display save status in button text', async () => {
      const wrapper = mount(AnswerDisplay, {
        props: {
          answer: 'Test biblical answer',
          question: 'What is love?'
        }
      })

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save'))
      
      // Initially shows "Save Answer"
      expect(saveButton.text()).toContain('Save')
      
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      // After successful save, should show success indication
      expect(wrapper.vm.saveSuccess).toBe(true)
    })
  })
})

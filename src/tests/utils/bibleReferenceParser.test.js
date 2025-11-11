import { describe, it, expect } from 'vitest'
import { canonicalizeBookName, createSegments, bookPattern } from '../../utils/bibleReferenceParser.js'

describe('Bible Reference Parser', () => {
  describe('canonicalizeBookName', () => {
    it('correctly returns the canonical name for a given book alias', () => {
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
      expect(canonicalizeBookName('InvalidBook')).toBe(null)
      expect(canonicalizeBookName('XYZ')).toBe(null)
      expect(canonicalizeBookName('')).toBe(null)
      expect(canonicalizeBookName(null)).toBe(null)
      expect(canonicalizeBookName('   ')).toBe(null)
    })

    it('handles canonical names correctly', () => {
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
      const segments = createSegments('According to Genesis 1:1, in the beginning God created the heavens.')
      
      // Should have 3 segments: text before, reference, text after
      expect(segments.length).toBeGreaterThanOrEqual(3)
      
      // Find the reference segment
      const referenceSegment = segments.find(s => s.type === 'reference')
      expect(referenceSegment).toBeDefined()
      expect(referenceSegment.display).toBe('Genesis 1:1')
      expect(referenceSegment.book).toBe('Genesis')
    })

    it('correctly identifies Bible references using both canonical names and aliases', () => {
      const segments = createSegments('As Gen 1:1 states, and Matt 5:3 confirms.')
      
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
      const segments = createSegments('See Gen 1:1, 2, and 3 for more details.')
      
      // Find all reference segments
      const referenceSegments = segments.filter(s => s.type === 'reference')
      
      // Should have reference segments for the continuation
      expect(referenceSegments.length).toBeGreaterThanOrEqual(2)
      
      // First reference
      expect(referenceSegments[0].display).toBe('Gen 1:1')
      expect(referenceSegments[0].book).toBe('Genesis')
      
      // Continuation references should also be to Genesis
      referenceSegments.slice(1).forEach(segment => {
        expect(segment.book).toBe('Genesis')
      })
    })

    it('correctly identifies continuation references with semicolons', () => {
      const segments = createSegments('Read John 3:16; 14:6; and 1:1.')
      const referenceSegments = segments.filter(s => s.type === 'reference')
      
      // Should identify all three references
      expect(referenceSegments.length).toBeGreaterThanOrEqual(3)
      
      // All should be in the book of John
      referenceSegments.forEach(segment => {
        expect(segment.book).toBe('John')
      })
    })

    it('correctly identifies chapter-only references', () => {
      const segments = createSegments('Genesis 1 describes creation.')
      const referenceSegment = segments.find(s => s.type === 'reference')
      
      expect(referenceSegment).toBeDefined()
      expect(referenceSegment.display).toBe('Genesis 1')
      expect(referenceSegment.book).toBe('Genesis')
      expect(referenceSegment.chapterReference).toBe(true)
    })

    it('handles multiple references in one text', () => {
      const segments = createSegments('See Genesis 1:1 and Revelation 22:21 for beginning and end.')
      const referenceSegments = segments.filter(s => s.type === 'reference')
      
      expect(referenceSegments.length).toBe(2)
      expect(referenceSegments[0].book).toBe('Genesis')
      expect(referenceSegments[1].book).toBe('Revelation')
    })

    it('does not create reference segments for invalid patterns', () => {
      const segments = createSegments('Genesis alone without numbers or John with letters.')
      const referenceSegments = segments.filter(s => s.type === 'reference')
      
      // Should not identify references without chapter/verse numbers
      expect(referenceSegments.length).toBe(0)
    })

    it('returns plain text segment when no references exist', () => {
      const segments = createSegments('This is just plain text with no Bible references.')
      
      expect(segments.length).toBe(1)
      expect(segments[0].type).toBe('text')
      expect(segments[0].text).toBe('This is just plain text with no Bible references.')
    })
  })

  describe('bookPattern regex', () => {
    it('is correctly generated to include all book names and their aliases', () => {
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
        const segments = createSegments(text)
        const referenceSegment = segments.find(s => s.type === 'reference')
        
        expect(referenceSegment).toBeDefined()
        expect(referenceSegment.book).toBe(expectedBook)
      })
    })

    it('is sorted by length for proper matching (longer names first)', () => {
      // This ensures "1 John" is matched before "John", etc.
      const segments = createSegments('1 John 4:8 and John 3:16')
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
      const segments = createSegments('Song of Solomon 1:1 is beautiful')
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
        const segments = createSegments(text)
        const referenceSegment = segments.find(s => s.type === 'reference')
        
        expect(referenceSegment).toBeDefined()
        expect(referenceSegment.book).toBe(expectedBook)
      })
    })

    it('bookPattern includes expected book names', () => {
      // Verify bookPattern is a non-empty string
      expect(bookPattern).toBeTruthy()
      expect(typeof bookPattern).toBe('string')
      
      // Check that it includes some key book names (escaped and with flexible spacing)
      expect(bookPattern).toContain('Genesis')
      expect(bookPattern).toContain('Revelation')
      expect(bookPattern).toContain('1\\s+John')  // "1 John" with flexible spacing (single escape in the pattern)
      expect(bookPattern).toContain('Song\\s+of\\s+Solomon')  // Multi-word book (single escape in the pattern)
    })
  })
})

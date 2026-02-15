import { describe, it, expect } from 'vitest'
import { parseReference, isChapterOnlyReference } from '../../utils/referenceParser.js'

describe('referenceParser', () => {
  describe('parseReference', () => {
    it('parses a full chapter:verse reference', () => {
      const result = parseReference('John 3:16')
      expect(result).toEqual({
        reference: 'John 3:16',
        book: 'John',
        chapter: 3,
        startVerse: 16,
        endVerse: 16,
      })
    })

    it('parses a verse range reference', () => {
      const result = parseReference('Romans 8:28-30')
      expect(result).toEqual({
        reference: 'Romans 8:28-30',
        book: 'Romans',
        chapter: 8,
        startVerse: 28,
        endVerse: 30,
      })
    })

    it('parses a chapter-only reference with no verse', () => {
      const result = parseReference('Genesis 1')
      expect(result).toEqual({
        reference: 'Genesis 1',
        book: 'Genesis',
        chapter: 1,
        startVerse: null,
        endVerse: null,
      })
    })

    it('parses numbered book names like 1 John', () => {
      const result = parseReference('1 John 4:8')
      expect(result).toEqual({
        reference: '1 John 4:8',
        book: '1 John',
        chapter: 4,
        startVerse: 8,
        endVerse: 8,
      })
    })

    it('parses 2-word numbered books with flexible spacing', () => {
      const result = parseReference('2  Corinthians 5:17')
      expect(result).toEqual({
        reference: '2  Corinthians 5:17',
        book: '2 Corinthians',
        chapter: 5,
        startVerse: 17,
        endVerse: 17,
      })
    })

    it('normalizes en-dash (\u2013) to hyphen in verse ranges', () => {
      const result = parseReference('Psalm 23:1\u20136')
      expect(result).toEqual({
        reference: 'Psalm 23:1-6',
        book: 'Psalm',
        chapter: 23,
        startVerse: 1,
        endVerse: 6,
      })
    })

    it('normalizes em-dash (\u2014) to hyphen in verse ranges', () => {
      const result = parseReference('Psalm 23:1\u20146')
      expect(result).toEqual({
        reference: 'Psalm 23:1-6',
        book: 'Psalm',
        chapter: 23,
        startVerse: 1,
        endVerse: 6,
      })
    })

    it('trims leading and trailing whitespace', () => {
      const result = parseReference('   Matthew 5:3   ')
      expect(result).toEqual({
        reference: 'Matthew 5:3',
        book: 'Matthew',
        chapter: 5,
        startVerse: 3,
        endVerse: 3,
      })
    })

    it('returns null for non-string inputs', () => {
      expect(parseReference(null)).toBeNull()
      expect(parseReference(undefined)).toBeNull()
      expect(parseReference(42)).toBeNull()
      expect(parseReference({})).toBeNull()
      expect(parseReference([])).toBeNull()
      expect(parseReference(true)).toBeNull()
    })

    it('returns null for empty or whitespace-only strings', () => {
      expect(parseReference('')).toBeNull()
      expect(parseReference('   ')).toBeNull()
      expect(parseReference('\t')).toBeNull()
    })

    it('returns null for strings that do not match the passage pattern', () => {
      expect(parseReference('hello world')).toBeNull()
      expect(parseReference('just some text')).toBeNull()
      expect(parseReference('12345')).toBeNull()
      expect(parseReference('John')).toBeNull()
      expect(parseReference(':16')).toBeNull()
    })

    it('sets endVerse equal to startVerse when no range is given', () => {
      const result = parseReference('Acts 2:38')
      expect(result.startVerse).toBe(38)
      expect(result.endVerse).toBe(38)
    })

    it('handles 3-prefixed numbered books', () => {
      const result = parseReference('3 John 1:4')
      expect(result).toEqual({
        reference: '3 John 1:4',
        book: '3 John',
        chapter: 1,
        startVerse: 4,
        endVerse: 4,
      })
    })
  })

  describe('isChapterOnlyReference', () => {
    it('returns true for a chapter-only reference', () => {
      expect(isChapterOnlyReference('Genesis 1')).toBe(true)
      expect(isChapterOnlyReference('Revelation 22')).toBe(true)
    })

    it('returns false for a reference with verses', () => {
      expect(isChapterOnlyReference('John 3:16')).toBe(false)
      expect(isChapterOnlyReference('Romans 8:28-30')).toBe(false)
    })

    it('returns false for non-string inputs', () => {
      expect(isChapterOnlyReference(null)).toBe(false)
      expect(isChapterOnlyReference(undefined)).toBe(false)
      expect(isChapterOnlyReference(42)).toBe(false)
      expect(isChapterOnlyReference({})).toBe(false)
    })

    it('returns false for invalid reference strings', () => {
      expect(isChapterOnlyReference('')).toBe(false)
      expect(isChapterOnlyReference('not a reference')).toBe(false)
      expect(isChapterOnlyReference('   ')).toBe(false)
    })
  })
})

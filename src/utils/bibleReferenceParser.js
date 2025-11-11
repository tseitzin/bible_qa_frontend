import { BIBLE_BOOKS, BIBLE_BOOK_ALIASES } from '../constants/bibleBooks.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const bookNamesSet = new Set()
const BOOK_CANONICAL_MAP = new Map()

const registerBookName = (name, canonical) => {
  if (!name || !canonical) {
    return
  }

  const normalizedName = name.replace(/\s+/g, ' ').trim()
  if (!normalizedName) {
    return
  }

  const canonicalName = canonical.replace(/\s+/g, ' ').trim()
  bookNamesSet.add(normalizedName)

  const variants = new Set([
    normalizedName.toLowerCase(),
    normalizedName.replace(/\./g, '').toLowerCase(),
    normalizedName.replace(/[\s.]/g, '').toLowerCase(),
  ])

  variants.forEach((key) => {
    if (!BOOK_CANONICAL_MAP.has(key)) {
      BOOK_CANONICAL_MAP.set(key, canonicalName)
    }
  })
}

// Initialize the book name mapping
BIBLE_BOOKS.forEach((book) => registerBookName(book, book))
Object.entries(BIBLE_BOOK_ALIASES).forEach(([canonical, aliases]) => {
  registerBookName(canonical, canonical)
  aliases.forEach((alias) => registerBookName(alias, canonical))
})

export const bookPattern = Array.from(bookNamesSet)
  .sort((a, b) => b.length - a.length)
  .map((book) => escapeRegex(book).replace(/\s+/g, '\\s+'))
  .join('|')

export const referenceRegex = new RegExp(
  `\\b(${bookPattern})\\s+\\d{1,3}(?::\\d{1,3})?(?:[-–—]\\d{1,3}(?::\\d{1,3})?)?`,
  'gi'
)

export const canonicalizeBookName = (book) => {
  if (!book) {
    return null
  }

  const normalized = book.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return null
  }

  const keys = [
    normalized.toLowerCase(),
    normalized.replace(/\./g, '').toLowerCase(),
    normalized.replace(/[\s.]/g, '').toLowerCase(),
  ]

  for (const key of keys) {
    if (BOOK_CANONICAL_MAP.has(key)) {
      return BOOK_CANONICAL_MAP.get(key)
    }
  }

  return null
}

const continuationRegex = /^(\s*[;,]\s*(?:and\s+)?)(\d{1,3}(?::\d{1,3})?(?:[-–—]\d{1,3}(?::\d{1,3})?)?)(?!\s*[A-Za-z])/

const normalizeRangeValue = (value) => value.replace(/\s+/g, '').replace(/[–—]/g, '-')

const parseChapterRange = (chapterPart, fallbackChapter) => {
  const trimmed = (chapterPart ?? '').trim()
  if (!trimmed) {
    if (!Number.isInteger(fallbackChapter)) {
      return null
    }

    const chapterNumber = fallbackChapter
    return {
      chapters: [chapterNumber],
      startChapter: chapterNumber,
      endChapter: chapterNumber,
      displayLabel: `${chapterNumber}`,
      normalizedSpec: `${chapterNumber}`,
      usedFallback: true,
    }
  }

  const normalized = normalizeRangeValue(trimmed)
  const parts = normalized.split('-')

  if (parts.length > 2) {
    return null
  }

  const values = parts.map((part) => Number.parseInt(part, 10))
  if (values.some((num) => !Number.isInteger(num) || num <= 0)) {
    return null
  }

  if (values.length === 1) {
    const chapterNumber = values[0]
    return {
      chapters: [chapterNumber],
      startChapter: chapterNumber,
      endChapter: chapterNumber,
      displayLabel: trimmed,
      normalizedSpec: normalized,
      usedFallback: false,
    }
  }

  const [startChapter, endChapter] = values
  if (endChapter < startChapter) {
    return null
  }

  const chapters = []
  for (let current = startChapter; current <= endChapter; current += 1) {
    chapters.push(current)
  }

  return {
    chapters,
    startChapter,
    endChapter,
    displayLabel: trimmed,
    normalizedSpec: normalized,
    usedFallback: false,
  }
}

const parseVerseDescriptor = (value, defaultChapter) => {
  if (!value) {
    return null
  }

  if (value.includes(':')) {
    const [chapterPart, versePart] = value.split(':')
    const chapter = Number.parseInt(chapterPart, 10)
    const verse = Number.parseInt(versePart, 10)
    if (!Number.isInteger(chapter) || !Number.isInteger(verse) || chapter <= 0 || verse <= 0) {
      return null
    }
    return { chapter, verse }
  }

  const verse = Number.parseInt(value, 10)
  if (!Number.isInteger(verse) || verse <= 0 || !Number.isInteger(defaultChapter)) {
    return null
  }

  return { chapter: defaultChapter, verse }
}

const parseVerseRange = (versePart, startChapter) => {
  const trimmed = (versePart ?? '').trim()
  if (!trimmed) {
    return { type: 'none' }
  }

  const normalized = normalizeRangeValue(trimmed)
  const parts = normalized.split('-')

  if (parts.length > 2) {
    return null
  }

  const start = parseVerseDescriptor(parts[0], startChapter)
  if (!start) {
    return null
  }

  if (parts.length === 1) {
    return {
      type: 'single',
      points: [start],
      normalizedSpec: normalized,
      displaySpec: trimmed,
      start,
      end: start,
    }
  }

  const end = parseVerseDescriptor(parts[1], start.chapter)
  if (!end) {
    return null
  }

  if (end.chapter < start.chapter || (end.chapter === start.chapter && end.verse < start.verse)) {
    return null
  }

  if (start.chapter === end.chapter) {
    const points = []
    for (let verse = start.verse; verse <= end.verse; verse += 1) {
      points.push({ chapter: start.chapter, verse })
    }

    return {
      type: 'singleChapterRange',
      points,
      normalizedSpec: normalized,
      displaySpec: trimmed,
      start,
      end,
    }
  }

  return {
    type: 'multiChapterRange',
    points: [start, end],
    normalizedSpec: normalized,
    displaySpec: trimmed,
    start,
    end,
  }
}

const MAX_CHAPTER_SNIPPETS = 3

const buildReferenceSegment = ({ book, chapterPart, versePart, display, fallbackChapter }) => {
  const normalizedBook = book.replace(/\s+/g, ' ').trim()
  if (!normalizedBook) {
    return null
  }

  const chapterInfo = parseChapterRange(chapterPart, fallbackChapter)
  if (!chapterInfo) {
    return null
  }

  const hasVerseSpec = Boolean(versePart && versePart.trim())
  const chapterReference = !hasVerseSpec

  let fetchRefs = []
  let truncatedChapters = false
  let rangeNote = null
  let verseSpecNormalized = 'chapter'
  let verseDisplaySpec = ''
  let lastChapter = chapterInfo.endChapter

  if (chapterReference) {
    const limitedChapters = chapterInfo.chapters.slice(0, MAX_CHAPTER_SNIPPETS)
    fetchRefs = limitedChapters.map((chapterNumber) => ({
      reference: `${normalizedBook} ${chapterNumber}:1`,
      chapter: chapterNumber,
      verse: 1,
      chapterOnly: true,
    }))

    truncatedChapters = limitedChapters.length < chapterInfo.chapters.length
  } else {
    const verseInfo = parseVerseRange(versePart, chapterInfo.startChapter)
    if (!verseInfo || verseInfo.type === 'none') {
      return null
    }

    verseSpecNormalized = verseInfo.normalizedSpec
    verseDisplaySpec = verseInfo.displaySpec

    if (verseInfo.type === 'single' || verseInfo.type === 'singleChapterRange') {
      fetchRefs = verseInfo.points.map((point) => ({
        reference: `${normalizedBook} ${point.chapter}:${point.verse}`,
        chapter: point.chapter,
        verse: point.verse,
      }))
      lastChapter = verseInfo.end.chapter
    } else if (verseInfo.type === 'multiChapterRange') {
      fetchRefs = verseInfo.points.map((point, index) => ({
        reference: `${normalizedBook} ${point.chapter}:${point.verse}`,
        chapter: point.chapter,
        verse: point.verse,
        boundary: index === 0 ? 'start' : 'end',
      }))
      lastChapter = verseInfo.end.chapter
      rangeNote = `Showing the opening verse of ${normalizedBook} ${verseInfo.start.chapter}:${verseInfo.start.verse} and the closing verse of ${normalizedBook} ${verseInfo.end.chapter}:${verseInfo.end.verse}.`
    }
  }

  if (!fetchRefs.length) {
    return null
  }

  const chapterDisplayLabel = chapterInfo.displayLabel || `${chapterInfo.startChapter}`
  const normalizedChapterSpec = chapterInfo.normalizedSpec || `${chapterInfo.startChapter}`
  const canonicalReference = chapterReference
    ? `${normalizedBook} ${chapterDisplayLabel}`
    : `${normalizedBook} ${chapterDisplayLabel}:${verseDisplaySpec || verseSpecNormalized}`

  const cacheKey = `${normalizedBook.toLowerCase()}|${normalizedChapterSpec}|${verseSpecNormalized}`

  return {
    type: 'reference',
    display,
    reference: canonicalReference,
    book: normalizedBook,
    chapterSpec: chapterDisplayLabel,
    verseSpec: chapterReference ? '' : verseDisplaySpec || verseSpecNormalized,
    fetchRefs,
    cacheKey,
    hasVerseSpec: !chapterReference,
    chapterReference,
    truncatedChapters,
    totalChapters: chapterInfo.chapters.length,
    rangeNote,
    lastChapter,
  }
}

export const createSegments = (text) => {
  if (!text) {
    return []
  }

  referenceRegex.lastIndex = 0
  const segments = []
  let lastIndex = 0
  let match

  while ((match = referenceRegex.exec(text)) !== null) {
    const start = match.index
    const matchedText = match[0]
    const matchedBook = match[1]
    const canonicalBook = canonicalizeBookName(matchedBook) || matchedBook

    if (start > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, start) })
    }

    const remaining = matchedText.slice(matchedBook.length).trim()
    const colonIndex = remaining.indexOf(':')
    const chapterPart = colonIndex >= 0 ? remaining.slice(0, colonIndex) : remaining
    const versePartRaw = colonIndex >= 0 ? remaining.slice(colonIndex + 1) : ''
    const primarySegment = buildReferenceSegment({
      book: canonicalBook,
      chapterPart,
      versePart: versePartRaw,
      display: matchedText,
    })

    if (!primarySegment) {
      segments.push({ type: 'text', text: matchedText })
      lastIndex = referenceRegex.lastIndex
      continue
    }

    segments.push(primarySegment)

    let cursor = referenceRegex.lastIndex
    let lastSegment = primarySegment

    while (cursor < text.length) {
      const remainder = text.slice(cursor)
      const continuationMatch = continuationRegex.exec(remainder)

      if (!continuationMatch) {
        break
      }

      const [fullMatch, separator, fragment] = continuationMatch
      segments.push({ type: 'text', text: separator })

      const trimmedFragment = fragment.trim()
      let continuationSegment = null

      if (trimmedFragment.includes(':')) {
        const [fragmentChapterPart, fragmentVersePart = ''] = trimmedFragment.split(':')
        continuationSegment = buildReferenceSegment({
          book: canonicalBook,
          chapterPart: fragmentChapterPart,
          versePart: fragmentVersePart,
          display: fragment,
        })
      } else if (lastSegment?.hasVerseSpec) {
        continuationSegment = buildReferenceSegment({
          book: canonicalBook,
          chapterPart: '',
          versePart: trimmedFragment,
          display: fragment,
          fallbackChapter: lastSegment.lastChapter,
        })
      } else {
        continuationSegment = buildReferenceSegment({
          book: canonicalBook,
          chapterPart: trimmedFragment,
          versePart: '',
          display: fragment,
        })
      }

      if (continuationSegment) {
        segments.push(continuationSegment)
        lastSegment = continuationSegment
      } else {
        segments.push({ type: 'text', text: fragment })
      }

      cursor += fullMatch.length
    }

    lastIndex = cursor
    referenceRegex.lastIndex = cursor
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return segments.length ? segments : [{ type: 'text', text }]
}

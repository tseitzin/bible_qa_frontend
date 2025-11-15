<template>
  <div :class="wrapperClass" ref="wrapperEl">
    <div :class="textClass">
      <template v-for="(segment, index) in segments" :key="index">
        <span v-if="segment.type === 'text'">{{ segment.text }}</span>
        <span
          v-else
          class="scripture-reference"
          tabindex="0"
          @mouseenter="handleReferenceEnter(segment, $event)"
          @mouseleave="handleReferenceLeave"
          @focus="handleReferenceEnter(segment, $event)"
          @blur="handleReferenceLeave"
          @keydown.escape.prevent="hideVersePopup(true)"
        >
          {{ segment.display }}
        </span>
      </template>
    </div>

    <div
      v-if="versePopup.visible"
      ref="popupEl"
      class="verse-popup"
      :style="{ top: versePopup.y + 'px', left: versePopup.x + 'px' }"
      @mouseenter="cancelHideTimeout"
      @mouseleave="handlePopupLeave"
    >
      <strong class="verse-popup__reference">{{ versePopup.reference || versePopup.display }}</strong>
      <p v-if="versePopup.loading" class="verse-popup__status">Loading...</p>
      <p v-else-if="versePopup.error" class="verse-popup__status">{{ versePopup.error }}</p>
      <p v-else class="verse-popup__text">{{ versePopup.text }}</p>
      <a
        class="verse-popup__link"
        :href="fullChapterLink(versePopup.reference || versePopup.display)"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ readLinkText }}
      </a>
    </div>
    <slot />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { bibleApi } from '../services/bibleApi.js'
import { BIBLE_BOOKS, BIBLE_BOOK_ALIASES } from '../constants/bibleBooks.js'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  wrapperClass: {
    type: String,
    default: 'scripture-text-wrapper',
  },
  textClass: {
    type: String,
    default: 'scripture-text',
  },
  readLinkText: {
    type: String,
    default: 'Read full chapter →',
  },
  bibleGatewayVersion: {
    type: String,
    default: 'KJV',
  },
})

const wrapperEl = ref(null)
const popupEl = ref(null)
const popupTarget = ref(null)

const POPUP_MAX_WIDTH = 320
const POPUP_MARGIN = 16
const DEFAULT_POPUP_HEIGHT = 200
const MAX_CHAPTER_SNIPPETS = 3
const verseCache = new Map()

const versePopup = ref({
  visible: false,
  reference: '',
  display: '',
  text: '',
  loading: false,
  error: null,
  x: 0,
  y: 0,
})

const hideTimeoutId = ref(null)
const activeRequestId = ref(0)

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

BIBLE_BOOKS.forEach((book) => registerBookName(book, book))
Object.entries(BIBLE_BOOK_ALIASES).forEach(([canonical, aliases]) => {
  registerBookName(canonical, canonical)
  aliases.forEach((alias) => registerBookName(alias, canonical))
})

const bookPattern = Array.from(bookNamesSet)
  .sort((a, b) => b.length - a.length)
  .map((book) => escapeRegex(book).replace(/\s+/g, '\\s+'))
  .join('|')

const referenceRegex = new RegExp(
  `\\b(${bookPattern})\\s+\\d{1,3}(?::\\d{1,3})?(?:[-–—]\\d{1,3}(?::\\d{1,3})?)?`,
  'gi'
)

const continuationRegex = /^(\s*[;,]\s*(?:and\s+)?)(\d{1,3}(?::\d{1,3})?(?:[-–—]\d{1,3}(?::\d{1,3})?)?)(?!\s*[A-Za-z])/ 

const canonicalizeBookName = (book) => {
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

const createSegments = (text) => {
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

const segments = computed(() => createSegments(props.text))

const positionVersePopup = (target) => {
  if (typeof window === 'undefined') return
  const anchor = target || popupTarget.value
  const container = wrapperEl.value
  if (!anchor || !container) return

  const rect = anchor.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const popupNode = popupEl.value
  const popupWidth = popupNode?.offsetWidth ?? POPUP_MAX_WIDTH
  const popupHeight = popupNode?.offsetHeight ?? DEFAULT_POPUP_HEIGHT

  const containerWidth = containerRect.width
  const containerHeight = containerRect.height

  let x = rect.right - containerRect.left + 12
  let y = rect.top - containerRect.top + rect.height / 2 - popupHeight / 2

  if (x + popupWidth + POPUP_MARGIN > containerWidth) {
    x = rect.left - containerRect.left - popupWidth - 12
  }

  x = Math.min(x, containerWidth - popupWidth - POPUP_MARGIN)
  x = Math.max(POPUP_MARGIN, x)

  if (y + popupHeight + POPUP_MARGIN > containerHeight) {
    y = containerHeight - popupHeight - POPUP_MARGIN
  }
  if (y < POPUP_MARGIN) {
    y = POPUP_MARGIN
  }

  popupTarget.value = anchor
  versePopup.value.x = Math.round(x)
  versePopup.value.y = Math.round(y)
}

const cancelHideTimeout = () => {
  if (hideTimeoutId.value !== null) {
    clearTimeout(hideTimeoutId.value)
    hideTimeoutId.value = null
  }
}

const hideVersePopup = (immediate = false) => {
  if (immediate) {
    cancelHideTimeout()
    versePopup.value.visible = false
    versePopup.value.loading = false
    versePopup.value.error = null
    popupTarget.value = null
    activeRequestId.value += 1
    return
  }

  cancelHideTimeout()
  hideTimeoutId.value = window.setTimeout(() => {
    versePopup.value.visible = false
    versePopup.value.loading = false
    versePopup.value.error = null
    popupTarget.value = null
    activeRequestId.value += 1
  }, 120)
}

const handleReferenceEnter = async (segment, event) => {
  if (!segment || !segment.fetchRefs.length) return

  cancelHideTimeout()
  const targetEl = event?.currentTarget || event?.target || null
  popupTarget.value = targetEl

  versePopup.value.visible = true
  versePopup.value.display = segment.display
  versePopup.value.reference = segment.reference
  versePopup.value.loading = true
  versePopup.value.error = null
  versePopup.value.text = ''

  await nextTick()
  positionVersePopup(targetEl)

  const cacheKey = segment.cacheKey
  const cached = verseCache.get(cacheKey)
  if (cached) {
    versePopup.value.loading = false
    versePopup.value.reference = cached.reference
    versePopup.value.text = cached.text
    await nextTick()
    positionVersePopup(targetEl)
    return
  }

  const requestId = ++activeRequestId.value

  try {
    const verses = []
    let lastError = null

    for (const refInfo of segment.fetchRefs) {
      try {
        const data = await bibleApi.getVerse(refInfo.reference)
        if (data && data.text) {
          verses.push(data)
        }
      } catch (error) {
        lastError = error
      }
    }

    if (requestId !== activeRequestId.value) {
      return
    }

    if (!verses.length) {
      versePopup.value.loading = false
      versePopup.value.error = lastError?.message || 'Verse not found.'
      await nextTick()
      positionVersePopup(targetEl)
      return
    }

    let displayReference = segment.reference || verses[0].reference
    if (segment.hasVerseSpec && verses.length === 1 && verses[0]?.reference) {
      displayReference = verses[0].reference
    }

    let combinedText = verses
      .map((item) => `${item.reference}: ${item.text}`)
      .join('\n')

    if (segment.chapterReference) {
      const shownChapterCount = segment.fetchRefs.length
      const hiddenChapterCount = Math.max(0, segment.totalChapters - shownChapterCount)
      const noteParts = []

      if (hiddenChapterCount > 0) {
        noteParts.push(`Showing opening verse for the first ${shownChapterCount} chapter${shownChapterCount > 1 ? 's' : ''}.`)
        noteParts.push(`${hiddenChapterCount} more chapter${hiddenChapterCount > 1 ? 's' : ''} referenced.`)
      } else if (segment.totalChapters > 1) {
        noteParts.push('Showing the opening verse for each referenced chapter.')
      } else {
        noteParts.push('Showing the opening verse for this chapter reference.')
      }

      noteParts.push('Use the link below to explore the full chapter.')
      combinedText = `${combinedText}\n\n(${noteParts.join(' ')})`
    }

    if (segment.rangeNote) {
      combinedText = `${combinedText}\n\n(${segment.rangeNote} Use the link below to read the complete passage.)`
    }

    const payload = {
      reference: displayReference,
      text: combinedText,
    }

    verseCache.set(cacheKey, payload)

    versePopup.value.loading = false
    versePopup.value.reference = payload.reference
    versePopup.value.text = payload.text
    await nextTick()
    positionVersePopup(targetEl)
  } catch (error) {
    if (requestId === activeRequestId.value) {
      versePopup.value.loading = false
      versePopup.value.error = error.message || 'Error fetching verse.'
      await nextTick()
      positionVersePopup(targetEl)
    }
  }
}

const handleReferenceLeave = () => {
  hideVersePopup()
}

const handlePopupLeave = () => {
  hideVersePopup()
}

const fullChapterLink = (reference) => {
  if (!reference) return '#'
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=${encodeURIComponent(props.bibleGatewayVersion)}`
}

watch(() => props.text, (newValue) => {
  if (!newValue) {
    hideVersePopup(true)
  }
})

onBeforeUnmount(() => {
  hideVersePopup(true)
  cancelHideTimeout()
})
</script>

<style scoped>
.scripture-text-wrapper {
  position: relative;
}

.scripture-text {
  white-space: pre-wrap;
  line-height: var(--line-height-relaxed, 1.6);
}

.scripture-reference {
  color: var(--color-primary-bright, #5c7fd0);
  cursor: pointer;
  text-decoration: underline dotted;
  text-decoration-thickness: 2px;
  text-decoration-color: var(--color-primary-bright, #5c7fd0);
  transition: color var(--transition-normal, 0.2s), text-decoration-color var(--transition-normal, 0.2s);
  outline: none;
}

.scripture-reference:hover,
.scripture-reference:focus {
  color: var(--color-primary, #2f4a7e);
  text-decoration-color: var(--color-primary, #2f4a7e);
}

.verse-popup {
  position: absolute;
  z-index: 1000;
  max-width: 280px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: var(--border-radius-lg, 12px);
  padding: var(--spacing-md, 0.75rem);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
  color: #0f172a;
  pointer-events: auto;
}

.verse-popup__reference {
  display: block;
  margin-bottom: var(--spacing-xs, 0.5rem);
  font-weight: var(--font-weight-bold, 600);
  color: var(--color-primary, #2563eb);
}

.verse-popup__status,
.verse-popup__text {
  margin: 0 0 var(--spacing-sm, 0.5rem) 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: var(--line-height-normal, 1.4);
}

.verse-popup__status {
  color: #4b5563;
}

.verse-popup__text {
  color: #1a202c;
  font-weight: var(--font-weight-medium, 500);
  white-space: pre-line;
}

.verse-popup__link {
  display: inline-block;
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-primary, #2563eb);
  text-decoration: none;
  font-weight: var(--font-weight-semibold, 600);
}

.verse-popup__link:hover {
  text-decoration: underline;
}
</style>

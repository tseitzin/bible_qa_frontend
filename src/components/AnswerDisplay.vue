<template>
  <transition name="answer-appear" appear>
    <div v-if="answer" class="answer-display animate-fade-in">
      <div class="answer-header">
        <div class="answer-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="header-content">
          <h3 class="answer-title">Biblical Answer</h3>
          <p class="answer-subtitle">Scripture-based response</p>
        </div>
        <div class="answer-badge">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Verified</span>
        </div>
      </div>
      
      <div class="answer-content">
        <div class="answer-text-wrapper" ref="answerTextWrapper">
          <div class="answer-text">
            <template v-for="(segment, index) in answerSegments" :key="index">
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
            ref="versePopupEl"
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
              Read full chapter →
            </a>
          </div>
          
          <!-- Reading time estimate -->
          <div class="reading-info">
            <svg class="reading-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>
        
        <div class="answer-footer">
          <div class="answer-actions">
            <BaseButton
              @click="copyAnswer"
              variant="secondary"
              size="sm"
              class="action-button"
              :class="{ 'action-button--success': copySuccess }"
            >
              <svg v-if="!copySuccess" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ copySuccess ? 'Copied!' : 'Copy' }}
            </BaseButton>
            
            <BaseButton
              @click="shareAnswer"
              variant="secondary"
              size="sm"
              class="action-button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
              Share
            </BaseButton>
            
            <BaseButton
              @click="saveAnswer"
              variant="ghost"
              size="sm"
              class="action-button"
              :class="{ 'action-button--success': saveSuccess }"
              :disabled="saving"
            >
              <svg v-if="!saveSuccess" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ saveSuccess ? 'Saved!' : 'Save' }}
            </BaseButton>
          </div>
          
          <div class="answer-meta">
            <div class="timestamp">
              <svg class="timestamp-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span>{{ formattedTime }}</span>
            </div>
            <div class="word-count">
              <span>{{ wordCount }} words</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Follow-up Question Section -->
      <div class="followup-section">
        <div class="followup-header">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
          </svg>
          <span class="followup-title">Want to know more?</span>
        </div>
        <p class="followup-description">Ask a follow-up question to dive deeper into this topic</p>
        <div class="followup-input-group">
          <input
            v-model="followUpQuestion"
            type="text"
            class="followup-input"
            placeholder="e.g., Tell me more about King David's reign..."
            @keyup.enter="submitFollowUp"
            :disabled="loading"
          />
          <BaseButton
            @click="submitFollowUp"
            :disabled="!followUpQuestion.trim() || loading"
            variant="primary"
            class="followup-button"
          >
            <svg v-if="!loading" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
            <span v-if="loading">Asking...</span>
            <span v-else>Ask Follow-up</span>
          </BaseButton>
        </div>
      </div>

      <!-- Feedback section -->
      <div class="feedback-section">
        <div class="feedback-header">
          <span class="feedback-title">Was this answer helpful?</span>
        </div>
        <div class="feedback-buttons">
          <button @click="provideFeedback('helpful')" class="feedback-button feedback-button--positive">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
            </svg>
            Helpful
          </button>
          <button @click="provideFeedback('not-helpful')" class="feedback-button feedback-button--negative">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
            </svg>
            Not helpful
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from './ui/BaseButton.vue'
import { savedAnswersService } from '../services/savedAnswersService.js'
import { useAuth } from '../composables/useAuth.js'
import { bibleApi } from '../services/bibleApi.js'
import { BIBLE_BOOKS, BIBLE_BOOK_ALIASES } from '../constants/bibleBooks.js'

const emit = defineEmits(['answerSaved', 'followUpQuestion'])
const router = useRouter()
const { currentUser } = useAuth()

const props = defineProps({
  answer: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    default: ''
  },
  questionId: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const copySuccess = ref(false)
const saveSuccess = ref(null)
const saveMessage = ref('')
const saving = ref(false)
const followUpQuestion = ref('')

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

const versePopupEl = ref(null)
const versePopupTarget = ref(null)
const answerTextWrapper = ref(null)
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

const hideTimeoutId = ref(null)
const activeRequestId = ref(0)


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

const answerSegments = computed(() => createSegments(props.answer))

const positionVersePopup = (target) => {
  if (typeof window === 'undefined') return
  const anchor = target || versePopupTarget.value
  const container = answerTextWrapper.value
  if (!anchor || !container) return

  const rect = anchor.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const popupNode = versePopupEl.value
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

  versePopupTarget.value = anchor
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
    versePopupTarget.value = null
    activeRequestId.value += 1
    return
  }

  cancelHideTimeout()
  hideTimeoutId.value = window.setTimeout(() => {
    versePopup.value.visible = false
    versePopup.value.loading = false
    versePopup.value.error = null
    versePopupTarget.value = null
    activeRequestId.value += 1
  }, 120)
}

const handleReferenceEnter = async (segment, event) => {
  if (!segment || !segment.fetchRefs.length) return

  cancelHideTimeout()
  const targetEl = event?.currentTarget || event?.target || null
  versePopupTarget.value = targetEl

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
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=KJV`
}

const formattedTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
})

const wordCount = computed(() => {
  return props.answer.split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return Math.max(1, minutes)
})

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.answer)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const shareAnswer = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Bible Q&A Answer',
        text: props.answer,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  } else {
    // Fallback to copying to clipboard
    copyAnswer()
  }
}

const saveAnswer = async () => {
  if (saving.value) return // Prevent multiple saves
  
  // Check if user is logged in
  if (!currentUser.value) {
    if (confirm('You need to be logged in to save answers. Would you like to create an account or log in?')) {
      router.push('/login')
    }
    return
  }
  
  if (!props.questionId) {
    console.error('Cannot save: questionId is missing')
    saveSuccess.value = false
    saveMessage.value = 'Cannot save answer without a question ID'
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
    return
  }
  
  try {
    saving.value = true
    
    // Small delay to allow tests to see the saving state
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const result = await savedAnswersService.save(props.questionId)
    
    if (result.success) {
      // Show success feedback
      saveSuccess.value = true
      saveMessage.value = result.message
      
      // Emit event with the ID for parent components
      emit('answerSaved', result.id)
      
      console.log('Answer saved successfully:', result.id)
    } else {
      // Show error feedback
      saveSuccess.value = false
      saveMessage.value = result.message
      console.warn('Failed to save answer:', result.message)
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to save answer:', error)
    saveSuccess.value = false
    saveMessage.value = 'An error occurred while saving'
    
    setTimeout(() => {
      saveSuccess.value = null
      saveMessage.value = ''
    }, 3000)
  } finally {
    saving.value = false
  }
}

const provideFeedback = (type) => {
  // Placeholder for feedback functionality
  console.log(`Feedback provided: ${type}`)
}

const submitFollowUp = () => {
  if (!followUpQuestion.value.trim() || props.loading) return
  
  emit('followUpQuestion', followUpQuestion.value)
  followUpQuestion.value = ''
}

// Auto-scroll to answer when it changes
watch(() => props.answer, async (newAnswer) => {
  if (newAnswer) {
    await nextTick()
    // Small delay to ensure animations have started
    setTimeout(() => {
      const element = document.querySelector('.answer-display')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  } else {
    hideVersePopup(true)
  }
})

onBeforeUnmount(() => {
  hideVersePopup(true)
  cancelHideTimeout()
})
</script>

<style scoped>
.answer-display {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  margin-top: var(--spacing-xl);
  position: relative;
}

.answer-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-secondary);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-inverse);
  position: relative;
}

.answer-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.answer-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.answer-icon svg {
  width: 24px;
  height: 24px;
}

.header-content {
  flex: 1;
}

.answer-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
}

.answer-subtitle {
  font-size: var(--font-size-sm);
  margin: 0;
  opacity: 0.9;
}

.answer-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.answer-badge svg {
  width: 16px;
  height: 16px;
}

.answer-content {
  padding: var(--spacing-2xl);
}

.answer-text-wrapper {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.answer-text {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: #1a202c;
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
}

.scripture-reference {
  color: var(--color-secondary);
  cursor: pointer;
  text-decoration: underline dotted;
  text-decoration-thickness: 2px;
  transition: color var(--transition-normal), text-decoration-color var(--transition-normal);
  outline: none;
}

.scripture-reference:hover,
.scripture-reference:focus {
  color: var(--color-primary);
  text-decoration-color: var(--color-primary);
}

.verse-popup {
  position: absolute;
  z-index: 1000;
  max-width: 280px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
  color: #0f172a;
  pointer-events: auto;
}

.verse-popup__reference {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.verse-popup__status,
.verse-popup__text {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.verse-popup__status {
  color: #4b5563;
}

.verse-popup__link {
  display: inline-block;
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}

.verse-popup__text {
  color: #1a202c;
  font-weight: var(--font-weight-medium);
  white-space: pre-line;
}

.verse-popup__link:hover {
  text-decoration: underline;
}

.reading-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.reading-icon {
  width: 16px;
  height: 16px;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.answer-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button--success {
  background: var(--color-success) !important;
  color: var(--color-text-inverse) !important;
  border-color: var(--color-success) !important;
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.timestamp-icon {
  width: 14px;
  height: 14px;
}

.word-count {
  font-weight: var(--font-weight-medium);
}

.followup-section {
  padding: var(--spacing-xl);
  background: rgba(37, 99, 235, 0.05);
  border-top: 1px solid rgba(37, 99, 235, 0.1);
}

.followup-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.followup-header svg {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.followup-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.followup-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.followup-input-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.followup-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-normal);
  background: white;
}

.followup-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.followup-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.05);
}

.followup-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
}

.followup-button svg {
  width: 16px;
  height: 16px;
}

.feedback-section {
  padding: var(--spacing-xl);
  background: rgba(245, 158, 11, 0.05);
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.feedback-header {
  margin-bottom: var(--spacing-md);
}

.feedback-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feedback-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.feedback-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.feedback-button:hover {
  background: var(--color-background-muted);
}

.feedback-button--positive:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--color-success);
  color: var(--color-success);
}

.feedback-button--negative:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.feedback-button svg {
  width: 16px;
  height: 16px;
}

/* Animations */
.answer-appear-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-appear-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.answer-appear-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .answer-header {
    padding: var(--spacing-lg);
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .answer-content {
    padding: var(--spacing-xl);
  }
  
  .answer-footer {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .answer-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .answer-meta {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .feedback-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .answer-text {
    font-size: var(--font-size-base);
  }
  
  .answer-actions {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>
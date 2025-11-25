<template>
  <div class="reading-shell" ref="readingShellRef">
    <header class="reading-header">
      <button type="button" class="link-button" @click="navigateBack">
        {{ backLabel }}
      </button>
      <div class="reference-pill" v-if="passageDisplay">
        <span>{{ passageDisplay }}</span>
      </div>
    </header>

    <section class="reading-card">
      <header class="card-header">
        <div>
          <p class="card-label">Focused Passage</p>
          <h1>{{ passageDisplay || 'Select a reference' }}</h1>
        </div>
        <div class="card-actions">
          <button
            type="button"
            class="btn-secondary"
            :disabled="chapterState.loading || !canLoadChapter"
            v-if="!chapterState.expanded && !isCurrentChapterFullyDisplayed"
            @click="loadFullChapter"
          >
            {{ chapterState.loading ? 'Loading…' : 'View full chapter' }}
          </button>
          <button
            type="button"
            class="btn-link"
            v-else-if="chapterState.expanded"
            @click="collapseChapter"
          >
            Hide chapter
          </button>
        </div>
      </header>

      <p v-if="passageState.error" class="error-text">{{ passageState.error }}</p>
      <div v-else-if="passageState.loading" class="loading-text">Loading passage…</div>

      <div v-else-if="passageState.data" class="passage-text">
        <h3
          v-if="shouldShowFocusedHeading && hasVisibleChapterNumber"
          class="chapter-heading"
        >
          {{ passageState.data.book }} {{ visibleChapterNumber }}
        </h3>
        <p
          v-for="verse in visiblePassageVerses"
          :key="verse.reference"
          class="verse-text"
        >
          <span class="verse-number">{{ getVerseNumber(verse) }}</span>
          {{ verse.text }}
        </p>
      </div>
      <div v-if="showPassageChapterNavigator" class="chapter-nav chapter-nav--compact">
        <button
          type="button"
          class="btn-secondary"
          :disabled="!canFocusPreviousChapter"
          @click="focusPreviousChapter"
        >
          ‹ Previous Chapter
        </button>
        <span class="chapter-nav__status">
          Chapter {{ visibleChapterNumber || chapterRange.start }} of {{ chapterRange.end || visibleChapterNumber || chapterRange.start }}
        </span>
        <button
          type="button"
          class="btn-secondary"
          :disabled="!canFocusNextChapter"
          @click="focusNextChapter"
        >
          Next Chapter ›
        </button>
      </div>
      <p v-else-if="!passageState.data" class="muted-text">Pick any topic reference to start reading.</p>
    </section>

    <section v-if="chapterState.expanded" class="reading-card">
      <header class="card-header">
        <div>
          <p class="card-label">Full Chapter</p>
          <h2>{{ chapterHeading }}</h2>
        </div>
      </header>
      <p v-if="chapterState.error" class="error-text">{{ chapterState.error }}</p>
      <div v-else-if="chapterState.loading" class="loading-text">Loading chapter…</div>
      <div v-else-if="chapterState.data" class="chapter-text">
        <p
          v-for="verse in chapterState.data.verses"
          :key="`chapter-${verse.reference}`"
          class="verse-text"
        >
          <span class="verse-number">{{ getVerseNumber(verse) }}</span>
          {{ verse.text }}
        </p>
      </div>
      <div v-if="showChapterNavigator" class="chapter-nav">
        <button
          type="button"
          class="btn-secondary"
          :disabled="!canGoPreviousChapter"
          @click="goToPreviousChapter"
        >
          ‹ Previous Chapter
        </button>
        <span class="chapter-nav__status">
          Chapter {{ chapterState.currentChapter }} of {{ chapterRange.end || chapterState.currentChapter }}
        </span>
        <button
          type="button"
          class="btn-secondary"
          :disabled="!canGoNextChapter"
          @click="goToNextChapter"
        >
          Next Chapter ›
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bibleApi } from '../services/bibleApi.js'
import { isChapterOnlyReference } from '../utils/referenceParser.js'

const route = useRoute()
const router = useRouter()
const readingShellRef = ref(null)

const passageState = reactive({ loading: false, error: '', data: null })
const chapterState = reactive({
  loading: false,
  error: '',
  data: null,
  expanded: false,
  currentChapter: null,
})
const focusedChapter = ref(null)

const currentReference = ref(typeof route.query.ref === 'string' ? route.query.ref : '')
const planSlug = computed(() => (typeof route.query.plan === 'string' ? route.query.plan : ''))

const passageDisplay = computed(() => passageState.data?.reference || currentReference.value || '')
const routeReferenceIsChapterOnly = computed(() => {
  if (route.query.fullChapter === '1') {
    return true
  }
  const raw = currentReference.value?.trim()
  if (!raw) {
    return false
  }
  return isChapterOnlyReference(raw)
})
const groupedPassageVerses = computed(() => {
  const verses = passageState.data?.verses
  if (!verses?.length) {
    return []
  }

  return verses.reduce((groups, verse) => {
    const chapterNumber = verse.chapter
    const currentGroup = groups[groups.length - 1]

    if (!currentGroup || currentGroup.chapter !== chapterNumber) {
      groups.push({ chapter: chapterNumber, verses: [verse] })
    } else {
      currentGroup.verses.push(verse)
    }

    return groups
  }, [])
})
const hasMultipleChapters = computed(() => groupedPassageVerses.value.length > 1)
const focusedPassageGroup = computed(() => {
  if (!groupedPassageVerses.value.length) {
    return null
  }

  if (Number.isInteger(focusedChapter.value)) {
    const match = groupedPassageVerses.value.find((group) => group.chapter === focusedChapter.value)
    if (match) {
      return match
    }
  }

  return groupedPassageVerses.value[0]
})

const visiblePassageVerses = computed(() => focusedPassageGroup.value?.verses ?? [])
const visibleChapterNumber = computed(() => focusedPassageGroup.value?.chapter ?? null)
const hasVisibleChapterNumber = computed(() => Number.isInteger(visibleChapterNumber.value))
const readingSource = computed(() => {
  const source = typeof route.query.source === 'string' ? route.query.source : ''
  if (source === 'answer' || source === 'study' || source === 'reading-plan') {
    return source
  }
  return ''
})

const backLabel = computed(() => {
  if (readingSource.value === 'answer') {
    return '← Return to Answer'
  }
  if (readingSource.value === 'study') {
    return '← Return to Study Helps'
  }
  if (readingSource.value === 'reading-plan') {
    return '← Return to Reading Plan'
  }
  return '← Back to Study Helps'
})
const chapterHeading = computed(() => {
  if (!chapterState.data) return ''
  return `${chapterState.data.book} ${chapterState.data.chapter}`
})

const chapterRange = computed(() => {
  const start = Number.isInteger(passageState.data?.chapter) ? passageState.data.chapter : null
  const endCandidate = Number.isInteger(passageState.data?.end_chapter)
    ? passageState.data.end_chapter
    : start
  const end = Number.isInteger(endCandidate) ? endCandidate : null
  return { start, end }
})

const showPassageChapterNavigator = computed(() => {
  if (!groupedPassageVerses.value.length) {
    return false
  }
  const { start, end } = chapterRange.value
  return Number.isInteger(start) && Number.isInteger(end) && end > start
})

const canFocusPreviousChapter = computed(() => {
  if (!showPassageChapterNavigator.value || !Number.isInteger(visibleChapterNumber.value)) {
    return false
  }
  const { start } = chapterRange.value
  return Number.isInteger(start) && visibleChapterNumber.value > start
})

const canFocusNextChapter = computed(() => {
  if (!showPassageChapterNavigator.value || !Number.isInteger(visibleChapterNumber.value)) {
    return false
  }
  const { end } = chapterRange.value
  return Number.isInteger(end) && visibleChapterNumber.value < end
})

const shouldShowFocusedHeading = computed(() => hasMultipleChapters.value || showPassageChapterNavigator.value)
const isCurrentChapterFullyDisplayed = computed(() => {
  if (!passageState.data || !Number.isInteger(visibleChapterNumber.value)) {
    return false
  }

  if (routeReferenceIsChapterOnly.value) {
    return true
  }

  const data = passageState.data
  const focusChapter = visibleChapterNumber.value
  const startChapter = Number.isInteger(data.chapter) ? data.chapter : null
  const endChapter = Number.isInteger(data.end_chapter) ? data.end_chapter : startChapter
  const startVerse = data.start_verse
  const endVerse = data.end_verse

  if (!Number.isInteger(startChapter)) {
    return false
  }

  if (endChapter === startChapter) {
    return startVerse == null && endVerse == null
  }

  if (focusChapter === startChapter) {
    return startVerse == null || startVerse <= 1
  }

  if (focusChapter === endChapter) {
    return endVerse == null
  }

  if (Number.isInteger(endChapter) && focusChapter > startChapter && focusChapter < endChapter) {
    return true
  }

  return false
})

const showChapterNavigator = computed(() => {
  if (!chapterState.expanded) {
    return false
  }
  const { start, end } = chapterRange.value
  return Number.isInteger(start) && Number.isInteger(end) && end > start
})

const canGoPreviousChapter = computed(() => {
  if (!showChapterNavigator.value || !Number.isInteger(chapterState.currentChapter)) {
    return false
  }
  const { start } = chapterRange.value
  return Number.isInteger(start) && chapterState.currentChapter > start
})

const canGoNextChapter = computed(() => {
  if (!showChapterNavigator.value || !Number.isInteger(chapterState.currentChapter)) {
    return false
  }
  const { end } = chapterRange.value
  return Number.isInteger(end) && chapterState.currentChapter < end
})

const canLoadChapter = computed(() => {
  if (!passageState.data || chapterState.expanded) {
    return false
  }
  const target = Number.isInteger(focusedChapter.value)
    ? focusedChapter.value
    : passageState.data?.chapter
  return Boolean(passageState.data.book && Number.isInteger(target))
})

const getVerseNumber = (verse) => {
  if (!verse) return ''
  if (typeof verse.reference === 'string' && verse.reference.includes(':')) {
    return verse.reference.split(':')[1]
  }
  return verse.verse ?? ''
}

const scrollToTop = async () => {
  await nextTick()
  if (typeof window === 'undefined') {
    return
  }

  const target = readingShellRef.value
  if (target?.scrollIntoView) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const focusPreviousChapter = async () => {
  if (!canFocusPreviousChapter.value || !Number.isInteger(visibleChapterNumber.value)) {
    return
  }
  focusedChapter.value = visibleChapterNumber.value - 1
  await scrollToTop()
}

const focusNextChapter = async () => {
  if (!canFocusNextChapter.value || !Number.isInteger(visibleChapterNumber.value)) {
    return
  }
  focusedChapter.value = visibleChapterNumber.value + 1
  await scrollToTop()
}

const loadPassage = async () => {
  const refValue = currentReference.value?.trim()
  if (!refValue) {
    passageState.error = 'No reference selected.'
    passageState.data = null
    return
  }

  passageState.loading = true
  passageState.error = ''
  chapterState.expanded = false
  chapterState.data = null
  chapterState.error = ''
  chapterState.currentChapter = null

  try {
    const payload = await bibleApi.getPassage(refValue)
    passageState.data = payload
    const derivedChapter = Number.isInteger(payload?.chapter)
      ? payload.chapter
      : payload?.verses?.[0]?.chapter
    focusedChapter.value = Number.isInteger(derivedChapter) ? derivedChapter : null
  } catch (error) {
    passageState.error = error.message || 'Unable to load passage'
    passageState.data = null
    focusedChapter.value = null
  } finally {
    passageState.loading = false
  }
}

const loadChapterContent = async (chapterNumber) => {
  if (!passageState.data?.book || !Number.isInteger(chapterNumber)) {
    chapterState.error = 'Chapter not available'
    return
  }

  chapterState.loading = true
  chapterState.error = ''

  try {
    const payload = await bibleApi.getChapter(passageState.data.book, chapterNumber)
    chapterState.data = payload
    chapterState.expanded = true
    chapterState.currentChapter = payload?.chapter ?? chapterNumber
    if (Number.isInteger(chapterState.currentChapter)) {
      focusedChapter.value = chapterState.currentChapter
    }
  } catch (error) {
    chapterState.error = error.message || 'Unable to load chapter'
    chapterState.data = null
    chapterState.expanded = false
    chapterState.currentChapter = null
  } finally {
    chapterState.loading = false
  }
}

const loadFullChapter = async () => {
  const targetChapter = Number.isInteger(focusedChapter.value)
    ? focusedChapter.value
    : passageState.data?.chapter
  if (!Number.isInteger(targetChapter)) return
  await loadChapterContent(targetChapter)
}

const collapseChapter = () => {
  chapterState.expanded = false
  chapterState.data = null
  chapterState.error = ''
  chapterState.currentChapter = null
}

const goToPreviousChapter = async () => {
  if (!canGoPreviousChapter.value || !Number.isInteger(chapterState.currentChapter)) {
    return
  }
  await loadChapterContent(chapterState.currentChapter - 1)
  await scrollToTop()
}

const goToNextChapter = async () => {
  if (!canGoNextChapter.value || !Number.isInteger(chapterState.currentChapter)) {
    return
  }
  await loadChapterContent(chapterState.currentChapter + 1)
  await scrollToTop()
}

const syncReferenceFromRoute = () => {
  currentReference.value = typeof route.query.ref === 'string' ? route.query.ref : ''
}

watch(
  () => route.query.ref,
  async () => {
    syncReferenceFromRoute()
    if (currentReference.value) {
      await loadPassage()
    } else {
      passageState.data = null
      passageState.error = 'No reference selected.'
      focusedChapter.value = null
    }
  }
)

const navigateBack = () => {
  if (readingSource.value === 'answer') {
    router.push({ name: 'main', query: { tab: 'ask', restore: 'answer' } })
    return
  }

  if (readingSource.value === 'study') {
    router.push({ name: 'main', query: { tab: 'study' } })
    return
  }

  if (readingSource.value === 'reading-plan') {
    if (planSlug.value) {
      router.push({ name: 'reading-plan', params: { slug: planSlug.value } })
      return
    }
    router.push({ name: 'main', query: { tab: 'study' } })
    return
  }

  router.push({ name: 'main' })
}

onMounted(async () => {
  if (!currentReference.value) {
    passageState.error = 'No reference selected.'
    return
  }
  await loadPassage()
})
</script>

<style scoped>
.reading-shell {
  min-height: 100vh;
  padding: var(--spacing-xl) var(--spacing-lg);
  background: radial-gradient(circle at top, rgba(47, 74, 126, 0.08), transparent 60%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.reading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.link-button {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.reference-pill {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-semibold);
}

.reading-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-xl);
  border: 1px solid rgba(47, 74, 126, 0.12);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.16);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.card-label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  margin: 0;
  color: var(--color-primary-light);
}

.card-header h1,
.card-header h2 {
  margin: 0.2rem 0 0 0;
  color: var(--color-primary-dark);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-secondary {
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 0.65rem 1.25rem;
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-link {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.passage-text p,
.chapter-text p {
  margin: 0 0 1rem 0;
  line-height: 1.65;
  color: var(--color-primary-dark);
}

.passage-text p:last-child,
.chapter-text p:last-child {
  margin-bottom: 0;
}

.verse-number {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin-right: 0.2rem;
}

.verse-text {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}

.chapter-heading {
  margin: 1.5rem 0 0.35rem;
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.chapter-heading:first-child {
  margin-top: 0;
}

.chapter-nav {
  margin-top: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  align-items: center;
}

.chapter-nav--compact {
  margin-top: var(--spacing-md);
}

.chapter-nav__status {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-dark);
}

.error-text {
  color: #b91c1c;
  font-weight: var(--font-weight-semibold);
}

.loading-text,
.muted-text {
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .reading-card {
    padding: var(--spacing-lg);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
  }

  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>

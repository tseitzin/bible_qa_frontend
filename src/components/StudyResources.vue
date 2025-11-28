<template>
  <div class="study-panel">
    <!-- <section class="study-card">
      <header class="study-card__header">
        <div>
          <h3>Cross References</h3>
          <p>Look up Treasury of Scripture Knowledge entries for any verse.</p>
        </div>
        <button type="button" class="link-button" @click="resetCrossReferences">Clear</button>
      </header>
      <form class="form-grid" @submit.prevent="handleCrossReferenceLookup">
        <label>
          <span>Book</span>
          <input v-model="crossForm.book" type="text" required placeholder="John" />
        </label>
        <label>
          <span>Chapter</span>
          <input v-model.number="crossForm.chapter" type="number" min="1" required />
        </label>
        <label>
          <span>Verse</span>
          <input v-model.number="crossForm.verse" type="number" min="1" required />
        </label>
        <button class="btn-primary" type="submit" :disabled="crossState.loading">
          {{ crossState.loading ? 'Searching…' : 'Find References' }}
        </button>
      </form>
      <p v-if="crossState.error" class="error-text">{{ crossState.error }}</p>
      <ul v-if="crossState.data" class="reference-list">
        <li v-for="ref in crossState.data.references" :key="ref.reference">
          <strong>{{ ref.reference }}</strong>
          <span v-if="ref.note">{{ ref.note }}</span>
        </li>
      </ul>
      <p v-else>Enter a passage to surface related scriptures instantly.</p>
    </section> -->

    <section class="study-card">
      <header class="study-card__header">
        <div>
          <h3>Bible Topic Explorer</h3>
          <p>
            Browse curated discipleship themes—focused spiritual growth topics like faith, hope, or generosity that highlight what following Jesus looks like in everyday life.
            Each topic includes a short explanation plus key passages so you can dig deeper and better understand God's word.
            Pick a theme from the dropdown, then click any reference to jump straight into Reading View for the full context.
          </p>
        </div>
      </header>
      <div class="form-inline">
        <select v-model="selectedTopic" required>
          <option value="" disabled>Select a topic</option>
          <option v-for="topic in availableTopics" :key="topic.topic" :value="topic.topic">
            {{ topic.topic }}
          </option>
        </select>
      </div>
      <p v-if="topicState.error" class="error-text">{{ topicState.error }}</p>
      <p v-else-if="!topicState.results.length" class="muted-text">Select a topic to view its summary and references.</p>
      <div v-else class="topic-grid">
        <article v-for="topic in topicState.results" :key="topic.topic" class="topic-card">
          <h4>{{ topic.topic }}</h4>
          <p class="topic-summary">{{ topic.summary }}</p>
          <ul class="topic-references">
            <li v-for="ref in topic.references" :key="ref.passage + (ref.note || '')" class="reference-row">
              <ScriptureText
                :text="ref.passage"
                wrapper-class="reference-link-wrapper"
                text-class="reference-link-text"
                read-link-text="Open in Reading View →"
                enable-reference-click
                navigation-source="study"
                @reference-click="(value) => handleReferenceClick(value, 'study')"
              />
              <span v-if="ref.note" class="reference-note"> – {{ ref.note }}</span>
            </li>
          </ul>
          <!-- <div class="topic-tags">
            <span v-for="tag in topic.keywords" :key="tag">#{{ tag }}</span>
          </div> -->
        </article>
      </div>
    </section>

    <section class="study-card" ref="readingPlanSection">
      <header class="study-card__header">
        <div>
          <h3>Reading Plans</h3>
          <p>Browse curated multi-day plans or year-long journeys. Selecting a card opens the dedicated plan page with full scheduling tools. Open any plan to adjust days and set a start date.</p>
        </div>
        <button type="button" class="link-button" :disabled="planState.loading" @click="loadReadingPlans">
          {{ planState.loading ? 'Refreshing…' : 'Reload' }}
        </button>
      </header>
      <p v-if="planState.error" class="error-text">{{ planState.error }}</p>
      <template v-else>
        <div v-if="featuredPlans.length" class="plan-group">
          <div class="plan-group__header">
            <h4>Featured Plans</h4>
            <span>{{ featuredPlans.length }} options</span>
          </div>
          <div class="plan-carousel">
            <button
              type="button"
              class="carousel-arrow"
              @click="showPrevFeatured"
              :disabled="!canScrollFeaturedPrev"
              aria-label="View previous featured reading plan"
            >
              ‹
            </button>
            <div class="plan-track">
              <article
                v-for="plan in featuredVisiblePlans"
                :key="plan.slug"
                :class="['plan-card', 'plan-card--accent', { 'plan-card--active': plan.slug === highlightedPlanSlug, 'plan-card--tracked': isTrackedPlan(plan) }]"
                :ref="(el) => registerPlanCardRef(el, plan.slug)"
                @click="openReadingPlan(plan.slug)"
              >
                <div class="plan-card__header">
                  <h4>{{ plan.name }}</h4>
                  <span>{{ plan.duration_days }} days</span>
                </div>
                <p>{{ plan.description }}</p>
                <span class="plan-pill">{{ planBadgeLabel(plan) }}</span>
                <span v-if="isTrackedPlan(plan)" class="plan-progress"><br>Tracked: {{ getTrackedPercent(plan) }}% complete</span>
              </article>
            </div>
            <button
              type="button"
              class="carousel-arrow"
              @click="showNextFeatured"
              :disabled="!canScrollFeaturedNext"
              aria-label="View next featured reading plan"
            >
              ›
            </button>
          </div>
        </div>
        <p v-else-if="!planState.loading" class="muted-text">No featured plans available yet.</p>

        <div v-if="annualPlans.length" class="plan-group">
          <div class="plan-group__header">
            <h4>Annual Journeys</h4>
            <span>Year-long coverage</span>
          </div>
          <div class="plan-carousel">
            <button
              type="button"
              class="carousel-arrow"
              @click="showPrevAnnual"
              :disabled="!canScrollAnnualPrev"
              aria-label="View previous annual reading plan"
            >
              ‹
            </button>
            <div class="plan-track">
              <article
                v-for="plan in annualVisiblePlans"
                :key="plan.slug"
                :class="['plan-card', 'plan-card--accent', { 'plan-card--active': plan.slug === highlightedPlanSlug, 'plan-card--tracked': isTrackedPlan(plan) }]"
                :ref="(el) => registerPlanCardRef(el, plan.slug)"
                @click="openReadingPlan(plan.slug)"
              >
                <div class="plan-card__header">
                  <h4>{{ plan.name }}</h4>
                  <span>{{ plan.duration_days }} days</span>
                </div>
                <p>{{ plan.description }}</p>
                <span class="plan-pill">{{ planBadgeLabel(plan) }}</span>
                <span v-if="isTrackedPlan(plan)" class="plan-progress"><br>Tracked: {{ getTrackedPercent(plan) }}% complete</span>
              </article>
            </div>
            <button
              type="button"
              class="carousel-arrow"
              @click="showNextAnnual"
              :disabled="!canScrollAnnualNext"
              aria-label="View next annual reading plan"
            >
              ›
            </button>
          </div>
        </div>
      </template>
    </section>

    <!-- <section class="study-card">
      <header class="study-card__header">
        <div>
          <h3>Devotional Builder</h3>
          <p>Create a quick study outline tied to a topic and passage.</p>
        </div>
        <button type="button" class="link-button" @click="resetDevotional">Reset</button>
      </header>
      <form class="form-grid" @submit.prevent="handleDevotionalGenerate">
        <label>
          <span>Topic</span>
          <input v-model="devotionalForm.topic" type="text" required placeholder="Living Hope" />
        </label>
        <label>
          <span>Template</span>
          <select v-model="devotionalForm.templateSlug">
            <option v-for="template in templates" :key="template.slug" :value="template.slug">
              {{ template.title }}
            </option>
          </select>
        </label>
        <label>
          <span>Passage (optional)</span>
          <input v-model="devotionalForm.passage" type="text" placeholder="1 Peter 1:3-9" />
        </label>
        <label>
          <span>Reading Plan (optional)</span>
          <select v-model="devotionalForm.planSlug">
            <option value="">None</option>
            <option v-for="plan in readingPlans" :key="plan.slug" :value="plan.slug">
              {{ plan.name }}
            </option>
          </select>
        </label>
        <label>
          <span>Plan Day</span>
          <input v-model.number="devotionalForm.day" type="number" min="1" />
        </label>
        <button class="btn-primary" type="submit" :disabled="devotionalState.loading">
          {{ devotionalState.loading ? 'Generating…' : 'Generate Devotional' }}
        </button>
      </form>
      <p v-if="devotionalState.error" class="error-text">{{ devotionalState.error }}</p>
      <div v-if="devotionalState.result" class="devotional-result">
        <h4>{{ devotionalState.result.title }}</h4>
        <p>{{ devotionalState.result.passage }}</p>
        <p>{{ devotionalState.result.summary }}</p>
        <h5>Reflection Questions</h5>
        <ul>
          <li v-for="question in devotionalState.result.reflection_questions" :key="question">{{ question }}</li>
        </ul>
        <div v-if="devotionalState.result.supporting_reading" class="supporting-reading">
          <h5>Supporting Reading</h5>
          <p>
            Day {{ devotionalState.result.supporting_reading.day_number }} –
            {{ devotionalState.result.supporting_reading.passage }}
          </p>
        </div>
      </div>
    </section> -->
  </div>
</template>

<script setup>
import { onMounted, computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studyResourcesService } from '../services/studyResourcesService.js'
import { userReadingPlanService } from '../services/userReadingPlanService.js'
import { parseReference, isChapterOnlyReference } from '../utils/referenceParser.js'
import ScriptureText from './ScriptureText.vue'
import authService from '../services/authService.js'

const router = useRouter()
const route = useRoute()
const highlightedPlanSlug = ref(typeof route.query.plan === 'string' ? route.query.plan : '')
const readingPlanSection = ref(null)
const readingPlanCards = ref([])
const scrollPendingPlanSlug = ref(Boolean(highlightedPlanSlug.value))

const crossForm = reactive({ book: 'John', chapter: 3, verse: 16 })
const crossState = reactive({ loading: false, error: '', data: null })

const availableTopics = ref([])
const selectedTopic = ref('')
const topicState = reactive({ loading: false, error: '', results: [] })

const readingPlans = ref([])
const trackedPlans = ref([])
const VISIBLE_PLAN_COUNT = 3
const planState = reactive({
  loading: false,
  error: ''
})
const featuredCarouselIndex = ref(0)
const annualCarouselIndex = ref(0)

const featuredPlans = computed(() =>
  readingPlans.value.filter((plan) => plan?.metadata?.category !== 'annual')
)
const annualPlans = computed(() =>
  readingPlans.value.filter((plan) => plan?.metadata?.category === 'annual')
)

// Map: { [plan_slug]: { percentComplete, userPlanId } }
const trackedPlanInfo = computed(() => {
  const info = {}
  trackedPlans.value.forEach((userPlan) => {
    const slug = userPlan.plan?.slug
    const total = userPlan.total_days ?? 0
    const completed = userPlan.completed_days ?? 0
    if (slug && total > 0) {
      const percent = Math.round((completed / total) * 100)
      info[slug] = {
        percentComplete: percent,
        userPlanId: userPlan.id
      }
    }
  })
  return info
})
const isTrackedPlan = (plan) => !!trackedPlanInfo.value[plan.slug]
const getTrackedPercent = (plan) => trackedPlanInfo.value[plan.slug]?.percentComplete ?? null

const planBadgeLabel = (plan) => {
  if (plan?.metadata?.category === 'annual') {
    return 'Annual'
  }
  return 'Featured'
}

const clampCarouselIndex = (indexRef, total) => {
  if (!total) {
    indexRef.value = 0
    return
  }
  const maxIndex = Math.max(0, total - VISIBLE_PLAN_COUNT)
  indexRef.value = Math.min(Math.max(indexRef.value, 0), maxIndex)
}

watch(featuredPlans, (plans) => {
  clampCarouselIndex(featuredCarouselIndex, plans.length)
})

watch(annualPlans, (plans) => {
  clampCarouselIndex(annualCarouselIndex, plans.length)
})

const createVisiblePlans = (plans, indexRef) => {
  if (!plans.length) return []
  return plans.slice(indexRef.value, indexRef.value + VISIBLE_PLAN_COUNT)
}

const featuredVisiblePlans = computed(() => createVisiblePlans(featuredPlans.value, featuredCarouselIndex))
const annualVisiblePlans = computed(() => createVisiblePlans(annualPlans.value, annualCarouselIndex))

const canScrollFeaturedPrev = computed(() => featuredCarouselIndex.value > 0)
const canScrollFeaturedNext = computed(
  () => featuredCarouselIndex.value + VISIBLE_PLAN_COUNT < featuredPlans.value.length
)
const canScrollAnnualPrev = computed(() => annualCarouselIndex.value > 0)
const canScrollAnnualNext = computed(
  () => annualCarouselIndex.value + VISIBLE_PLAN_COUNT < annualPlans.value.length
)

const showPrevFeatured = () => {
  if (!canScrollFeaturedPrev.value) return
  featuredCarouselIndex.value = Math.max(featuredCarouselIndex.value - 1, 0)
}

const showNextFeatured = () => {
  if (!canScrollFeaturedNext.value) return
  featuredCarouselIndex.value = Math.min(
    featuredCarouselIndex.value + 1,
    Math.max(0, featuredPlans.value.length - VISIBLE_PLAN_COUNT)
  )
}

const showPrevAnnual = () => {
  if (!canScrollAnnualPrev.value) return
  annualCarouselIndex.value = Math.max(annualCarouselIndex.value - 1, 0)
}

const showNextAnnual = () => {
  if (!canScrollAnnualNext.value) return
  annualCarouselIndex.value = Math.min(
    annualCarouselIndex.value + 1,
    Math.max(0, annualPlans.value.length - VISIBLE_PLAN_COUNT)
  )
}

const openReadingPlan = (slug) => {
  if (!slug) return
  router.push({ name: 'reading-plan', params: { slug } })
}

const registerPlanCardRef = (element, slug) => {
  if (!slug) {
    return
  }
  if (element) {
    readingPlanCards.value.push({ slug, element })
  } else {
    readingPlanCards.value = readingPlanCards.value.filter((entry) => entry.slug !== slug)
  }
}

const scrollToReadingPlanSection = async () => {
  await nextTick()
  if (typeof window === 'undefined') {
    return
  }

  const targetSlug = highlightedPlanSlug.value
  const targetEntry = readingPlanCards.value.find((entry) => entry.slug === targetSlug)
  const targetElement = targetEntry?.element ?? readingPlanSection.value
  if (!targetElement) {
    return
  }

  const top = targetElement.offsetTop - 48
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

watch(
  () => route.query.plan,
  (newSlug) => {
    highlightedPlanSlug.value = typeof newSlug === 'string' ? newSlug : ''
    if (highlightedPlanSlug.value) {
      scrollPendingPlanSlug.value = true
    }
  }
)

watch(
  () => ({ slug: highlightedPlanSlug.value, loading: planState.loading }),
  async ({ slug, loading }) => {
    if (!slug || loading || !scrollPendingPlanSlug.value) {
      return
    }
    scrollPendingPlanSlug.value = false
    await scrollToReadingPlanSection()
  }
)

const templates = ref([])
const devotionalForm = reactive({
  topic: '',
  templateSlug: 'classic',
  passage: '',
  planSlug: '',
  day: 1
})
const devotionalState = reactive({ loading: false, error: '', result: null })

const handleCrossReferenceLookup = async () => {
  crossState.loading = true
  crossState.error = ''
  try {
    const data = await studyResourcesService.getCrossReferences({
      book: crossForm.book,
      chapter: crossForm.chapter,
      verse: crossForm.verse
    })
    crossState.data = data
  } catch (error) {
    crossState.error = error?.response?.data?.detail || error.message || 'Unable to load cross references'
    crossState.data = null
  } finally {
    crossState.loading = false
  }
}

const resetCrossReferences = () => {
  crossState.error = ''
  crossState.data = null
}

const applySelectedTopic = () => {
  if (!selectedTopic.value) {
    topicState.results = []
    return
  }
  const match = availableTopics.value.find((topic) => topic.topic === selectedTopic.value)
  topicState.results = match ? [match] : []
}

const handleReferenceClick = (passage, source = 'study') => {
  const normalized = typeof passage === 'string' ? passage.trim() : ''
  if (!normalized) {
    return
  }

  const parsed = parseReference(normalized)
  const reference = parsed?.reference || normalized

  const query = { ref: reference }
  if (source) {
    query.source = source
  }
  if (isChapterOnlyReference(reference)) {
    query.fullChapter = '1'
  }

  router.push({ name: 'reading', query })
}

const loadTopics = async () => {
  topicState.loading = true
  topicState.error = ''
  try {
    const data = await studyResourcesService.searchTopics(undefined, 50)
    availableTopics.value = data.results || []
    if (!availableTopics.value.length) {
      selectedTopic.value = ''
      topicState.results = []
      return
    }

    if (!selectedTopic.value || !availableTopics.value.some((topic) => topic.topic === selectedTopic.value)) {
      selectedTopic.value = availableTopics.value[0].topic
    }

    applySelectedTopic()
  } catch (error) {
    topicState.error = error?.response?.data?.detail || 'Unable to load topics'
    availableTopics.value = []
    topicState.results = []
  } finally {
    topicState.loading = false
  }
}

watch(selectedTopic, () => {
  if (availableTopics.value.length) {
    applySelectedTopic()
  }
})

const loadReadingPlans = async () => {
  planState.loading = true
  planState.error = ''
  try {
    readingPlans.value = await studyResourcesService.listReadingPlans()
    featuredCarouselIndex.value = 0
    annualCarouselIndex.value = 0
  } catch (error) {
    planState.error = error?.response?.data?.detail || 'Unable to load reading plans'
  } finally {
    planState.loading = false
  }
}

const loadTemplates = async () => {
  try {
    templates.value = await studyResourcesService.listDevotionalTemplates()
    if (!templates.value.find((tpl) => tpl.slug === devotionalForm.templateSlug) && templates.value.length > 0) {
      devotionalForm.templateSlug = templates.value[0].slug
    }
  } catch (error) {
    console.error('Unable to load templates', error)
  }
}

const handleDevotionalGenerate = async () => {
  devotionalState.loading = true
  devotionalState.error = ''
  try {
    devotionalState.result = await studyResourcesService.generateDevotional({
      topic: devotionalForm.topic,
      templateSlug: devotionalForm.templateSlug,
      passage: devotionalForm.passage,
      planSlug: devotionalForm.planSlug || undefined,
      day: devotionalForm.day
    })
  } catch (error) {
    devotionalState.result = null
    devotionalState.error = error?.response?.data?.detail || error.message || 'Unable to generate devotional'
  } finally {
    devotionalState.loading = false
  }
}

const resetDevotional = () => {
  devotionalForm.topic = ''
  devotionalForm.passage = ''
  devotionalForm.planSlug = ''
  devotionalForm.day = 1
  devotionalState.error = ''
  devotionalState.result = null
}

onMounted(async () => {
  await Promise.all([loadReadingPlans(), loadTemplates(), loadTopics()])
  // Load tracked plans for logged-in user
  let user = null
  try {
    user = await authService.getCurrentUser()
  } catch (e) {
    user = null
  }
  if (user) {
    try {
      trackedPlans.value = await userReadingPlanService.listPlans()
    } catch (e) {
      trackedPlans.value = []
    }
  } else {
    trackedPlans.value = []
  }
  // ...existing code...
})
</script>

<style scoped>
.study-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.study-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-lg);
  color: black;
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.12);
  border: 1px solid rgba(47, 74, 126, 0.12);
}

.study-card p {
  color: black;
}

.study-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: black;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.study-card__header h3 {
  margin: 0;
  color: black;
}

.study-card__header p {
  margin: 0.25rem 0 0 0;
  color: black;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-dark);
}

input,
select,
textarea {
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(47, 74, 126, 0.2);
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
}

.btn-primary,
.btn-secondary {
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius-lg);
  padding: 0.85rem 1.5rem;
  font-weight: var(--font-weight-semibold);
}

.btn-primary {
  background: var(--gradient-primary);
  color: #fff;
}

.btn-secondary {
  background: rgba(47, 74, 126, 0.15);
  color: var(--color-primary-dark);
}

.error-text {
  color: #b91c1c;
  font-weight: var(--font-weight-semibold);
}

.muted-text {
  color: var(--color-text-muted);
}

.reference-list,
.topic-references,
.schedule-list,
.devotional-result ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reference-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}


:deep(.reference-link-wrapper) {
  display: inline-flex;
  position: relative;
  align-items: center;
}

:deep(.reference-link-text) {
  display: inline;
}

:deep(.reference-link-wrapper .scripture-reference) {
  font-weight: var(--font-weight-semibold, 600);
}

.reference-note {
  color: var(--color-primary-dark);
}

.reference-list li,
.schedule-list li {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  color: black;
  border-bottom: 1px solid rgba(47, 74, 126, 0.08);
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.topic-card {
  border: 1px solid rgba(47, 74, 126, 0.12);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-md);
  background: rgba(247, 248, 252, 0.8);
}

.topic-card h4 {
  margin-top: 0;
  color: black;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: var(--spacing-sm);
}

.topic-tags span {
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 0.2rem 0.8rem;
  font-size: 0.85rem;
  font-weight: var(--font-weight-semibold);
}


.plan-carousel {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.plan-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.plan-group__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 var(--spacing-xs);
}

.plan-group__header h4 {
  margin: 0;
  font-size: 1rem;
  color: black;
}

.plan-detail-hint {
  margin-top: var(--spacing-sm);
}

.plan-track {
  display: flex;
  flex: 1;
  gap: var(--spacing-md);
  overflow: hidden;
}

.carousel-arrow {
  border: none;
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  font-size: 1.4rem;
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.carousel-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.plan-card {
  border: 1px solid transparent;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(247, 248, 252, 0.9);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.plan-card--accent {
  border-color: rgba(47, 74, 126, 0.18);
}

.plan-card--tracked {
  border-color: var(--color-success, #22c55e);
  background-color: #65f59a27;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.15);
}

.plan-track .plan-card {
  flex: 0 0 calc((100% - (var(--spacing-md) * 2)) / 3);
  min-width: calc((100% - (var(--spacing-md) * 2)) / 3);
}

.plan-card:hover {
  border-color: rgba(47, 74, 126, 0.3);
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.12);
}


.plan-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 30px 45px rgba(15, 23, 42, 0.15);
}
.plan-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 18px 34px rgba(47, 74, 126, 0.2);
}

.plan-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.plan-card__header h4 {
  margin: 0;
  color: black;
  font-size: 1rem;
}

.plan-card__header span {
  font-size: 0.75rem;
}

.plan-card p {
  font-size: 0.9rem;
}

.plan-pill {
  align-self: flex-start;
  margin-top: var(--spacing-xs);
  padding: 0.15rem 0.75rem;
  border-radius: 999px;
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
}

.plan-progress {
  color: black;
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
}

.plan-detail {
  border-top: 1px solid rgba(47, 74, 126, 0.12);
  padding-top: var(--spacing-md);
}

.schedule-details {
  flex: 1;
}

.schedule-secondary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.35rem;
}

.devotional-result {
  margin-top: var(--spacing-md);
  background: rgba(247, 248, 252, 0.8);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-md);
}

.supporting-reading {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  background: rgba(47, 74, 126, 0.08);
}

@media (max-width: 640px) {
  .study-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reference-list li,
  .schedule-list li {
    flex-direction: column;
  }
}
</style>

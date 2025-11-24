<template>
  <div class="reading-plan-view">
    <header class="plan-header">
      <button type="button" class="link-button" @click="navigateBack">← Back to Study Tools</button>
      <label class="plan-switcher">
        <span>Open another plan</span>
        <select v-model="selectedPlanSlug" @change="handlePlanChange">
          <option value="" disabled>Select a plan</option>
          <option v-for="plan in readingPlans" :key="plan.slug" :value="plan.slug">
            {{ plan.name }}
          </option>
        </select>
      </label>
    </header>

    <section v-if="planState.detail" class="plan-hero">
      <div class="plan-hero__content">
        <span v-if="planCategoryLabel" class="plan-pill">{{ planCategoryLabel }}</span>
        <h1>{{ planState.detail.plan.name }}</h1>
        <p>{{ planState.detail.plan.description }}</p>
        <ul class="plan-meta">
          <li>
            <strong>{{ planState.detail.plan.duration_days }}</strong>
            <span>days</span>
          </li>
          <li>
            <strong>{{ planState.detail.plan.steps?.length || 0 }}</strong>
            <span>sections</span>
          </li>
        </ul>
      </div>
      <div class="plan-hero__actions">
        <button type="button" class="btn-secondary" @click="navigateBack">Return to Study Tools</button>
      </div>
    </section>

    <section v-else-if="planState.loading" class="plan-status">
      <p>Loading reading plan…</p>
    </section>
    <section v-else-if="planState.error" class="plan-status">
      <p class="error-text">{{ planState.error }}</p>
      <button class="btn-secondary" type="button" @click="retryLoad">Try Again</button>
    </section>

    <section v-if="planState.detail" class="plan-controls">
      <div class="control-form">
        <label>
          <span>Start Date</span>
          <input v-model="planState.startDate" type="date" @change="handleStartDateChange" />
        </label>
        <p class="control-hint">We’ll schedule each day starting from your chosen date.</p>
      </div>
    </section>

    <section v-if="planState.detail" class="plan-schedule">
      <header class="plan-schedule__header">
        <div>
          <h2>Schedule Preview</h2>
          <p>Click any passage to open it inside Reading View.</p>
        </div>
        <div v-if="totalPages > 1" class="schedule-pagination">
          <button type="button" class="btn-secondary" @click="goToPrevPage" :disabled="planState.page === 1">
            ‹ Prev
          </button>
          <span>{{ pageLabel }} · Page {{ planState.page }} of {{ totalPages }}</span>
          <button
            type="button"
            class="btn-secondary"
            @click="goToNextPage"
            :disabled="planState.page === totalPages"
          >
            Next ›
          </button>
        </div>
      </header>
      <ul class="schedule-list">
        <li v-for="item in pagedSchedule" :key="item.day_number">
          <div class="schedule-details">
            <strong>Day {{ item.day_number }} – {{ item.title }}</strong>
            <div class="schedule-secondary">
              <ScriptureText
                :text="item.passage"
                wrapper-class="reference-link-wrapper"
                text-class="reference-link-text"
                read-link-text="Open in Reading View →"
                enable-reference-click
                :allow-book-only="true"
                navigation-source="reading-plan"
                @reference-click="(value) => handleReferenceClick(value, 'reading-plan')"
              />
              <small v-if="item.notes">{{ item.notes }}</small>
            </div>
          </div>
          <div class="schedule-meta">
            <span v-if="item.scheduled_date">{{ item.scheduled_date }}</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studyResourcesService } from '../services/studyResourcesService.js'
import { parseReference } from '../utils/referenceParser.js'
import ScriptureText from '../components/ScriptureText.vue'

const router = useRouter()
const route = useRoute()
const readingPlans = ref([])
const selectedPlanSlug = ref(typeof route.params.slug === 'string' ? route.params.slug : '')
const selectedPlanMeta = computed(() =>
  readingPlans.value.find((plan) => plan.slug === selectedPlanSlug.value) || null
)
const planState = reactive({
  loading: false,
  error: '',
  detail: null,
  startDate: '',
  page: 1
})

const loadReadingPlans = async () => {
  try {
    readingPlans.value = await studyResourcesService.listReadingPlans()
    if (!selectedPlanSlug.value && readingPlans.value.length) {
      router.replace({ name: 'reading-plan', params: { slug: readingPlans.value[0].slug } })
    }
  } catch (error) {
    console.error('Unable to load reading plans list', error)
  }
}

const fetchPlanDetail = async (slug) => {
  if (!slug) {
    planState.detail = null
    return
  }
  planState.loading = true
  planState.error = ''
  try {
    const desiredDays = selectedPlanMeta.value?.duration_days
    let detail = await studyResourcesService.getReadingPlan(slug, {
      startDate: planState.startDate || undefined,
      days: desiredDays,
    })

    const totalDays = detail?.plan?.duration_days
    const needsExpansion =
      !desiredDays &&
      totalDays &&
      detail?.schedule?.length &&
      detail.schedule.length < totalDays

    if (needsExpansion) {
      detail = await studyResourcesService.getReadingPlan(slug, {
        startDate: planState.startDate || undefined,
        days: totalDays,
      })
    }

    planState.detail = detail
  } catch (error) {
    planState.detail = null
    planState.error = error?.response?.data?.detail || 'Unable to load plan detail'
  } finally {
    planState.loading = false
  }
}

const retryLoad = async () => {
  planState.error = ''
  await fetchPlanDetail(selectedPlanSlug.value)
}

const handlePlanChange = () => {
  if (!selectedPlanSlug.value) return
  planState.startDate = ''
  planState.page = 1
  router.push({ name: 'reading-plan', params: { slug: selectedPlanSlug.value } })
}

const handleStartDateChange = () => {
  if (!selectedPlanSlug.value) return
  planState.page = 1
  void fetchPlanDetail(selectedPlanSlug.value)
}

const planCategoryLabel = computed(() => {
  const category = planState.detail?.plan?.metadata?.category
  if (category === 'annual') {
    return 'Annual Journey'
  }
  return null
})

const schedulePageSize = computed(() => {
  const totalDays = planState.detail?.plan?.duration_days || selectedPlanMeta.value?.duration_days || 30
  if (planState.detail?.plan?.metadata?.category === 'annual') {
    return Math.max(1, Math.ceil(totalDays / 12))
  }
  return Math.max(1, Math.min(30, totalDays))
})

const totalPages = computed(() => {
  const totalItems = planState.detail?.schedule?.length || 0
  if (!totalItems) {
    return 1
  }
  return Math.max(1, Math.ceil(totalItems / schedulePageSize.value))
})

const pagedSchedule = computed(() => {
  const schedule = planState.detail?.schedule || []
  if (!schedule.length) {
    return []
  }
  const start = (planState.page - 1) * schedulePageSize.value
  return schedule.slice(start, start + schedulePageSize.value)
})

const pageLabel = computed(() => {
  const startDay = (planState.page - 1) * schedulePageSize.value + 1
  const endDay = Math.min(
    planState.page * schedulePageSize.value,
    planState.detail?.schedule?.length || 0
  )
  if (planState.detail?.plan?.metadata?.category === 'annual') {
    return `Month ${planState.page}`
  }
  return `Days ${startDay}–${endDay}`
})

const goToPrevPage = () => {
  if (planState.page <= 1) return
  planState.page -= 1
}

const goToNextPage = () => {
  if (planState.page >= totalPages.value) return
  planState.page += 1
}

const navigateBack = () => {
  router.push({ name: 'main', query: { tab: 'study' } })
}

const handleReferenceClick = (passage, source = 'reading-plan') => {
  const normalized = typeof passage === 'string' ? passage.trim() : ''
  if (!normalized) return

  const parsed = parseReference(normalized)
  const reference = parsed?.reference || normalized
  const query = { ref: reference }
  if (source) {
    query.source = source
  }
  if (selectedPlanSlug.value) {
    query.plan = selectedPlanSlug.value
  }
  router.push({ name: 'reading', query })
}

watch(
  () => route.params.slug,
  (newSlug) => {
    const normalized = typeof newSlug === 'string' ? newSlug : ''
    selectedPlanSlug.value = normalized
    planState.startDate = ''
    planState.page = 1
    if (normalized) {
      void fetchPlanDetail(normalized)
    }
  },
  { immediate: true }
)

watch(
  () => planState.detail?.schedule?.length,
  () => {
    planState.page = 1
  }
)

watch(totalPages, (newTotal) => {
  if (planState.page > newTotal) {
    planState.page = newTotal || 1
  }
})


onMounted(async () => {
  await loadReadingPlans()
})
</script>

<style scoped>
.reading-plan-view {
  min-height: 100vh;
  padding: var(--spacing-2xl) var(--spacing-xl);
  background: linear-gradient(160deg, rgba(247, 248, 252, 0.9), rgba(226, 234, 247, 0.9));
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 0.85rem 1.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.btn-primary {
  background: var(--gradient-primary);
  color: #fff;
}

.btn-secondary {
  background: rgba(47, 74, 126, 0.12);
  color: var(--color-primary-dark);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  padding: 0;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.plan-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: var(--font-weight-semibold);
}

.plan-switcher select {
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(47, 74, 126, 0.2);
  padding: 0.65rem 0.85rem;
}

.plan-hero {
  background: #fff;
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-xl);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid rgba(47, 74, 126, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.plan-hero__content h1 {
  margin: 0;
  color: black;
}

.plan-hero__content p {
  margin-top: var(--spacing-sm);
  max-width: 720px;
  color: black;
}

.plan-hero__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.plan-meta {
  list-style: none;
  display: flex;
  gap: var(--spacing-lg);
  padding: 0;
  margin: var(--spacing-md) 0 0;
}

.plan-meta li {
  display: flex;
  flex-direction: column;
  color: var(--color-primary-dark);
}

.plan-meta strong {
  font-size: 1.5rem;
}

.plan-status {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.plan-controls {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 20px 40px rgba(31, 50, 86, 0.12);
  border: 1px solid rgba(47, 74, 126, 0.12);
  margin-bottom: var(--spacing-xl);
}

.control-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.control-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: var(--font-weight-semibold);
  color: black;
}

.control-form input {
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(47, 74, 126, 0.2);
  padding: 0.65rem 0.85rem;
  color: black;
  width: 240px;
  max-width: 100%;
}

.control-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.plan-schedule {
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-xl);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid rgba(47, 74, 126, 0.12);
}

.plan-schedule__header {
  margin-bottom: var(--spacing-md);
  color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.plan-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  background: rgba(47, 74, 126, 0.12);
  color: black;
  font-weight: var(--font-weight-semibold);
  font-size: 0.8rem;
  margin-bottom: var(--spacing-sm);
}

.plan-pill h1 {
  margin: 0;
  color: black;
}

.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.schedule-list li {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(47, 74, 126, 0.12);
}

.schedule-secondary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.35rem;
}

.schedule-details {
  flex: 1;
}

.schedule-meta {
  min-width: 140px;
  text-align: right;
  color: var(--color-text-muted);
}

.schedule-pagination {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 768px) {
  .reading-plan-view {
    padding: var(--spacing-lg);
  }

  .plan-hero {
    flex-direction: column;
  }

  .plan-meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .schedule-list li {
    flex-direction: column;
  }

  .schedule-meta {
    text-align: left;
  }
}
</style>

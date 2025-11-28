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
        <p>{{ planState.detail.plan.description }} This plan is <strong>{{ planState.detail.plan.duration_days }} days.</strong></p>
        <!-- <ul class="plan-meta">
          <li>
            <strong>{{ planState.detail.plan.duration_days }}</strong>
            <span>days</span>
          </li>
          <li v-if="planSectionsCount">
            <strong>{{ planSectionsCount }}</strong>
            <span>readings</span>
          </li>
        </ul> -->
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
      <div class="control-form" :class="{ 'control-form--disabled': Boolean(selectedUserPlanDetail) }">
        <label>
          <span>Preview Start Date</span>
          <input
            v-model="planState.startDate"
            type="date"
            @change="handleStartDateChange"
            :disabled="Boolean(selectedUserPlanDetail)"
          />
        </label>
        <p class="control-hint" v-if="selectedUserPlanDetail">
          Start date follows your tracked plan
          <span v-if="selectedTrackedPlanSummary?.start_date">
            ({{ formatFriendlyDate(selectedTrackedPlanSummary.start_date) || selectedTrackedPlanSummary.start_date }})
          </span>.
          <button type="button" class="link-button link-button--inline" @click="resetTrackingSelection">
            Preview without tracking
          </button>
        </p>
        <p class="control-hint" v-else>We’ll schedule each day starting from your chosen date.</p>
        <div class="tracking-instructions">
          <p>How tracking works:</p>
          <ul>
            <li>Select a start date to preview the full schedule.</li>
            <li>Use the panel on the right to save the plan to your account.</li>
            <li>Once saved, mark days complete directly in the schedule.</li>
          </ul>
        </div>
      </div>

      <div class="tracking-panel tracking-panel--compact">
        <div class="tracking-panel__header">
          <div>
            <p class="tracking-eyebrow">Tracking</p>
            <h3>Stay on track</h3>
          </div>
          <p class="tracking-subtitle">Save progress without leaving the schedule.</p>
        </div>
        <template v-if="!isAuthenticated">
          <p class="tracking-cta-text">
            Create a free account to save this reading plan and mark days complete.
          </p>
          <div class="tracking-cta-actions">
            <router-link class="btn-primary" :to="registerLink">Create Account</router-link>
            <router-link class="btn-secondary" :to="loginLink">Log In</router-link>
          </div>
        </template>
        <template v-else>
          <div v-if="trackingState.loading" class="tracking-status">Loading your plans…</div>
          <div v-else class="tracking-panel__compact-body">
            <p v-if="trackingState.error" class="error-text">{{ trackingState.error }}</p>
            <div
              v-if="selectedTrackedPlanSummary"
              class="tracking-summary-row"
            >
              <div>
                <span class="tracking-label">Progress</span>
                <strong>
                  {{ selectedTrackedPlanSummary.completed_days }} / {{ selectedTrackedPlanSummary.total_days }}
                </strong>
              </div>
              <div>
                <span class="tracking-label">Percent</span>
                <strong>{{ selectedTrackedPlanSummary.percent_complete }}%</strong>
              </div>
              <div v-if="selectedTrackedPlanSummary.start_date">
                <span class="tracking-label">Started</span>
                <span>
                  {{ formatFriendlyDate(selectedTrackedPlanSummary.start_date) || selectedTrackedPlanSummary.start_date }}
                </span>
              </div>
              <div v-if="selectedTrackedPlanSummary.completed_at">
                <span class="tracking-label">Finished</span>
                <span>{{ formatFriendlyDate(selectedTrackedPlanSummary.completed_at) }}</span>
              </div>
            </div>

            <div class="tracking-compact-grid">
              <div class="tracking-card tracking-card--select">
                <template v-if="sortedTrackedPlans.length">
                  <label>
                    <span>Your tracked plans</span>
                    <select v-model.number="trackingState.selectedPlanId" @change="handleTrackedPlanSelection">
                      <option
                        v-for="plan in sortedTrackedPlans"
                        :key="plan.id"
                        :value="plan.id"
                      >
                        {{ trackedPlanOptionLabel(plan) }}
                      </option>
                    </select>
                  </label>
                  <div class="tracking-card__actions" v-if="trackingState.selectedPlanId">
                    <button
                      type="button"
                      class="link-button link-button--danger"
                      :disabled="deletingPlanId === trackingState.selectedPlanId"
                      @click="handleDeleteTrackedPlan"
                    >
                      {{ deletingPlanId === trackingState.selectedPlanId ? 'Deleting…' : 'Delete this saved plan' }}
                    </button>
                  </div>
                </template>
                <p v-else class="tracking-empty">No saved plans yet.</p>
              </div>

              <form class="tracking-card tracking-card--create" @submit.prevent="handleCreateTrackedPlan">
                <div class="tracking-mini-fields">
                  <label>
                    <span>Start Date</span>
                    <input type="date" v-model="trackingState.createStartDate" required />
                  </label>
                  <label>
                    <span>Nickname</span>
                    <input
                      type="text"
                      v-model="trackingState.createNickname"
                      maxlength="100"
                      placeholder="Optional"
                    />
                  </label>
                </div>
                <button class="btn-primary" type="submit" :disabled="trackingState.actionLoading">
                  {{ plansMatchingCurrentSlug.length ? 'Start another plan' : 'Start tracking this plan' }}
                </button>
              </form>
            </div>
          </div>
        </template>
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
            {{ paginationLabels.prev }}
          </button>
          <span>{{ pageLabel }} · Page {{ planState.page }} of {{ totalPages }}</span>
          <button
            type="button"
            class="btn-secondary"
            @click="goToNextPage"
            :disabled="planState.page === totalPages"
          >
            {{ paginationLabels.next }}
          </button>
        </div>
      </header>
      <ul class="schedule-list">
        <li v-for="item in pagedSchedule" :key="item.day_number" :class="{ 'schedule-completed': isDayComplete(item.day_number) }">
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
            <div v-if="showCompletionToggles" class="completion-toggle">
              <label>
                <input
                  type="checkbox"
                  :checked="isDayComplete(item.day_number)"
                  :disabled="completionMutationDay === item.day_number"
                  @change="handleCompletionToggle(item.day_number, $event.target.checked)"
                />
                <span>{{ isDayComplete(item.day_number) ? 'Completed' : 'Mark complete' }}</span>
              </label>
              <small v-if="dayCompletedAt(item.day_number)">
                Finished {{ dayCompletedAt(item.day_number) }}
              </small>
            </div>
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
import userReadingPlanService from '../services/userReadingPlanService.js'
import { useAuth } from '../composables/useAuth.js'
import { parseReference, isChapterOnlyReference } from '../utils/referenceParser.js'
import ScriptureText from '../components/ScriptureText.vue'

const { isAuthenticated } = useAuth()

const ANNUAL_PAGE_SIZE = 30

const router = useRouter()
const route = useRoute()
const readingPlans = ref([])
const selectedPlanSlug = ref(typeof route.params.slug === 'string' ? route.params.slug : '')
const selectedPlanMeta = computed(() =>
  readingPlans.value.find((plan) => plan.slug === selectedPlanSlug.value) || null
)
const buildAuthLink = (routeName) => {
  const link = { name: routeName }
  if (selectedPlanSlug.value) {
    link.query = {
      redirect: 'reading-plan',
      planSlug: selectedPlanSlug.value,
    }
  }
  return link
}
const loginLink = computed(() => buildAuthLink('login'))
const registerLink = computed(() => buildAuthLink('register'))
const planState = reactive({
  loading: false,
  error: '',
  detail: null,
  startDate: '',
  page: 1
})

const todayIso = () => new Date().toISOString().slice(0, 10)
const formatFriendlyDate = (value) => {
  if (!value) return ''
  const dateValue = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(dateValue?.getTime?.())) {
    return value
  }
  return dateValue.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const trackedPlanOptionLabel = (plan) => {
  if (!plan) {
    return 'Saved plan'
  }
  const nickname = plan.nickname?.trim()
  const planName = nickname || plan.plan?.name || `Plan #${plan.id}`
  const categoryLabel = plan.plan?.metadata?.category === 'annual' ? 'Annual' : 'Featured'
  const started = formatFriendlyDate(plan.start_date) || plan.start_date || 'N/A'
  return `${planName} · ${categoryLabel} · Started ${started}`
}

const trackingState = reactive({
  loading: false,
  error: '',
  plans: [],
  selectedPlanId: null,
  detail: null,
  createNickname: '',
  createStartDate: todayIso(),
  actionLoading: false,
})
const pendingSelectedPlanId = ref(null)
const completionMutationDay = ref(null)
const deletingPlanId = ref(null)

const plansMatchingCurrentSlug = computed(() =>
  trackingState.plans.filter((plan) => plan.plan.slug === selectedPlanSlug.value)
)
const sortedTrackedPlans = computed(() => {
  if (!trackingState.plans.length) {
    return []
  }
  return [...trackingState.plans].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0
    if (dateA !== dateB) {
      return dateB - dateA
    }
    const nameA = (a.nickname || a.plan?.name || '').toLowerCase()
    const nameB = (b.nickname || b.plan?.name || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
})
const selectedTrackedPlanSummary = computed(() =>
  trackingState.plans.find((plan) => plan.id === trackingState.selectedPlanId) || null
)
const selectedUserPlanDetail = computed(() =>
  trackingState.detail && trackingState.detail.id === trackingState.selectedPlanId
    ? trackingState.detail
    : null
)

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

const resetTrackingSelection = (options = {}) => {
  trackingState.selectedPlanId = null
  trackingState.detail = null
  if (!options.keepPending) {
    pendingSelectedPlanId.value = null
  }
}

const loadUserPlans = async () => {
  if (!isAuthenticated.value || !selectedPlanSlug.value) {
    trackingState.plans = []
    resetTrackingSelection()
    return
  }
  trackingState.loading = true
  trackingState.error = ''
  try {
    trackingState.plans = await userReadingPlanService.listPlans()
    await syncTrackedPlanSelection()
  } catch (error) {
    trackingState.error = error?.response?.data?.detail || 'Unable to load your reading plans'
  } finally {
    trackingState.loading = false
  }
}

const fetchTrackedPlanDetail = async (userPlanId) => {
  if (!userPlanId) {
    trackingState.detail = null
    return
  }
  try {
    trackingState.detail = await userReadingPlanService.getPlanDetail(userPlanId)
  } catch (error) {
    console.error('Unable to fetch tracked plan detail', error)
  }
}

const syncTrackedPlanSelection = async () => {
  if (!trackingState.plans.length) {
    resetTrackingSelection()
    return
  }

  if (pendingSelectedPlanId.value) {
    const pendingExists = trackingState.plans.some((plan) => plan.id === pendingSelectedPlanId.value)
    if (pendingExists) {
      trackingState.selectedPlanId = pendingSelectedPlanId.value
      pendingSelectedPlanId.value = null
      await fetchTrackedPlanDetail(trackingState.selectedPlanId)
      return
    }
    pendingSelectedPlanId.value = null
  }

  const matches = plansMatchingCurrentSlug.value

  if (!matches.length) {
    if (trackingState.selectedPlanId && !trackingState.plans.some((plan) => plan.id === trackingState.selectedPlanId)) {
      resetTrackingSelection()
    }
    return
  }

  if (!matches.some((plan) => plan.id === trackingState.selectedPlanId)) {
    trackingState.selectedPlanId = matches[0].id
  }

  if (trackingState.selectedPlanId) {
    await fetchTrackedPlanDetail(trackingState.selectedPlanId)
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
  trackingState.createStartDate = todayIso()
  resetTrackingSelection()
  router.push({ name: 'reading-plan', params: { slug: selectedPlanSlug.value } })
}

const handleTrackedPlanSelection = async () => {
  if (!trackingState.selectedPlanId) {
    trackingState.detail = null
    return
  }
  await fetchTrackedPlanDetail(trackingState.selectedPlanId)
  const summary = selectedTrackedPlanSummary.value
  const targetSlug = summary?.plan?.slug
  if (targetSlug && targetSlug !== selectedPlanSlug.value) {
    pendingSelectedPlanId.value = trackingState.selectedPlanId
    router.push({ name: 'reading-plan', params: { slug: targetSlug } })
  } else {
    pendingSelectedPlanId.value = null
  }
}

const handleStartDateChange = () => {
  if (!selectedPlanSlug.value) return
  planState.page = 1
  void fetchPlanDetail(selectedPlanSlug.value)
}

const handleCreateTrackedPlan = async () => {
  if (!selectedPlanSlug.value) return
  trackingState.actionLoading = true
  trackingState.error = ''
  try {
    await userReadingPlanService.startPlan({
      planSlug: selectedPlanSlug.value,
      startDate: trackingState.createStartDate,
      nickname: trackingState.createNickname?.trim() || undefined,
    })
    trackingState.createNickname = ''
    trackingState.createStartDate = todayIso()
    await loadUserPlans()
  } catch (error) {
    trackingState.error = error?.response?.data?.detail || 'Unable to start this plan'
  } finally {
    trackingState.actionLoading = false
  }
}

const handleCompletionToggle = async (dayNumber, isComplete) => {
  if (!trackingState.selectedPlanId || completionMutationDay.value === dayNumber) {
    return
  }
  completionMutationDay.value = dayNumber
  try {
    const result = await userReadingPlanService.updateDayCompletion(
      trackingState.selectedPlanId,
      dayNumber,
      isComplete
    )
    if (trackingState.detail?.schedule) {
      const target = trackingState.detail.schedule.find((step) => step.day_number === dayNumber)
      if (target) {
        target.is_complete = result.is_complete
        target.completed_at = result.completed_at
      }
      trackingState.detail.completed_days = result.completed_days
      trackingState.detail.percent_complete = result.percent_complete
      trackingState.detail.total_days = result.total_days
      trackingState.detail.completed_at = result.plan_completed_at
    }
    trackingState.plans = trackingState.plans.map((plan) =>
      plan.id === trackingState.selectedPlanId
        ? {
            ...plan,
            completed_days: result.completed_days,
            percent_complete: result.percent_complete,
            completed_at: result.plan_completed_at,
          }
        : plan
    )
  } catch (error) {
    console.error('Unable to update completion', error)
  } finally {
    completionMutationDay.value = null
  }
}

const handleDeleteTrackedPlan = async () => {
  if (!trackingState.selectedPlanId || deletingPlanId.value) {
    return
  }
  const confirmed = window.confirm('Delete this saved plan? Your completion history for it will be removed.')
  if (!confirmed) {
    return
  }
  deletingPlanId.value = trackingState.selectedPlanId
  trackingState.error = ''
  try {
    await userReadingPlanService.deletePlan(trackingState.selectedPlanId)
    await loadUserPlans()
  } catch (error) {
    trackingState.error = error?.response?.data?.detail || 'Unable to delete this plan'
  } finally {
    deletingPlanId.value = null
  }
}

const isAnnualPlan = computed(() => planState.detail?.plan?.metadata?.category === 'annual')

const planCategoryLabel = computed(() => (isAnnualPlan.value ? 'Annual Journey' : null))

const activeSchedule = computed(() => selectedUserPlanDetail.value?.schedule || planState.detail?.schedule || [])

const planSectionsCount = computed(() => {
  if (activeSchedule.value.length) {
    return activeSchedule.value.length
  }
  const stepsCount = planState.detail?.plan?.steps?.length
  if (stepsCount) {
    return stepsCount
  }
  const scheduleCount = planState.detail?.schedule?.length
  return scheduleCount || null
})

const schedulePageSize = computed(() => {
  const totalDays = planState.detail?.plan?.duration_days || selectedPlanMeta.value?.duration_days || 30
  if (isAnnualPlan.value) {
    return ANNUAL_PAGE_SIZE
  }
  return Math.max(1, Math.min(30, totalDays))
})

const totalPages = computed(() => {
  const totalItems = activeSchedule.value.length
  if (!totalItems) {
    return 1
  }
  return Math.max(1, Math.ceil(totalItems / schedulePageSize.value))
})

const paginationLabels = computed(() => {
  if (isAnnualPlan.value) {
    return {
      prev: '‹ Previous Month',
      next: 'Next Month ›',
    }
  }
  return {
    prev: '‹ Prev',
    next: 'Next ›',
  }
})

const pagedSchedule = computed(() => {
  if (!activeSchedule.value.length) {
    return []
  }
  const start = (planState.page - 1) * schedulePageSize.value
  return activeSchedule.value.slice(start, start + schedulePageSize.value)
})

const pageLabel = computed(() => {
  const startDay = (planState.page - 1) * schedulePageSize.value + 1
  const endDay = Math.min(planState.page * schedulePageSize.value, activeSchedule.value.length || 0)
  if (isAnnualPlan.value) {
    return `Month ${planState.page} (Days ${startDay}–${endDay})`
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
  const query = { tab: 'study' }
  if (selectedPlanSlug.value) {
    query.plan = selectedPlanSlug.value
  }
  router.push({ name: 'main', query })
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
  if (isChapterOnlyReference(reference)) {
    query.fullChapter = '1'
  }
  router.push({ name: 'reading', query })
}

const showCompletionToggles = computed(() => isAuthenticated.value && !!selectedUserPlanDetail.value)

const isDayComplete = (dayNumber) => {
  if (!selectedUserPlanDetail.value?.schedule) return false
  return Boolean(selectedUserPlanDetail.value.schedule.find((item) => item.day_number === dayNumber)?.is_complete)
}

const dayCompletedAt = (dayNumber) => {
  if (!selectedUserPlanDetail.value?.schedule) return null
  const entry = selectedUserPlanDetail.value.schedule.find((item) => item.day_number === dayNumber)
  return entry?.completed_at ? formatFriendlyDate(entry.completed_at) : null
}

watch(
  () => route.params.slug,
  (newSlug) => {
    const normalized = typeof newSlug === 'string' ? newSlug : ''
    selectedPlanSlug.value = normalized
    planState.startDate = ''
    planState.page = 1
    trackingState.createStartDate = todayIso()
    resetTrackingSelection({ keepPending: Boolean(pendingSelectedPlanId.value) })
    if (normalized) {
      void fetchPlanDetail(normalized)
    }
  },
  { immediate: true }
)

watch(
  () => activeSchedule.value.length,
  () => {
    planState.page = 1
  }
)

watch(totalPages, (newTotal) => {
  if (planState.page > newTotal) {
    planState.page = newTotal || 1
  }
})

watch(
  () => ({ authed: isAuthenticated.value, slug: selectedPlanSlug.value }),
  ({ authed, slug }) => {
    if (authed && slug) {
      void loadUserPlans()
    } else {
      trackingState.plans = []
      resetTrackingSelection()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await loadReadingPlans()
})
</script>

<style scoped>
.reading-plan-view {
  min-height: 100vh;
  padding: var(--spacing-lg) var(--spacing-lg);
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
  margin-bottom: var(--spacing-sm);
}

.plan-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: black;
  font-weight: var(--font-weight-semibold);
}

.plan-switcher select {
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(47, 74, 126, 0.2);
  padding: 0.65rem 0.85rem;
}

.plan-hero {
  background: #fff;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 18px 36px rgba(31, 50, 86, 0.15);
  border: 1px solid rgba(47, 74, 126, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);

  margin-bottom: var(--spacing-sm);
}


.plan-hero__content h1 {
  margin: 0;
  color: black;
  font-size: 1.75rem;
  line-height: 1.2;
}

.plan-hero__content p {
  margin-top: var(--spacing-xs);
  max-width: 600px;
  color: black;
  font-size: 0.95rem;
}

.plan-meta {
  list-style: none;
  display: flex;
  gap: var(--spacing-sm);
  padding: 0;
  margin: var(--spacing-sm) 0 0;
}

.plan-meta li {
  display: flex;
  flex-direction: column;
  color: var(--color-primary-dark);
  font-size: 0.85rem;
}

.plan-meta strong {
  font-size: 1.25rem;
}

.plan-status {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-sm);
}

.plan-controls {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 20px 40px rgba(31, 50, 86, 0.12);
  border: 1px solid rgba(47, 74, 126, 0.12);
  margin-bottom: var(--spacing-sm);
  display: grid;
  gap: var(--spacing-md);
}

@media (min-width: 1024px) {
  .plan-controls {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: flex-start;
  }
}

.control-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.control-form--disabled {
  opacity: 0.7;
}

.control-form--disabled input {
  pointer-events: none;
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
  color: black;
  font-size: 0.9rem;
}

.control-hint span {
  color: black;
}

.link-button--inline {
  display: inline;
  font-size: 0.85rem;
  margin-left: 0.35rem;
}

.link-button--danger {
  color: var(--color-danger, #b42318);
}

.link-button--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.plan-schedule__header h2 {
  margin: 0;
  color: black;
}

.plan-schedule__header p {
  color: black;
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
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(47, 74, 126, 0.12);
  transition: background 0.2s ease;
}

.schedule-completed {
  background: #e6fbe6 !important;
}

.tracking-panel p {
  color: black !important;
}

.tracking-cta-text {
  color: black !important;
  font-size: 0.95rem;
  font-weight: var(--font-weight-semibold);
}

.schedule-secondary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.35rem;
}

.schedule-details {
  flex: 1;
  color: black;
}

.schedule-meta {
  min-width: 140px;
  text-align: right;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: flex-end;
}

.schedule-pagination {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

.tracking-instructions,
.tracking-instructions p {
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  font-size: 0.9rem;
  color: black;
}


.tracking-panel {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-xl);
  background: rgba(47, 74, 126, 0.05);
  border: 1px solid rgba(47, 74, 126, 0.12);
  display: flex;
  color: black;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tracking-panel--compact {
  padding: var(--spacing-md);
}

.tracking-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  row-gap: var(--spacing-xs);
}

.tracking-panel__header h3 {
  margin: 0;
  color: black;
  font-size: 1rem;
  line-height: 1.2;
}

.tracking-panel__header p {
  margin: 0;
  color: black;
  font-size: 0.9rem;
  max-width: 320px;
}

.tracking-eyebrow {
  text-transform: uppercase;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  margin: 0;
  color: var(--color-primary-dark);
}

.tracking-subtitle {
  margin: 0;
  color: black;
  font-size: 0.85rem;
}

.tracking-subtitle p {
  margin: 0;
  color: black;
} 

.tracking-panel__compact-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tracking-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid rgba(47, 74, 126, 0.12);
}

.tracking-summary-row > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: black;
}

.tracking-summary-row strong {
  font-size: 1rem;
}

.tracking-label {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: black;
}

.tracking-compact-grid {
  display: grid;
  gap: var(--spacing-sm);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.tracking-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid rgba(47, 74, 126, 0.12);
  display: flex;
  color: black;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tracking-card select,
.tracking-card input {
  width: 100%;
  font-size: 0.95rem;
}

.tracking-card__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-xs);
  border-top: 1px dashed rgba(47, 74, 126, 0.15);
}

.tracking-card--create {
  gap: var(--spacing-sm);
}

.tracking-mini-fields {
  display: grid;
  gap: var(--spacing-xs);
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.tracking-mini-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: var(--font-weight-semibold);
}

.tracking-mini-fields input,
.tracking-card select {
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(47, 74, 126, 0.2);
  padding: 0.55rem 0.7rem;
}

.tracking-card button {
  align-self: flex-start;
}

.tracking-cta-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.tracking-panel__header + .tracking-panel__compact-body,
.tracking-panel__header + .tracking-status {
  margin-top: var(--spacing-xs);
  color: black;
}

.tracking-status,
.tracking-empty {
  color: black;
  font-style: italic;
}

.completion-toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  color: var(--color-primary-dark);
}

.completion-toggle label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.completion-toggle input {
  width: 16px;
  height: 16px;
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
    align-items: flex-start;
  }
}
</style>

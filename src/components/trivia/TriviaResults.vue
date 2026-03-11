<template>
  <div class="trivia-results animate-fade-in">
    <!-- Score hero -->
    <div class="results-hero animate-bounce-in">
      <div class="hero-label">Final Score</div>
      <div class="hero-score">{{ sessionResult?.score_breakdown?.total_score ?? currentScore }}</div>
      <div class="hero-stats">
        <span class="stat-chip">
          {{ accuracyPercent }}% Accuracy
        </span>
        <span v-if="sessionResult?.score_breakdown?.streak_max > 0" class="stat-chip stat-chip--streak">
          &#128293; {{ sessionResult?.score_breakdown?.streak_max }} Best Streak
        </span>
      </div>
    </div>

    <!-- Score breakdown -->
    <div v-if="sessionResult?.score_breakdown" class="breakdown-card">
      <h2 class="section-title">Score Breakdown</h2>
      <div class="breakdown-rows">
        <div class="breakdown-row">
          <span class="breakdown-label">Base Score</span>
          <span class="breakdown-value">{{ sessionResult.score_breakdown.base_score ?? '—' }}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Time Bonus</span>
          <span class="breakdown-value">+{{ sessionResult.score_breakdown.time_bonus ?? 0 }}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Streak Bonus</span>
          <span class="breakdown-value">+{{ sessionResult.score_breakdown.streak_bonus ?? 0 }}</span>
        </div>
        <div class="breakdown-row breakdown-row--total">
          <span class="breakdown-label">Total</span>
          <span class="breakdown-value">{{ sessionResult.score_breakdown.total_score }}</span>
        </div>
      </div>
      <p v-if="sessionResult.leaderboard_position" class="leaderboard-position">
        You ranked <strong>#{{ sessionResult.leaderboard_position }}</strong> on the leaderboard!
      </p>
    </div>

    <!-- Answers review -->
    <div v-if="sessionResult?.answers_review?.length" class="review-card">
      <h2 class="section-title">Answer Review</h2>
      <ol class="review-list">
        <li
          v-for="(item, idx) in sessionResult.answers_review"
          :key="idx"
          class="review-item"
          :class="item.is_correct ? 'review-item--correct' : 'review-item--incorrect'"
        >
          <div class="review-row">
            <span class="review-icon" aria-hidden="true">
              {{ item.is_correct ? '&#10003;' : '&#10007;' }}
            </span>
            <div class="review-content">
              <p class="review-question">
                <strong>{{ idx + 1 }}.</strong> {{ item.question_text }}
              </p>
              <p class="review-answers">
                <span class="your-answer">Your answer: {{ item.chosen_answer || 'No answer' }}</span>
                <span v-if="!item.is_correct" class="correct-answer">
                  Correct: {{ item.correct_answer }}
                </span>
              </p>
              <p v-if="item.explanation" class="review-explanation">{{ item.explanation }}</p>
              <p v-if="item.scripture_reference" class="review-scripture">{{ item.scripture_reference }}</p>
            </div>
          </div>
        </li>
      </ol>
    </div>

    <!-- Leaderboard -->
    <div v-if="leaderboard.length" class="leaderboard-card">
      <TriviaLeaderboard
        :entries="leaderboard"
        :user-rank="sessionResult?.leaderboard_position ?? null"
        :period="'all_time'"
      />
    </div>

    <!-- CTA buttons -->
    <div class="results-actions">
      <BaseButton
        variant="primary"
        size="lg"
        :loading="isLoading"
        @click="handlePlayAgain"
      >
        Play Again
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="lg"
        @click="resetGame"
      >
        Change Settings
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTrivia } from '../../composables/useTrivia.js'
import BaseButton from '../ui/BaseButton.vue'
import TriviaLeaderboard from './TriviaLeaderboard.vue'

const {
  sessionResult,
  gameConfig,
  leaderboard,
  isLoading,
  currentScore,
  fetchLeaderboard,
  resetGame,
  startGame
} = useTrivia()

const correctCount = computed(() => {
  if (sessionResult.value?.answers_review) {
    return sessionResult.value.answers_review.filter(a => a.is_correct).length
  }
  return 0
})

const totalCount = computed(() => {
  if (sessionResult.value?.answers_review) {
    return sessionResult.value.answers_review.length
  }
  return gameConfig.value.count
})

const accuracyPercent = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((correctCount.value / totalCount.value) * 100)
})

async function handlePlayAgain() {
  resetGame()
  await startGame({ ...gameConfig.value })
}

onMounted(() => {
  fetchLeaderboard({
    category: gameConfig.value.category,
    difficulty: gameConfig.value.difficulty
  })
})
</script>

<style scoped>
.trivia-results {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ── Score hero ── */
.results-hero {
  text-align: center;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl) var(--spacing-xl);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.hero-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.hero-score {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(4px);
}

.stat-chip--streak {
  background: rgba(245, 165, 36, 0.3);
}

/* ── Shared card ── */
.breakdown-card,
.review-card,
.leaderboard-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

/* ── Breakdown ── */
.breakdown-rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-soft);
  font-size: var(--font-size-base);
}

.breakdown-row:last-child {
  border-bottom: none;
}

.breakdown-row--total {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  border-top: 2px solid var(--border-soft);
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-md);
}

.breakdown-label {
  color: var(--color-text-muted);
}

.breakdown-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.leaderboard-position {
  margin: var(--spacing-md) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.leaderboard-position strong {
  color: var(--color-primary);
}

/* ── Review list ── */
.review-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-item {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-soft);
}

.review-item--correct {
  border-left: 4px solid var(--color-success);
  background: rgba(16, 185, 129, 0.04);
}

.review-item--incorrect {
  border-left: 4px solid var(--color-danger);
  background: rgba(239, 68, 68, 0.04);
}

.review-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.review-icon {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
  margin-top: 2px;
}

.review-item--correct .review-icon {
  color: var(--color-success);
}

.review-item--incorrect .review-icon {
  color: var(--color-danger);
}

.review-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.review-question {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.review-answers {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--font-size-xs);
  margin: 0;
}

.your-answer {
  color: var(--color-text-muted);
}

.correct-answer {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.review-explanation {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.review-scripture {
  font-size: var(--font-size-xs);
  font-style: italic;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── CTA ── */
.results-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 480px) {
  .hero-score {
    font-size: var(--font-size-4xl);
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>

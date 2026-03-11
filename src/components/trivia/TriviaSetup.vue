<template>
  <div class="trivia-setup animate-fade-in">
    <!-- Page header -->
    <div class="setup-header">
      <h1 class="setup-title">BibleQuest</h1>
      <p class="setup-subtitle">Scripture Scholar Trivia</p>
      <p class="setup-description">
        Test your knowledge of God's Word. Choose your category, difficulty, and question count to begin.
      </p>
    </div>

    <!-- Configuration card -->
    <div class="setup-card">
      <!-- Category selection -->
      <section class="config-section">
        <h2 class="config-label">Category</h2>
        <div class="pill-group">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="pill-btn"
            :class="{ 'pill-btn--active': gameConfig.category === cat.value }"
            @click="gameConfig.category = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- Difficulty selection -->
      <section class="config-section">
        <h2 class="config-label">Difficulty</h2>
        <div class="pill-group">
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            class="pill-btn pill-btn--wide"
            :class="{ 'pill-btn--active': gameConfig.difficulty === diff.value }"
            @click="gameConfig.difficulty = diff.value"
          >
            <span class="pill-main">{{ diff.label }}</span>
            <span class="pill-desc">{{ diff.description }}</span>
          </button>
        </div>
      </section>

      <!-- Question count -->
      <section class="config-section">
        <h2 class="config-label">Number of Questions</h2>
        <div class="pill-group">
          <button
            v-for="n in questionCounts"
            :key="n"
            class="pill-btn"
            :class="{ 'pill-btn--active': gameConfig.count === n }"
            @click="gameConfig.count = n"
          >
            {{ n }} Questions
          </button>
        </div>
      </section>

      <!-- Timer toggle -->
      <section class="config-section config-section--inline">
        <h2 class="config-label">30-Second Timer</h2>
        <label class="toggle-switch" :aria-label="gameConfig.timerEnabled ? 'Disable timer' : 'Enable timer'">
          <input
            type="checkbox"
            v-model="gameConfig.timerEnabled"
            class="toggle-input"
          />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
          <span class="toggle-label">{{ gameConfig.timerEnabled ? 'Enabled' : 'Disabled' }}</span>
        </label>
      </section>

      <!-- Error -->
      <div v-if="error" class="setup-error" role="alert">
        {{ error }}
      </div>

      <!-- Start button -->
      <div class="setup-actions">
        <BaseButton
          variant="primary"
          size="lg"
          :loading="isLoading"
          :disabled="isLoading"
          :full-width="true"
          @click="handleStartGame"
        >
          Start Game
        </BaseButton>
      </div>
    </div>

    <!-- Daily Challenge card -->
    <div class="daily-card">
      <div class="daily-card-header">
        <span class="daily-icon">&#9728;</span>
        <div>
          <h2 class="daily-title">Today's Daily Challenge</h2>
          <p class="daily-desc">One question. See how you stack up today.</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading && !dailyChallenge" class="daily-loading">
        Loading challenge...
      </div>

      <!-- Challenge question revealed -->
      <template v-else-if="dailyChallenge">
        <p class="daily-question">{{ dailyChallenge.question_text }}</p>

        <!-- Answer options -->
        <div v-if="!dailyResult" class="daily-options">
          <button
            v-for="option in dailyChallenge.options"
            :key="option"
            class="daily-option"
            :class="{ 'daily-option--selected': pendingDailyAnswer === option }"
            @click="pendingDailyAnswer = option"
          >
            {{ option }}
          </button>
        </div>
        <BaseButton
          v-if="!dailyResult"
          variant="secondary"
          size="md"
          :disabled="!pendingDailyAnswer || isLoading"
          :loading="isLoading"
          @click="handleDailySubmit"
          class="daily-submit-btn"
        >
          Submit Answer
        </BaseButton>

        <!-- Result revealed -->
        <div v-if="dailyResult" class="daily-result">
          <span v-if="dailyResult.is_correct" class="daily-result--correct">
            Correct! Well done.
          </span>
          <span v-else class="daily-result--incorrect">
            Not quite. The correct answer was: <strong>{{ dailyResult.correct_answer }}</strong>
          </span>
          <p v-if="dailyResult.explanation" class="daily-explanation">
            {{ dailyResult.explanation }}
          </p>
          <p v-if="dailyResult.scripture_ref" class="daily-scripture">
            {{ dailyResult.scripture_ref }}
          </p>
        </div>
      </template>

      <!-- Reveal button -->
      <BaseButton
        v-else
        variant="secondary"
        size="md"
        :loading="isLoading"
        @click="fetchDailyChallenge"
      >
        Reveal Today's Challenge
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTrivia } from '../../composables/useTrivia.js'
import BaseButton from '../ui/BaseButton.vue'

const {
  gameConfig,
  isLoading,
  error,
  dailyChallenge,
  dailyResult,
  startGame,
  fetchDailyChallenge,
  submitDailyAnswer
} = useTrivia()

const pendingDailyAnswer = ref(null)

const categories = [
  { value: 'old_testament',      label: 'Old Testament' },
  { value: 'new_testament',      label: 'New Testament' },
  { value: 'psalms_proverbs',    label: 'Psalms & Proverbs' },
  { value: 'doctrine_theology',  label: 'Doctrine & Theology' }
]

const difficulties = [
  { value: 'easy',   label: 'Easy',   description: 'Foundational questions' },
  { value: 'medium', label: 'Medium', description: 'Moderate Bible knowledge' },
  { value: 'hard',   label: 'Hard',   description: 'Deep Scripture study' }
]

const questionCounts = [5, 10, 20]

async function handleStartGame() {
  await startGame({ ...gameConfig.value })
}

async function handleDailySubmit() {
  if (!pendingDailyAnswer.value) return
  await submitDailyAnswer(pendingDailyAnswer.value)
}
</script>

<style scoped>
.trivia-setup {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ── Header ── */
.setup-header {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background: var(--header-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(20px);
  transition: background 0.3s ease;
}

.setup-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 var(--spacing-xs);
  line-height: 1.1;
}

.setup-subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.setup-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--line-height-relaxed);
  max-width: 480px;
  margin-inline: auto;
}

/* ── Config card ── */
.setup-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.config-section--inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.config-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

/* ── Pill buttons ── */
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.pill-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1.5px solid var(--color-border);
  background: var(--color-background, #f5f3ee);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  line-height: 1.2;
}

.pill-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-highlight);
}

.pill-btn--active {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.pill-btn--active:hover {
  opacity: 0.9;
  color: var(--color-text-inverse);
}

.pill-btn--wide {
  min-width: 140px;
  padding: var(--spacing-sm) var(--spacing-lg);
}

.pill-main {
  font-weight: var(--font-weight-semibold);
}

.pill-desc {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  opacity: 0.8;
  margin-top: 2px;
}

/* ── Toggle switch ── */
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border-radius: 9999px;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.toggle-input:checked + .toggle-track {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}

.toggle-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  min-width: 64px;
}

/* ── Error ── */
.setup-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-danger);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* ── Actions ── */
.setup-actions {
  margin-top: var(--spacing-xs);
}

/* ── Daily challenge card ── */
.daily-card {
  background: linear-gradient(135deg, rgba(127, 175, 154, 0.15), rgba(215, 199, 159, 0.12));
  border: 1.5px solid rgba(127, 175, 154, 0.35);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  transition: border-color 0.3s ease;
}

html[data-theme="devotion"] .daily-card {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(14, 165, 233, 0.06));
  border-color: rgba(74, 222, 128, 0.25);
}

.daily-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.daily-icon {
  font-size: 1.75rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.daily-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.daily-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.daily-loading {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.daily-question {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.daily-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.daily-option {
  width: 100%;
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1.5px solid var(--color-border);
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.daily-option:hover {
  border-color: var(--color-accent);
  background: rgba(127, 175, 154, 0.12);
}

.daily-option--selected {
  border-color: var(--color-primary);
  background: var(--color-highlight);
  color: var(--color-primary);
}

.daily-submit-btn {
  align-self: flex-start;
}

.daily-result {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.daily-result--correct {
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
}

.daily-result--incorrect {
  font-weight: var(--font-weight-medium);
  color: var(--color-danger);
}

.daily-explanation {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.daily-scripture {
  font-size: var(--font-size-xs);
  font-style: italic;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .setup-card {
    padding: var(--spacing-lg);
  }

  .setup-title {
    font-size: var(--font-size-3xl);
  }

  .pill-btn--wide {
    min-width: 0;
    flex: 1;
  }
}
</style>

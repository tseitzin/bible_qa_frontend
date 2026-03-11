<template>
  <div class="trivia-game animate-fade-in">
    <!-- Top bar -->
    <div class="game-topbar">
      <div class="topbar-left">
        <span class="question-counter">
          Question {{ currentIndex + 1 }} of {{ questions.length }}
        </span>
        <div class="progress-bar" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="topbar-right">
        <span class="score-chip">
          {{ currentScore }} pts
        </span>
        <span v-if="currentStreak >= 3" class="streak-chip">
          &#128293; {{ currentStreak }}
        </span>
      </div>
    </div>

    <!-- Timer -->
    <div v-if="gameConfig.timerEnabled" class="timer-row">
      <div class="timer-ring" :class="{ 'timer-ring--urgent': timer <= 10 }">
        <svg viewBox="0 0 36 36" class="timer-svg">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" stroke-width="2.5" />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            :stroke="timer <= 10 ? 'var(--color-danger)' : 'var(--color-primary)'"
            stroke-width="2.5"
            stroke-dasharray="100"
            :stroke-dashoffset="100 - timerPercent"
            stroke-linecap="round"
            transform="rotate(-90 18 18)"
            style="transition: stroke-dashoffset 1s linear, stroke 0.3s ease;"
          />
        </svg>
        <span class="timer-text" :class="{ 'timer-text--urgent': timer <= 10 }">{{ timer }}</span>
      </div>
      <span class="timer-label">seconds remaining</span>
    </div>

    <!-- Question card -->
    <div class="question-card">
      <p class="question-text">{{ currentQuestion?.question_text }}</p>
    </div>

    <!-- Answer options -->
    <div class="answer-options" role="list">
      <button
        v-for="(option, idx) in currentQuestion?.options ?? []"
        :key="idx"
        class="answer-btn"
        :class="{
          'answer-btn--correct': selectedAnswer !== null && idx === currentQuestion?.correct_index,
          'answer-btn--wrong': selectedAnswer === option && selectedAnswer !== null && idx !== currentQuestion?.correct_index,
          'answer-btn--disabled': selectedAnswer !== null
        }"
        :disabled="selectedAnswer !== null"
        @click="selectAnswer(option)"
        role="listitem"
      >
        <span class="answer-letter">{{ answerLetters[idx] }}</span>
        <span class="answer-text">{{ option }}</span>
      </button>
    </div>

    <!-- Submitted feedback -->
    <Transition name="fade">
      <div v-if="selectedAnswer !== null" class="submitted-notice"
           :class="isLastAnswerCorrect ? 'submitted-notice--correct' : 'submitted-notice--wrong'">
        {{ isLastAnswerCorrect ? '✓ Correct!' : '✗ Incorrect' }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTrivia } from '../../composables/useTrivia.js'

const {
  gameConfig,
  questions,
  currentIndex,
  currentQuestion,
  selectedAnswer,
  currentScore,
  currentStreak,
  timer,
  progress,
  selectAnswer
} = useTrivia()

const answerLetters = ['A', 'B', 'C', 'D', 'E']

const progressPercent = computed(() => Math.round(progress.value * 100))

// Timer expressed as a 0–100 percentage of 30 seconds
const timerPercent = computed(() => Math.round((timer.value / 30) * 100))

// Whether the most recent answer was correct (used for immediate feedback)
const isLastAnswerCorrect = computed(() => {
  if (selectedAnswer.value === null || !currentQuestion.value) return false
  const ci = currentQuestion.value.correct_index
  return ci != null && currentQuestion.value.options[ci] === selectedAnswer.value
})
</script>

<style scoped>
.trivia-game {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ── Top bar ── */
.game-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md) var(--spacing-lg);
  backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

.topbar-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.question-counter {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
}

.progress-bar {
  height: 6px;
  background: var(--color-background-muted, #dcdace);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.score-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.streak-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(245, 165, 36, 0.18);
  color: var(--color-warning);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border: 1.5px solid rgba(245, 165, 36, 0.3);
}

/* ── Timer ── */
.timer-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  justify-content: center;
}

.timer-ring {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.timer-svg {
  width: 100%;
  height: 100%;
}

.timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.timer-text--urgent {
  color: var(--color-danger);
}

.timer-ring--urgent .timer-svg circle:last-child {
  stroke: var(--color-danger);
}

.timer-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* ── Question card ── */
.question-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

.question-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* ── Answer buttons ── */
.answer-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.answer-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 1.5px solid var(--color-border);
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.answer-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-highlight);
  color: var(--color-primary);
  transform: translateX(4px);
}

.answer-btn--correct {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

.answer-btn--wrong {
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.answer-btn--disabled {
  cursor: not-allowed;
}

.answer-btn--disabled:not(.answer-btn--correct):not(.answer-btn--wrong) {
  opacity: 0.55;
}

.answer-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-background-muted, #dcdace);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease;
}

.answer-btn--selected .answer-letter {
  background: rgba(255, 255, 255, 0.25);
  color: var(--color-text-inverse);
}

.answer-text {
  flex: 1;
}

/* ── Submitted notice ── */
.submitted-notice {
  text-align: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
}

.submitted-notice--correct {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}

.submitted-notice--wrong {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.08);
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .question-text {
    font-size: var(--font-size-lg);
  }

  .game-topbar {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>

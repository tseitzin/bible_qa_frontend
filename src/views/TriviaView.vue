<template>
  <div class="trivia-page">
    <Navbar />

    <div class="app-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element floating-element--1"></div>
        <div class="floating-element floating-element--2"></div>
        <div class="floating-element floating-element--3"></div>
      </div>
    </div>

    <div class="app-container">
      <Transition name="phase" mode="out-in">
        <TriviaSetup v-if="gamePhase === 'setup'" key="setup" />
        <TriviaGame v-else-if="gamePhase === 'playing'" key="playing" />
        <TriviaResults v-else-if="gamePhase === 'results'" key="results" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import { useTrivia } from '../composables/useTrivia.js'
import Navbar from '../components/Navbar.vue'
import TriviaSetup from '../components/trivia/TriviaSetup.vue'
import TriviaGame from '../components/trivia/TriviaGame.vue'
import TriviaResults from '../components/trivia/TriviaResults.vue'

const { gamePhase, cleanup } = useTrivia()

onUnmounted(() => cleanup())
</script>

<style scoped>
.trivia-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px; /* height of fixed Navbar */
}

/* Background — matches MainApp.vue pattern */
.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    140deg,
    var(--color-primary-dark) 0%,
    var(--color-primary) 55%,
    var(--color-primary-light) 100%
  );
  opacity: 0.18;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.07) 0%, transparent 60%),
    radial-gradient(circle at 80% 35%, rgba(47, 74, 126, 0.10) 0%, transparent 60%);
  background-size: 900px 900px, 700px 700px;
  animation: floatPattern 40s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(6px);
  animation: floatSoft 30s ease-in-out infinite;
}

.floating-element--1 {
  width: 170px;
  height: 170px;
  top: 12%;
  left: 8%;
}

.floating-element--2 {
  width: 125px;
  height: 125px;
  top: 62%;
  right: 12%;
}

.floating-element--3 {
  width: 85px;
  height: 85px;
  bottom: 18%;
  left: 22%;
}

/* Container — matches MainApp.vue pattern */
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
}

/* Phase transition */
.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.3s ease;
}

.phase-enter-from,
.phase-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes floatSoft {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}

@keyframes floatPattern {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}

@media (prefers-reduced-motion: reduce) {
  .bg-pattern,
  .floating-element {
    animation: none !important;
  }
}

/* Devotion mode background overrides — mirrors MainApp */
html[data-theme="devotion"] .bg-gradient {
  background: radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.25), #020617 60%);
  opacity: 1;
}

html[data-theme="devotion"] .bg-pattern {
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.04) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(147, 197, 253, 0.06) 0%, transparent 60%);
}

html[data-theme="devotion"] .floating-element {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.015));
}
</style>

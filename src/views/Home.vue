<template>
  <div class="home app">
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <span>Bible Q&A</span>
        </div>
        <div class="nav-links">
          <router-link to="/home" class="nav-link nav-link--active">Home</router-link>
          <router-link to="/" class="nav-link">Adults</router-link>
          <router-link to="/kids" class="nav-link">Kids</router-link>
          <button
            v-if="currentUser"
            type="button"
            @click="handleLogout"
            class="nav-link logout-button"
          >
            Logout
          </button>
          <router-link v-else to="/login" class="nav-link login-button">Login</router-link>
        </div>
      </div>
    </nav>

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
      <header class="app-header animate-fade-in">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-wrapper">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div class="logo-text">
                <h1 class="app-title">Welcome Back{{ currentUser?.username ? `, ${currentUser.username}` : '' }}</h1>
                <div class="app-tagline">Scripture • Wisdom • Truth</div>
              </div>
            </div>
            <p class="app-subtitle">
              Dive into your personalized Bible Q&amp;A experience. Ask thoughtful questions, explore curated answers,
              and keep learning from Scripture every day.
            </p>
          </div>
        </div>
      </header>

      <main class="home-main">
        <section class="home-quick-actions animate-fade-in">
          <h2 class="section-title">Quick Actions</h2>
          <div class="action-grid">
            <router-link to="/" class="action-card">
              <div class="action-icon">📖</div>
              <h3>Continue Exploring</h3>
              <p>Head to the adults experience to ask detailed questions and see recent answers.</p>
            </router-link>

            <router-link to="/kids" class="action-card">
              <div class="action-icon">�</div>
              <h3>Kids Corner</h3>
              <p>Switch to a kid-friendly view with simple explanations and uplifting guidance.</p>
            </router-link>

            <button type="button" class="action-card action-card--button" @click="showSavedAnswers">
              <div class="action-icon">💾</div>
              <h3>Saved Answers</h3>
              <p>Review and organize the answers you have saved for future reference.</p>
            </button>
          </div>
        </section>

        <section class="home-insights animate-fade-in">
          <div class="insights-card">
            <h3>Need Inspiration?</h3>
            <p>
              Try asking about themes like forgiveness, faith, or wisdom to uncover fresh scriptural insights tailored to
              your questions.
            </p>
            <button type="button" class="btn-primary" @click="goToAdults">
              Ask a Bible Question
            </button>
          </div>
          <div class="insights-card">
            <h3>Tip: Follow Up</h3>
            <p>
              Keep the conversation going by asking follow-up questions in the adults experience. Each answer can lead to
              deeper understanding.
            </p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { currentUser, logout } = useAuth()

const handleLogout = () => {
  logout()
  router.push('/login')
}

const showSavedAnswers = () => {
  router.push({ path: '/', query: { tab: 'saved' } })
}

const goToAdults = () => {
  router.push('/')
}
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
}

.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.nav-logo svg {
  width: 24px;
  height: 24px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: #1a202c;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.nav-link:hover {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.nav-link--active {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logout-button {
  appearance: none;
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: rgba(136, 19, 55, 0.85);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.18);
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.28);
  border-color: rgba(239, 68, 68, 0.45);
  color: rgba(136, 19, 55, 1);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.login-button {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: rgba(6, 95, 70, 0.9);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.18);
}

.login-button:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(16, 185, 129, 0.5);
  color: rgba(6, 95, 70, 1);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  opacity: 0.1;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  background-size: 800px 800px, 600px 600px, 400px 400px;
  animation: float 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  animation: float 15s ease-in-out infinite;
}

.floating-element--1 {
  width: 200px;
  height: 200px;
  top: 12%;
  left: 12%;
  animation-delay: 0s;
}

.floating-element--2 {
  width: 150px;
  height: 150px;
  top: 58%;
  right: 15%;
  animation-delay: -5s;
}

.floating-element--3 {
  width: 110px;
  height: 110px;
  bottom: 18%;
  left: 24%;
  animation-delay: -10s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-18px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.header-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-xl) var(--spacing-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.logo-section {
  margin-bottom: var(--spacing-md);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.logo-text {
  text-align: left;
}

.app-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.app-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-accent);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.app-subtitle {
  font-size: var(--font-size-base);
  color: #1a202c;
  margin: 0;
  line-height: var(--line-height-normal);
  max-width: 640px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.home-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: black;
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.action-card {
  background: #f8fafc;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  text-align: left;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: #0f172a;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(37, 99, 235, 0.35);
  background: #ffffff;
}

.action-card--button {
  cursor: pointer;
  background: #f8fafc;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: var(--color-primary);
}

.action-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-sm) 0 var(--spacing-xs) 0;
  color: #0f172a;
}

.action-card p {
  margin: 0;
  color: rgba(15, 23, 42, 0.75);
  line-height: var(--line-height-relaxed);
}

.home-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

.insights-card {
  background: #f8fafc;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.insights-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: black;
}

.insights-card p {
  margin: 0 0 var(--spacing-md) 0;
  color: rgba(15, 23, 42, 0.75);
  line-height: var(--line-height-relaxed);
}

.insights-card--secondary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: rgba(37, 99, 235, 0.25);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .nav-container {
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .nav-links {
    gap: var(--spacing-md);
  }

  .nav-link {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .app-container {
    padding: var(--spacing-lg);
  }

  .header-content {
    padding: var(--spacing-lg);
  }

  .logo-wrapper {
    flex-direction: column;
  }

  .logo-text {
    text-align: center;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .home-insights {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--spacing-md);
  }

  .header-content {
    padding: var(--spacing-lg);
  }

  .app-title {
    font-size: var(--font-size-3xl);
  }

  .nav-links {
    gap: var(--spacing-sm);
  }
}
</style>

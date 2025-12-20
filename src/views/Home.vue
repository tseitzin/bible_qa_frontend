<template>
  <div class="home app">
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
      <header class="app-header animate-fade-in">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-wrapper">
              <div class="logo-text">
                <h1 class="app-title">Word of Life Answers</h1>
                <div class="app-tagline">Scripture • Wisdom • Truth</div>
              </div>
            </div>
            <p class="app-subtitle">
              Your personal Bible companion for thoughtful questions, guided study,
              <br>and growing daily in your understanding of God’s Word.
            </p>
          </div>
        </div>
      </header>

      <main class="home-main">
        <section class="about-highlight animate-fade-in">
          <router-link to="/about" class="about-highlight-card">
            <div class="about-highlight-content">
              <h3>What is Word of Life Answers?</h3>
              <p class="about-highlight-lede">
                Word of Life Answers was created to help people explore Scripture thoughtfully, ask meaningful questions,
                and grow in their understanding of God’s Word.
              </p>
              <p class="about-highlight-subtext">
                The Bible is rich, deep, and sometimes challenging to understand. This site is a study companion to support
                reflection, learning, and curiosity about Scripture.
              </p>
              <span class="about-highlight-kjv">All Scripture comes from the King James Version (KJV).</span>
              <span class="about-highlight-link">Read the About page →</span>
            </div>
          </router-link>
        </section>

        <section class="home-quick-actions animate-fade-in">
          <!-- <h2 class="section-title">Quick Actions</h2> -->
          <div class="action-grid">

            <router-link to="/adults" class="action-card">
              <div class="action-icon">❔
                <h3>Ask Biblical Questions</h3>
              </div>
              <p>Open the Questions section to submit detailed Bible questions, explore related topics, and review recently asked questions.</p>
            </router-link>

            <!-- <router-link to="/kids" class="action-card">
              <div class="action-icon">👶</div>
              <h3>Kids Corner</h3>
              <p>Switch to a kid-friendly view with simple explanations and uplifting guidance.</p>
            </router-link> -->

            <button type="button" class="action-card action-card--button" @click="showStudyHelps">
              <div class="action-icon">📖
                <h3>Bible Study Aids</h3>
              </div>
              <p>Enjoy guided Bible reading plans, explore Scripture at your own pace, and discover biblical topics supported by verse references.</p>
            </button>

            <button type="button" class="action-card action-card--button" @click="showSavedAnswers">
              <div class="action-icon">💾
                <h3>Saved Answers</h3>
              </div>
              <p>Review your saved answers and choose to copy them for emails or documents, share them through text or email, or export them as a downloadable PDF.</p>
            </button>
            
          </div>
        </section>

        <section class="home-insights animate-fade-in">
          <div class="insights-card">
            <h3>Need Inspiration?</h3>
            <p>
              Whether you’re wondering about forgiveness, faith, wisdom, or any passage of Scripture, your questions can lead to new, insightful perspectives.
            </p>
            <!-- <button type="button" class="btn-primary" @click="goToAdults">
              Ask a Bible Question
            </button> -->
          </div>
          <div class="insights-card">
            <h3>Tip: Ask Follow-Up Questions</h3>
            <p>
              Keep the conversation going — after you receive an answer, you can ask follow-up questions to explore the topic more deeply. Every answer is a starting point. 
              Ask follow-up questions to dig deeper, clarify details, and uncover new insights.
            </p>
          </div>
        </section>
      </main>

      <FooterSimple />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Navbar from '../components/Navbar.vue'
import FooterSimple from '../components/FooterSimple.vue'

const router = useRouter()
const { currentUser } = useAuth()

const showSavedAnswers = () => {
  router.push({ path: '/adults', query: { tab: 'saved' } })
}

const showStudyHelps = () => {
  router.push({ path: '/adults', query: { tab: 'study' } })
}

const goToAdults = () => {
  router.push('/adults')
}
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  --app-primary: var(--color-primary);
  --app-primary-light: var(--color-primary-light);
  --app-primary-dark: var(--color-primary-dark);
  --app-accent: var(--color-secondary-light);
  --app-muted: var(--color-text-muted);
  --app-highlight: var(--color-highlight);
}

.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(47, 74, 126, 0.12);
  box-shadow: 0 12px 26px rgba(31, 50, 86, 0.12);
}

.nav-container {
  max-width: 1432px;
  height: 76px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-right: auto;
}

.nav-logo img {
  height: 92px;
  width: auto;
  display: block;
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
  color: var(--app-primary-dark);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  border: 1px solid rgba(47, 74, 126, 0.12);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 20px rgba(31, 50, 86, 0.12);
  cursor: pointer;
}

.nav-link:hover {
  color: var(--app-primary);
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(47, 74, 126, 0.28);
  box-shadow: 0 12px 28px rgba(31, 50, 86, 0.18);
  transform: translateY(-1px);
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  background-color: rgba(47, 74, 126, 0.12);
  color: var(--app-primary-dark);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  justify-content: center;
}

.nav-tab:hover {
  background-color: rgba(47, 74, 126, 0.18);
  color: var(--app-primary);
  transform: translateY(-1px);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-link--active {
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
  color: #ffffff;
  border-color: rgba(47, 74, 126, 0.32);
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.28);
}

.logout-button {
  appearance: none;
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.32);
  color: rgba(136, 19, 55, 0.88);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.18);
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.24);
  border-color: rgba(239, 68, 68, 0.42);
  color: rgba(136, 19, 55, 1);
  box-shadow: 0 18px 30px rgba(239, 68, 68, 0.24);
}

.login-button {
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
  border-color: rgba(47, 74, 126, 0.32);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(47, 74, 126, 0.28);
}

.login-button:hover {
  background: linear-gradient(135deg, var(--app-primary-light), var(--app-primary));
  border-color: rgba(47, 74, 126, 0.4);
  color: #ffffff;
  box-shadow: 0 22px 36px rgba(47, 74, 126, 0.32);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(140deg,
    var(--app-primary-dark) 0%,
    var(--app-primary) 45%,
    var(--app-primary-light) 100%);
  opacity: 0.28;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.12) 0%, transparent 55%),
    radial-gradient(circle at 70% 30%, rgba(47, 74, 126, 0.22) 0%, transparent 55%),
    radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 55%);
  background-size: 800px 800px, 600px 600px, 400px 400px;
  animation: float 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element--2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.floating-element--3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.app-container {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.header-content {
  background: var(--header-bg, linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94)));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-sm);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid var(--border-soft);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.logo-section {
  margin-bottom: var(--spacing-sm);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.logo-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
  border-radius: var(--border-radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 24px 48px rgba(47, 74, 126, 0.28);
  position: relative;
}

.logo-icon img {
  width: 140%;
  height: auto;
  display: block;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.28;
  filter: blur(12px);
}

.logo-text {
  text-align: left;
}

.app-title {
  font-size: var(--font-size-4xl);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  background-clip: text;
  line-height: 1.08;
  font-weight: var(--font-weight-bold);
}

.app-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-primary-light);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.app-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-primary-dark);
  margin: 0;
  line-height: var(--line-height-tight);
  max-width: 720px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.home-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.about-highlight {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-soft);
  box-shadow: 0 20px 40px rgba(31, 50, 86, 0.16);
  max-width: 960px;
  margin: 0 auto;
}

.about-highlight-card {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  transition: transform 0.12s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.12));
  background: var(--card-bg, rgba(255, 255, 255, 0.92));
}

.about-highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(31, 50, 86, 0.16);
  border-color: var(--color-primary, #2f4a7e);
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
}

.about-highlight-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-align: center;
  color: var(--text-main);
}

.about-highlight h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--brand-primary);
}

.about-highlight-lede {
  margin: 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.about-highlight-subtext {
  margin: 0;
  color: var(--text-main);
  line-height: var(--line-height-tight);
  font-size: var(--font-size-sm);
}

.about-highlight-kjv {
  margin: 0;
  display: inline-block;
  color: var(--color-primary, #1f3b63);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.about-highlight-link {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary, #1f3b63);
  margin-top: var(--spacing-2xs);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  text-align: center;
  color: var(--app-primary-dark);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
  align-items: stretch;
  justify-items: stretch;
}

.action-card {
  background: var(--header-bg, linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(245, 243, 238, 0.9)));
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-lg);
  text-align: left;
  border: 1px solid var(--border-soft);
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.18);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--text-main);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal), background 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 58px rgba(31, 50, 86, 0.22);
  border-color: rgb(44, 54, 170);
  background-color: rgba(44, 55, 170, 0.568);
}

.action-card--button {
  cursor: pointer;
}

.action-icon {
  width: 240px;
  height: 48px;
  border-radius: var(--border-radius-xl);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: var(--app-primary);
  background: rgba(32, 62, 117, 0.321);
  box-shadow: 0 12px 24px rgba(31, 50, 86, 0.1);
}

.action-icon:hover {
  background: rgba(32, 62, 117, 0.583);
}

.action-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-sm) 0 var(--spacing-xs) var(--spacing-sm);
  color: var(--brand-primary);
}

.action-card p {
  margin: 0;
  color: var(--text-main);
  line-height: var(--line-height-relaxed);
}

.home-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

.insights-card {
  background: var(--header-bg, linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(245, 243, 238, 0.92)));
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-lg);
  box-shadow: 0 20px 40px rgba(31, 50, 86, 0.16);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.insights-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--brand-primary);
}

.insights-card p {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-main);
  line-height: var(--line-height-relaxed);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
  color: #ffffff;
  font-weight: var(--font-weight-semibold);
  border: 1px solid rgba(47, 74, 126, 0.32);
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(47, 74, 126, 0.28);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 44px rgba(47, 74, 126, 0.32);
}

@media (max-width: 768px) {
  .nav-container {
    height: auto;
    padding: var(--spacing-xs) var(--spacing-md);
    flex-wrap: wrap;
  }

  .nav-logo {
    width: 100%;
    justify-content: center;
    margin-bottom: var(--spacing-xs);
  }

  .nav-logo img {
    height: 64px;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .nav-link,
  .nav-tab {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    min-width: auto;
  }

  .nav-icon {
    width: 1rem;
    height: 1rem;
  }

  .app-container {
    padding: var(--spacing-md) var(--spacing-md) 0;
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

  .home-main {
    gap: var(--spacing-md);
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .action-grid,
  .home-insights {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--spacing-md);
  }

  .header-content {
    padding: var(--spacing-xl);
  }

  .app-title {
    font-size: var(--font-size-3xl);
  }

  .nav-links {
    gap: var(--spacing-sm);
  }

  .logo-icon {
    width: 72px;
    height: 72px;
  }
}
</style>

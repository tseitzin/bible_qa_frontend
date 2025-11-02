<template>
  <div class="home-container">
    <header class="home-header">
      <h1>Bible Q&A</h1>
      <div class="user-section">
        <span>Welcome, {{ currentUser?.username }}!</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <main class="home-content">
      <div class="hero">
        <h2>Discover Biblical Wisdom</h2>
        <p>Ask questions, save answers, and deepen your understanding of Scripture</p>
      </div>

      <div class="card-grid">
        <router-link to="/" class="feature-card">
          <div class="card-icon">📖</div>
          <h3>Ask Questions</h3>
          <p>Get AI-powered answers to your Bible questions</p>
        </router-link>

        <router-link to="/kids" class="feature-card">
          <div class="card-icon">🌟</div>
          <h3>Kids Mode</h3>
          <p>Simple, age-appropriate Bible answers for children</p>
        </router-link>

        <div class="feature-card" @click="showSavedAnswers">
          <div class="card-icon">💾</div>
          <h3>Saved Answers</h3>
          <p>Access your personal collection of saved answers</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { currentUser, logout } = useAuth()

const handleLogout = () => {
  logout()
}

const showSavedAnswers = () => {
  // Navigate to main app with saved tab active
  router.push({ path: '/', query: { tab: 'saved' } })
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.home-header h1 {
  color: white;
  margin: 0;
  font-size: 1.75rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.btn-logout {
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.home-content {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    gap: 1rem;
  }

  .hero h2 {
    font-size: 2rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>

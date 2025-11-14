<template>
  <div class="auth-page">
    <!-- Background Elements -->
    <div class="auth-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element floating-element--1"></div>
        <div class="floating-element floating-element--2"></div>
        <div class="floating-element floating-element--3"></div>
      </div>
    </div>

    <div class="auth-container">
      <!-- Logo Header -->
      <div class="auth-logo">
        <div class="logo-icon" aria-hidden="true">
          <img :src="logoImage" alt="Word of Life Answers logo" />
        </div>
        <h1 class="logo-title">Word of Life Answers</h1>
      </div>

      <!-- Auth Card -->
      <div class="auth-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to save and access your answers</p>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div v-if="error" class="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="loading-spinner">Signing in...</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <button @click="continueAsGuest" class="btn-guest">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
          </svg>
          Continue as Guest
        </button>

        <p class="auth-footer">
          Don't have an account?
          <router-link to="/register">Create one</router-link>
        </p>
      </div>

      <p class="guest-note">
        💡 You can use Bible Q&A without an account. Sign in only if you want to save answers.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import logoImage from '../assets/logo_wider.png'

const router = useRouter()
const { login, isLoading, error: authError } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    router.push('/home')
  } else {
    error.value = result.message || authError.value || 'Login failed'
  }
}

const continueAsGuest = () => {
  router.push('/')
}
</script>

<style scoped>
@import '../styles/variables.css';

.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background Elements */
.auth-background {
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
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  opacity: 0.1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
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

/* Auth Container */
.auth-container {
  max-width: 480px;
  width: 100%;
  padding: var(--spacing-xl);
  position: relative;
  z-index: 1;
}

/* Logo Header */
.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  animation: fadeInDown 0.6s ease-out;
}

.logo-icon {
  width: 160px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo-icon img {
  width: 100%;
  height: auto;
  display: block;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -8px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-2xl);
  z-index: -1;
  opacity: 0.25;
  filter: blur(20px);
}

.logo-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* Auth Card */
.auth-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: #1a202c;
  margin: 0 0 var(--spacing-sm) 0;
  text-align: center;
}

.subtitle {
  color: #4a5568;
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  font-size: var(--font-size-base);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

label {
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
  font-size: var(--font-size-sm);
}

input {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.9);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

input:disabled {
  background: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Buttons */
.btn-primary {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--spacing-xl) 0;
  color: #4a5568;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.auth-divider span {
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Guest Button */
.btn-guest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

.btn-guest svg {
  width: 20px;
  height: 20px;
}

.btn-guest:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  color: #4a5568;
  font-size: var(--font-size-sm);
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-normal);
}

.auth-footer a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Guest Note */
.guest-note {
  text-align: center;
  margin-top: var(--spacing-xl);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.8s ease-out 0.3s both;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    padding: var(--spacing-lg);
  }
  
  .auth-card {
    padding: var(--spacing-2xl);
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .logo-title {
    font-size: var(--font-size-2xl);
  }
}
</style>

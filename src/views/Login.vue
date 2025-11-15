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

      <!-- Auth Card -->
      <div class="auth-card">
        <div class="logo-icon" aria-hidden="true">
          <img :src="logoImage" alt="Word of Life Answers logo" />
        </div>
        <h2>Welcome Back!</h2>
        <p class="subtitle">Sign in to save answers, revisit your saved answers anytime, and view your recently asked questions.</p>

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

          <div class="form-group password-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
                :aria-pressed="showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :title="showPassword ? 'Hide password' : 'Show password'"
                :disabled="isLoading"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2.5 12s3-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3 5.5-9.5 5.5S2.5 12 2.5 12z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2.5 12s3-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3 5.5-9.5 5.5S2.5 12 2.5 12z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M4 4l16 16" />
                </svg>
              </button>
            </div>
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

        <p class="guest-note guest-note--inline">
        You can use Word of Life Answers without an account.<br> 
        Sign in only if you want to save answers.
        </p>

        <p class="auth-footer">
          Don't have an account?
          <router-link to="/register">Create one</router-link>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import logoImage from '../assets/logo_cross.png'

const router = useRouter()
const route = useRoute()
const { login, isLoading, error: authError } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    const redirectParam = route.query.redirect
    if (redirectParam === 'pending-save') {
      router.push({ name: 'main' })
    } else if (redirectParam === 'saved') {
      router.push({ name: 'main', query: { tab: 'saved' } })
    } else {
      router.push({ name: 'main' })
    }
  } else {
    error.value = result.message || authError.value || 'Login failed'
  }
}

const continueAsGuest = () => {
  router.push('/')
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
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
  --login-primary: var(--color-primary);
  --login-primary-light: var(--color-primary-light);
  --login-primary-dark: var(--color-primary-dark);
  --login-accent: var(--color-secondary-light);
  --login-muted: var(--color-text-muted);
  --login-highlight: var(--color-highlight);
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
  background: linear-gradient(140deg,
    var(--login-primary-dark) 0%,
    var(--login-primary) 45%,
    var(--login-primary-light) 100%);
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
  margin-bottom: var(--spacing-sm);
  animation: fadeInDown 0.6s ease-out;
}

.logo-icon {
  width: 160px;
  margin: 0 auto 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo-icon img {
  width: 140%;
  height: auto;
  display: block;
}

/* .logo-icon::after {
  content: '';
  position: absolute;
  inset: -8px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-2xl);
  z-index: -1;
  opacity: 0.25;
  filter: blur(20px);
} */

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
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 243, 238, 0.94));
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-lg);
  box-shadow: 0 30px 60px rgba(31, 50, 86, 0.18);
  border: 1px solid rgba(47, 74, 126, 0.12);
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--login-primary);
  margin: 0 0 var(--spacing-xs) 0;
  text-align: center;
}

.subtitle {
  color: var(--login-primary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid rgba(47, 74, 126, 0.14);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: calc(var(--spacing-md) + 2.25rem);
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: var(--spacing-sm);
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--login-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: color var(--transition-fast), box-shadow var(--transition-fast);
}

.password-toggle:hover:not(:disabled) {
  color: var(--login-primary);
}

.password-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(47, 74, 126, 0.25);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

input:focus {
  outline: none;
  border-color: var(--login-primary);
  box-shadow: 0 0 0 3px rgba(47, 74, 126, 0.16);
  background: white;
}

input:disabled {
  background: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Buttons */
.btn-primary {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(135deg, var(--login-primary), var(--login-primary-light));
  color: white;
    position: relative;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 14px 30px rgba(47, 74, 126, 0.25);
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
  box-shadow: 0 18px 34px rgba(47, 74, 126, 0.28);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 10px 22px rgba(47, 74, 126, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(47, 74, 126, 0.6), rgba(127, 175, 154, 0.6));
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--spacing-xs) 0;
  color: var(--login-muted);
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(47, 74, 126, 0.5);
}

.auth-divider span {
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

/* Guest Button */
.btn-guest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: white;
  color: var(--login-primary);
  border: 2px solid var(--login-primary);
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
  background: var(--login-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(47, 74, 126, 0.22);
}

.btn-guest:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 74, 126, 0.28);
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
  margin-top: var(--spacing-xs);
  color: var(--login-primary-dark);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.auth-footer a {
  color: var(--login-primary);
  text-decoration: none;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  transition: color var(--transition-normal);
  text-underline-offset: 3px;
}

.auth-footer a:hover {
  color: var(--login-primary-light);
  text-decoration: underline;
}

/* Guest Note */
.guest-note {
  text-align: center;
  margin-top: var(--spacing-sm);
  color: var(--login-primary-dark);
  font-size: var(--font-size-xs);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(47, 74, 126, 0.18);
  box-shadow: 0 14px 30px rgba(31, 50, 86, 0.14);
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.guest-note--inline {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  background: rgba(47, 74, 126, 0.08);
  border: 1px solid rgba(47, 74, 126, 0.15);
  box-shadow: 0 6px 16px rgba(31, 50, 86, 0.08);
  animation: none;
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
    padding: var(--spacing-md) var(--spacing-lg);
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

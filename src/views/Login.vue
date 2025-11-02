<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue your Bible Q&A journey</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="error" class="error-message">
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
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <router-link to="/register">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

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
</script>

<style scoped>
@import '../styles/variables.css';

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-background);
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #444;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: #2563eb;
  color: #ffffff !important;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>

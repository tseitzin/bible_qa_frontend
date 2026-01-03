<template>
  <nav class="navbar-simple">
    <div class="navbar-simple-row">
      <router-link to="/" class="navbar-simple-logo-link">
        <img :src="logo" alt="Word of Life Answers" class="navbar-simple-logo" />
         <div class="navbar-brand-text">
          <div class="navbar-brand-title">Word of Life Answers</div>
          <div class="navbar-brand-tagline">
            Bible Questions • Scripture Study • Guided Insight
         </div>
         </div>
      </router-link>
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
        <span class="hamburger-icon" :class="{ 'open': mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      
      <div class="navbar-simple-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link
          to="/"
          class="navbar-simple-link"
          :class="{ 'active': $route.path === '/' && !$route.path.includes('/adults') && !$route.path.includes('/kids') }"
          @click="mobileMenuOpen = false"
        >Home</router-link>
        <router-link
          to="/about"
          class="navbar-simple-link"
          :class="{ 'active': $route.path === '/about' }"
          @click="mobileMenuOpen = false"
        >About</router-link>
        <router-link
          to="/adults"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'ask' }"
          @click="mobileMenuOpen = false"
        >Ask Questions</router-link>
        <router-link
          to="/adults?tab=saved"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'saved' }"
          @click="mobileMenuOpen = false"
        >Saved Answers</router-link>
        <router-link
          to="/adults?tab=study"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'study' }"
          @click="mobileMenuOpen = false"
        >Bible Study</router-link>
        <router-link
          to="/kids"
          class="navbar-simple-link"
          :class="{ 'active': $route.path === '/kids' }"
          @click="mobileMenuOpen = false"
        >Kids</router-link>
        <router-link
          v-if="currentUser?.is_admin"
          to="/admin/dashboard"
          class="navbar-simple-link"
          :class="{ 'active': $route.path.includes('/admin') }"
          @click="mobileMenuOpen = false"
        >Admin</router-link>
      </div>
      <div class="navbar-simple-auth">
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :title="isDevotion ? 'Switch to Light Mode' : 'Switch to Devotion Mode'"
          :aria-label="isDevotion ? 'Switch to Light Mode' : 'Switch to Devotion Mode'"
        >
          <span class="theme-toggle-icon">{{ isDevotion ? '☀️' : '🌙' }}</span>
          <span class="theme-toggle-label">{{ isDevotion ? 'Focus/Light Mode' : 'Devotion/Dark Mode' }}</span>
        </button>
        <button
          v-if="currentUser"
          @click="handleLogout"
          class="navbar-simple-auth-btn"
        >Logout</button>
        <router-link
          v-else
          to="/login"
          class="navbar-simple-auth-btn"
        >Login</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import logo from '../assets/logo_cross.png'

const props = defineProps({
  activeTab: {
    type: String,
    default: null
  }
})

const router = useRouter()
const route = useRoute()
const { currentUser, logout } = useAuth()
const { isDevotion, toggleTheme } = useTheme()

const mobileMenuOpen = ref(false)

const computedActiveTab = computed(() => {
  if (props.activeTab) {
    return props.activeTab
  }
  if (route.path === '/adults') {
    return route.query.tab || 'ask'
  }
  return null
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<style scoped>
.navbar-simple {
  width: 100%;
  background: var(--nav-bg, rgba(255, 255, 255, 0.95));
  border-bottom: 1px solid var(--border-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  transition: background 0.3s ease, border-color 0.3s ease;
}
.navbar-simple-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  padding: 0 1rem 0 1rem;
  height: 72px;
}
.navbar-simple-logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  text-decoration: none;
}

/* Logo image */
.navbar-simple-logo {
  height: 64px;
  width: auto;
  max-width: 290px;
  object-fit: contain;
  display: block;
  transition: filter 0.3s ease;
}

/* Brighten logo in Devotion Mode */
html[data-theme="devotion"] .navbar-simple-logo {
  filter: brightness(1.8) contrast(1.1);
}

/* Text container */
.navbar-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

/* Main site name */
.navbar-brand-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--brand-primary, #1f3b63);
  letter-spacing: 0.2px;
  transition: color 0.3s ease;
}

/* Sub tagline */
.navbar-brand-tagline {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--brand-secondary, #7b8fb3);
  letter-spacing: 0.3px;
  margin-top: 2px;
  transition: color 0.3s ease;
}

.navbar-simple-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0 auto;
}

.navbar-simple-link {
  text-decoration: none;
  color: var(--text-main, #333);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.35rem 0.7rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}
.navbar-simple-link:hover {
  background: var(--color-highlight, rgba(0, 0, 0, 0.06));
  color: var(--brand-primary, #007bff);
  border: 1px solid #0056b3;
}
.navbar-simple-link.active {
  background: var(--color-highlight, rgba(0, 0, 0, 0.06));
  color: var(--brand-primary, #007bff);
}
.navbar-simple-auth {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.navbar-simple-auth-btn {
  background: var(--button-bg, #12375fcc);
  color: var(--button-text, #fff);
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  text-decoration: none;
  display: inline-block;
}
.navbar-simple-auth-btn:hover {
  background: var(--color-primary-light, #0056b3);
  transform: translateY(-1px);
}

/* Theme Toggle Button */
.theme-toggle {
  margin-right: 0.5rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--toggle-border, rgba(200, 200, 210, 0.4));
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--brand-primary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.theme-toggle-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.theme-toggle-label {
  font-size: 0.7rem;
  letter-spacing: 0.01em;
}

.theme-toggle:hover {
  background: var(--brand-primary);
  color: var(--button-text, #fff);
  transform: scale(1.03);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.theme-toggle:focus {
  outline: none;
  border-color: var(--toggle-border, rgba(200, 200, 210, 0.4));
}

.theme-toggle:active {
  transform: scale(0.97);
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: auto;
  z-index: 51;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
  height: 20px;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--brand-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-icon.open span:nth-child(1) {
  transform: rotate(45deg) translateY(10px);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translateY(-10px);
}

/* Mobile Responsive Styles */
@media (max-width: 1280px) {
  .navbar-simple .mobile-menu-toggle {
    display: block;
  }
  
  .navbar-simple-row .navbar-brand-text {
    display: none;
  }
  
  .navbar-simple-row {
    flex-wrap: wrap;
  }
  
  .navbar-simple-logo {
    height: 48px;
  }
  
  .navbar-simple-row .navbar-simple-links {
    display: none !important;
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--nav-bg, rgba(255, 255, 255, 0.98));
    border-bottom: 1px solid var(--border-soft);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin: 0;
    padding: 1rem 0;
    backdrop-filter: blur(12px);
    z-index: 49;
  }
  
  .navbar-simple-row .navbar-simple-links.mobile-open {
    display: flex !important;
  }
  
  .navbar-simple-link {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0;
    border-bottom: 1px solid var(--border-soft, rgba(0, 0, 0, 0.05));
  }
  
  .navbar-simple-link:last-child {
    border-bottom: none;
  }
  
  .navbar-simple-auth {
    margin-left: 0;
    gap: 0.5rem;
  }
  
  .theme-toggle-label {
    display: none;
  }
  
  .theme-toggle {
    padding: 0.4rem 0.5rem;
  }
  
  .navbar-simple-auth-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .navbar-simple-logo {
    height: 48px;
  }
}

@media (max-width: 480px) {
  .navbar-simple-row {
    padding: 0 0.75rem;
  }
  
  .navbar-simple-logo {
    height: 40px;
  }
  
  .navbar-simple-auth-btn {
    padding: 0.35rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>

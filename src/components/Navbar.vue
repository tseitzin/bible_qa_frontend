<template>
  <nav class="navbar-simple">
    <div class="navbar-simple-row">
      <router-link to="/" class="navbar-simple-logo-link">
        <img :src="logo" alt="Word of Life Answers" class="navbar-simple-logo" />
      </router-link>
      <div class="navbar-simple-links">
        <router-link
          to="/"
          class="navbar-simple-link"
          :class="{ 'active': $route.path === '/' && !$route.path.includes('/adults') && !$route.path.includes('/kids') }"
        >Home</router-link>
        <router-link
          to="/adults"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'ask' }"
        >Ask Questions</router-link>
        <router-link
          to="/adults?tab=saved"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'saved' }"
        >Saved Answers</router-link>
        <router-link
          to="/adults?tab=study"
          class="navbar-simple-link"
          :class="{ 'active': computedActiveTab === 'study' }"
        >Bible Study</router-link>
        <router-link
          to="/kids"
          class="navbar-simple-link"
          :class="{ 'active': $route.path === '/kids' }"
        >Kids</router-link>
        <router-link
          v-if="currentUser?.is_admin"
          to="/admin/dashboard"
          class="navbar-simple-link"
          :class="{ 'active': $route.path.includes('/admin') }"
        >Admin</router-link>
      </div>
      <div class="navbar-simple-auth">
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
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
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
  flex-shrink: 0;
}
.navbar-simple-logo {
  height: 72px;
  width: auto;
  max-width: 340px;
  object-fit: contain;
  display: block;
}
.navbar-simple-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.navbar-simple-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}
.navbar-simple-link:hover {
  background: #e2e6ea;
  color: #007bff;
}
.navbar-simple-link.active {
  background: #e2e6ea;
  color: #007bff;
}
.navbar-simple-auth {
  margin-left: auto;
}
.navbar-simple-auth-btn {
  background: #12375fcc;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;
}
.navbar-simple-auth-btn:hover {
  background: #0056b3;
}
</style>

<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePageAnalytics } from './composables/usePageAnalytics.js'

const router = useRouter()
const { setupTracking, trackClick } = usePageAnalytics()

let cleanupAnalytics = null

// Setup analytics on mount
onMounted(() => {
  // Setup analytics tracking
  cleanupAnalytics = setupTracking()
  
  // Add global click tracking
  document.addEventListener('click', trackClick, true)
})

// Re-track page view on route changes
watch(() => router.currentRoute.value.path, () => {
  // When route changes, setup tracking again for the new page
  if (cleanupAnalytics) {
    cleanupAnalytics()
  }
  cleanupAnalytics = setupTracking()
})

// Cleanup on unmount
onUnmounted(() => {
  if (cleanupAnalytics) {
    cleanupAnalytics()
  }
  document.removeEventListener('click', trackClick, true)
})
</script>

<style>
/* Global app styles are handled in styles/base.css */
</style>
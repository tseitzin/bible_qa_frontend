import { createApp } from 'vue'
import './styles/base.css'
import App from './App.vue'
import router from './router'
import './services/axiosConfig' // Initialize axios interceptors
import { initTheme } from './composables/useTheme' // Theme initialization

// Initialize theme before mounting to prevent flash of wrong theme
initTheme()

createApp(App)
  .use(router)
  .mount('#app')

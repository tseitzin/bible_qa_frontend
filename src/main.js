import { createApp } from 'vue'
import './styles/base.css'
import App from './App.vue'
import router from './router'
import './services/axiosConfig' // Initialize axios interceptors

createApp(App)
  .use(router)
  .mount('#app')

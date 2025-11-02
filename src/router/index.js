import { createRouter, createWebHistory } from 'vue-router'
import MainApp from '../views/MainApp.vue'
import KidsApp from '../views/KidsApp.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import authService from '../services/authService'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Login - Bible Q&A',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Register - Bible Q&A',
      requiresGuest: true
    }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      title: 'Home - Bible Q&A',
      requiresAuth: true
    }
  },
  {
    path: '/',
    name: 'main',
    component: MainApp,
    meta: {
      title: 'Bible Q&A',
      requiresAuth: false
    }
  },
  {
    path: '/kids',
    name: 'kids',
    component: KidsApp,
    meta: {
      title: 'Kids Bible Q&A',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Bible Q&A'
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth) {
    // Validate token by checking with backend
    const user = await authService.getCurrentUser()
    if (!user) {
      // Token invalid or expired, redirect to login
      next('/login')
      return
    }
  } else if (requiresGuest) {
    // Check if user is authenticated
    const user = await authService.getCurrentUser()
    if (user) {
      // Already authenticated, redirect to home
      next('/home')
      return
    }
  }
  
  next()
})

export default router
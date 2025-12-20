import { createRouter, createWebHistory } from 'vue-router'
import MainApp from '../views/MainApp.vue'
import KidsApp from '../views/KidsApp.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import ReadingView from '../views/ReadingView.vue'
import ReadingPlanView from '../views/ReadingPlanView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import About from '../views/About.vue'
import AIScripture from '../views/AIScripture.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import Contact from '../views/Contact.vue'
import authService from '../services/authService'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Login',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Register',
      requiresGuest: true
    }
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Home',
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {
      title: 'About Word of Life Answers',
      requiresAuth: false
    }
  },
  {
    path: '/ai-scripture',
    name: 'ai-scripture',
    component: AIScripture,
    meta: {
      title: 'AI & Scripture',
      requiresAuth: false
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
    meta: {
      title: 'Privacy Policy',
      requiresAuth: false
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: {
      title: 'Terms of Use',
      requiresAuth: false
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    meta: {
      title: 'Contact',
      requiresAuth: false
    }
  },
  {
    path: '/adults',
    name: 'main',
    component: MainApp,
    meta: {
      title: 'Word of Life Answers',
      requiresAuth: false
    }
  },
  {
    path: '/reading',
    name: 'reading',
    component: ReadingView,
    meta: {
      title: 'Word of Life Answers',
      requiresAuth: false
    }
  },
  {
    path: '/reading-plans/:slug?',
    name: 'reading-plan',
    component: ReadingPlanView,
    meta: {
      title: 'Word of Life Answers',
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
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    alias: '/admin/dashboard',
    meta: {
      title: 'Word of Life Answers',
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { left: 0, top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Bible Q&A'
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  if (requiresAuth) {
    const user = await authService.getCurrentUser()
    if (!user) {
      next('/login')
      return
    }
    if (requiresAdmin && !user.is_admin) {
      next('/home')
      return
    }
  } else if (requiresGuest) {
    const storedUser = authService.getStoredUser()
    if (storedUser) {
      next({ name: 'home' })
      return
    }
  }
  next()
})

export default router
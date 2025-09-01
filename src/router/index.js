import { createRouter, createWebHistory } from 'vue-router'
import MainApp from '../views/MainApp.vue'
import KidsApp from '../views/KidsApp.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: MainApp,
    meta: {
      title: 'Bible Q&A'
    }
  },
  {
    path: '/kids',
    name: 'kids',
    component: KidsApp,
    meta: {
      title: 'Kids Bible Q&A'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Bible Q&A'
  next()
})

export default router
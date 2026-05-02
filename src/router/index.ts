import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import FilesView from '../views/FilesView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/files',
    },
    {
      path: '/login',
      component: LoginView,
      meta: {
        guestOnly: true,
        hideShell: true,
      },
    },
    {
      path: '/register',
      component: RegisterView,
      meta: {
        guestOnly: true,
        hideShell: true,
      },
    },
    {
      path: '/files',
      component: FilesView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

let attemptedSessionCheck = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!attemptedSessionCheck) {
    attemptedSessionCheck = true
    try {
      await authStore.fetchMe()
    } catch {
      authStore.me = null
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/files'
  }

  return true
})

export default router

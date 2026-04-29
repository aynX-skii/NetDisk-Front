<template>
  <div class="workspace-shell page-shell">
    <aside class="nav-panel glass-card">
      <div class="nav-brand">
        <div class="nav-brand__badge">ND</div>
        <div>
          <div class="nav-brand__title">NetDisk</div>
          <div class="nav-brand__subtitle">Phase One</div>
        </div>
      </div>

      <nav class="nav-links">
        <RouterLink class="nav-link" active-class="is-active" to="/files">文件空间</RouterLink>
        <RouterLink class="nav-link" active-class="is-active" to="/profile">个人资料</RouterLink>
      </nav>

      <div class="nav-footer">
        <div class="nav-user glass-chip">
          <div class="nav-user__name">{{ authStore.me?.nickname || authStore.me?.username }}</div>
          <div class="nav-user__meta">{{ authStore.me?.username }}</div>
        </div>
        <button class="ghost-button" @click="logout">退出登录</button>
      </div>
    </aside>

    <main class="content-panel">
      <slot />
    </main>

    <UploadDrawer />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'
import UploadDrawer from '../files/UploadDrawer.vue'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  await router.push('/login')
}
</script>

<style scoped>
.workspace-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 360px;
  gap: 20px;
}

.nav-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 48px);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-brand__badge {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #081423;
  background: linear-gradient(135deg, #63c7ff, #2ae0aa);
}

.nav-brand__title {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-brand__subtitle {
  color: var(--text-secondary);
}

.nav-links {
  display: grid;
  gap: 10px;
  margin-top: 32px;
}

.nav-link {
  padding: 14px 16px;
  border-radius: 16px;
  color: var(--text-secondary);
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-link.is-active,
.nav-link:hover {
  background: rgba(82, 177, 255, 0.12);
  color: var(--text-primary);
}

.nav-footer {
  margin-top: auto;
  display: grid;
  gap: 16px;
}

.glass-chip {
  border: 1px solid var(--border);
  background: rgba(8, 20, 35, 0.42);
  border-radius: 18px;
  padding: 14px 16px;
}

.nav-user__name {
  font-weight: 700;
}

.nav-user__meta {
  margin-top: 4px;
  color: var(--text-secondary);
}

.content-panel {
  min-width: 0;
}

@media (max-width: 1280px) {
  .workspace-shell {
    grid-template-columns: 240px minmax(0, 1fr);
  }
}

@media (max-width: 1024px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .nav-panel {
    min-height: auto;
  }
}
</style>

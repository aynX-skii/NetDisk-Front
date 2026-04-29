<template>
  <AppShell>
    <section class="profile-page glass-card">
      <div class="profile-hero">
        <div class="profile-avatar">
          <img v-if="authStore.me?.avatarUrl" :src="authStore.me.avatarUrl" alt="avatar" />
          <span v-else>{{ authStore.me?.nickname?.slice(0, 1) || authStore.me?.username?.slice(0, 1) }}</span>
        </div>
        <div>
          <div class="profile-title">{{ authStore.me?.nickname }}</div>
          <div class="profile-subtitle">{{ authStore.me?.username }}</div>
        </div>
      </div>

      <form class="profile-form" @submit.prevent="saveProfile">
        <div>
          <label class="field-label" for="nickname">昵称</label>
          <input id="nickname" v-model="nickname" class="text-input" required />
        </div>

        <div>
          <label class="field-label" for="avatar">头像</label>
          <input id="avatar" accept="image/*" class="text-input" type="file" @change="handleAvatar" />
        </div>

        <div v-if="message" class="profile-message">{{ message }}</div>

        <div class="profile-actions">
          <button class="gradient-button" type="submit">保存资料</button>
          <button class="ghost-button" type="button" @click="refreshProfile">重新拉取</button>
        </div>
      </form>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import AppShell from '../components/layout/AppShell.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const nickname = ref(authStore.me?.nickname ?? '')
const message = ref('')

watch(
  () => authStore.me,
  (value) => {
    nickname.value = value?.nickname ?? ''
  },
  { immediate: true },
)

async function saveProfile() {
  message.value = ''
  await authStore.updateProfile(nickname.value)
  message.value = '昵称已更新'
}

async function handleAvatar(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  await authStore.bindAvatar(file)
  message.value = '头像已更新'
  target.value = ''
}

async function refreshProfile() {
  await authStore.fetchMe()
  message.value = '资料已刷新'
}
</script>

<style scoped>
.profile-page {
  padding: 28px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 30px;
  overflow: hidden;
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(99, 199, 255, 0.25), rgba(42, 224, 170, 0.28));
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-title {
  font-size: 1.45rem;
  font-weight: 700;
}

.profile-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
}

.profile-form {
  display: grid;
  gap: 18px;
  max-width: 540px;
}

.profile-message {
  color: var(--accent-strong);
}

.profile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

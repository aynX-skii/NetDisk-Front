<template>
  <section class="auth-page page-shell">
    <div class="auth-grid">
      <div class="auth-copy">
        <div class="status-chip">
          <span class="status-dot"></span>
          现代化 Vue 前端
        </div>
        <h1>注册后，你会直接进入新的单页网盘工作台。</h1>
        <p>第一阶段聚焦核心网盘：登录注册、文件浏览、上传下载、目录管理和个人资料。</p>
      </div>

      <form class="auth-card glass-card" @submit.prevent="submit">
        <div>
          <div class="auth-card__title">创建账号</div>
          <div class="auth-card__subtitle">用一个昵称开始你的新空间。</div>
        </div>

        <div>
          <label class="field-label" for="username">用户名</label>
          <input id="username" v-model="username" class="text-input" autocomplete="username" required />
        </div>

        <div>
          <label class="field-label" for="nickname">昵称</label>
          <input id="nickname" v-model="nickname" class="text-input" autocomplete="nickname" required />
        </div>

        <div>
          <label class="field-label" for="password">密码</label>
          <input id="password" v-model="password" class="text-input" autocomplete="new-password" required type="password" />
        </div>

        <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>

        <button class="gradient-button" type="submit">注册并进入</button>
        <RouterLink class="auth-link" to="/login">已经有账号？返回登录</RouterLink>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const nickname = ref('')
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  try {
    await authStore.register({
      username: username.value,
      password: password.value,
      nickname: nickname.value,
    })
    await router.push('/files')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败'
  }
}
</script>

<style scoped>
.auth-page {
  display: grid;
  place-items: center;
}

.auth-grid {
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 440px);
  gap: 24px;
  align-items: center;
}

.auth-copy h1 {
  font-size: clamp(2.1rem, 4vw, 4rem);
  line-height: 1.1;
  margin: 22px 0 16px;
}

.auth-copy p {
  max-width: 560px;
  font-size: 1.08rem;
  color: var(--text-secondary);
}

.auth-card {
  padding: 28px;
  display: grid;
  gap: 18px;
}

.auth-card__title {
  font-size: 1.45rem;
  font-weight: 700;
}

.auth-card__subtitle,
.auth-link {
  color: var(--text-secondary);
}

.auth-error {
  color: #ff9dad;
}

@media (max-width: 920px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <section class="auth-page page-shell">
    <div class="auth-grid">
      <div class="auth-copy">
        <div class="status-chip">
          <span class="status-dot"></span>
          新上传链路已就绪
        </div>
        <h1>把高延迟环境下的目录上传，变成可恢复的正常体验。</h1>
        <p>
          新版 NetDisk 用批量准备、并发分片和续传队列替代旧的同步串行上传，前端保持可交互，后端统一走 v2 接口。
        </p>
      </div>

      <form class="auth-card glass-card" @submit.prevent="submit">
        <div>
          <div class="auth-card__title">欢迎回来</div>
          <div class="auth-card__subtitle">登录后进入你的文件空间。</div>
        </div>

        <div>
          <label class="field-label" for="username">用户名</label>
          <input id="username" v-model="username" class="text-input" autocomplete="username" required />
        </div>

        <div>
          <label class="field-label" for="password">密码</label>
          <input id="password" v-model="password" class="text-input" autocomplete="current-password" required type="password" />
        </div>

        <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>

        <button class="gradient-button" type="submit">登录</button>
        <RouterLink class="auth-link" to="/register">还没有账号？去注册</RouterLink>
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
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    })
    await router.push('/files')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
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
  font-size: clamp(2.3rem, 4vw, 4.2rem);
  line-height: 1.08;
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

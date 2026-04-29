<template>
  <aside class="upload-drawer glass-card" :class="{ 'is-collapsed': !uiStore.uploadDrawerOpen }">
    <header class="upload-header">
      <div>
        <div class="upload-title">传输中心</div>
        <div class="upload-subtitle">总进度 {{ uploadStore.overallProgress }}%</div>
      </div>
      <button class="ghost-button" @click="uiStore.toggleUploadDrawer()">
        {{ uiStore.uploadDrawerOpen ? '收起' : '展开' }}
      </button>
    </header>

    <div v-if="uiStore.uploadDrawerOpen" class="upload-body">
      <div class="upload-progress">
        <div class="upload-progress__bar" :style="{ width: `${uploadStore.overallProgress}%` }"></div>
      </div>

      <div v-if="!uploadStore.tasks.length" class="empty-state">上传队列会显示在这里。</div>

      <div v-for="task in uploadStore.tasks" :key="task.clientId" class="upload-task">
        <div class="upload-task__title">{{ task.file.name }}</div>
        <div class="upload-task__meta">
          <span>{{ task.status }}</span>
          <span>{{ task.progress }}%</span>
        </div>
        <div class="upload-progress upload-progress--small">
          <div class="upload-progress__bar" :style="{ width: `${task.progress}%` }"></div>
        </div>
        <div v-if="task.error" class="upload-task__error">{{ task.error }}</div>
        <div class="upload-task__actions">
          <button v-if="task.status === 'uploading'" class="ghost-button" @click="uploadStore.pause(task.clientId)">
            暂停
          </button>
          <button v-if="task.status === 'paused'" class="ghost-button" @click="uploadStore.resume(task.clientId)">
            继续
          </button>
          <button v-if="task.status === 'error'" class="ghost-button" @click="uploadStore.retry(task.clientId)">
            重试
          </button>
          <button
            v-if="!['completed', 'instant', 'canceled'].includes(task.status)"
            class="ghost-button is-danger"
            @click="uploadStore.cancel(task.clientId)"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUiStore } from '../../stores/ui'
import { useUploadStore } from '../../stores/upload'

const uiStore = useUiStore()
const uploadStore = useUploadStore()
</script>

<style scoped>
.upload-drawer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 48px);
}

.upload-drawer.is-collapsed {
  min-height: auto;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.upload-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.upload-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
}

.upload-body {
  margin-top: 18px;
  overflow: auto;
}

.upload-progress {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(8, 20, 35, 0.7);
}

.upload-progress--small {
  height: 7px;
}

.upload-progress__bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #63c7ff, #2ae0aa);
  transition: width 0.2s ease;
}

.upload-task {
  padding: 14px;
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: rgba(8, 20, 35, 0.5);
}

.upload-task__title {
  font-weight: 700;
}

.upload-task__meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  margin: 8px 0 12px;
}

.upload-task__error {
  color: #ff9dad;
  margin-top: 10px;
}

.upload-task__actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.is-danger {
  border-color: rgba(255, 107, 129, 0.3);
  color: #ff9dad;
}

@media (max-width: 1280px) {
  .upload-drawer {
    grid-column: 1 / -1;
    min-height: auto;
  }
}
</style>

<template>
  <section class="file-explorer glass-card">
    <header class="explorer-header">
      <div>
        <div class="explorer-title">文件空间</div>
        <div class="explorer-subtitle">拖拽文件即可上传，拖动条目到文件夹即可移动。</div>
      </div>
      <div class="explorer-actions">
        <button class="ghost-button" @click="$emit('create-directory')">新建文件夹</button>
        <button class="ghost-button" @click="$emit('select-files')">上传文件</button>
        <button class="gradient-button" @click="$emit('select-directory')">上传文件夹</button>
      </div>
    </header>

    <div class="breadcrumbs">
      <button
        v-for="crumb in breadcrumbs"
        :key="crumb.id"
        class="crumb"
        type="button"
        @click="$emit('open-directory', crumb.id)"
      >
        {{ crumb.name }}
      </button>
    </div>

    <div class="toolbar">
      <div class="toolbar__left">
        <span class="status-chip">
          <span class="status-dot"></span>
          {{ current?.name || '根目录' }}
        </span>
        <span class="status-chip">共 {{ items.length }} 项</span>
      </div>
      <div class="toolbar__right">
        <button class="ghost-button" @click="$emit('refresh')">刷新</button>
        <button class="ghost-button" @click="$emit('toggle-view', viewMode === 'list' ? 'grid' : 'list')">
          {{ viewMode === 'list' ? '卡片视图' : '列表视图' }}
        </button>
      </div>
    </div>

    <div class="drop-zone" @dragover.prevent @drop.prevent="$emit('drop-files', $event)">
      <div class="drop-zone__hint">拖拽文件到这里，或使用上方按钮选择文件 / 文件夹。</div>
    </div>

    <div v-if="!items.length" class="empty-state">这里还是空的，试试上传一个文件夹。</div>

    <div v-else :class="['items-panel', `is-${viewMode}`]">
      <article
        v-for="item in items"
        :key="item.id"
        :class="['item-card', { 'is-selected': selection.includes(item.id), 'is-directory': item.directory }]"
        draggable="true"
        @click="$emit('toggle-selection', item.id)"
        @dblclick="item.directory ? $emit('open-directory', item.id) : $emit('download-file', item.id)"
        @dragstart="$emit('drag-entry', item.id)"
        @dragover.prevent="item.directory && $emit('drag-over-folder', item.id)"
        @drop.prevent="item.directory && $emit('drop-entry-on-folder', item.id)"
      >
        <div class="item-card__icon">{{ item.directory ? 'DIR' : 'FILE' }}</div>
        <div class="item-card__body">
          <div class="item-card__title">{{ item.name }}</div>
          <div class="item-card__meta">
            <span>{{ item.directory ? '文件夹' : formatBytes(item.size) }}</span>
            <span>{{ formatDate(item.uploadDate) }}</span>
          </div>
        </div>
        <div class="item-card__actions">
          <button class="ghost-button" @click.stop="item.directory ? $emit('open-directory', item.id) : $emit('download-file', item.id)">
            {{ item.directory ? '打开' : '下载' }}
          </button>
          <button class="ghost-button is-danger" @click.stop="$emit('delete-entry', item.id)">删除</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Breadcrumb, FileEntry } from '../../types/api'
import { formatBytes, formatDate } from '../../utils/format'

defineProps<{
  current: FileEntry | null
  breadcrumbs: Breadcrumb[]
  items: FileEntry[]
  selection: number[]
  viewMode: 'list' | 'grid'
}>()

defineEmits<{
  (event: 'create-directory'): void
  (event: 'select-files'): void
  (event: 'select-directory'): void
  (event: 'open-directory', id: number): void
  (event: 'refresh'): void
  (event: 'toggle-view', mode: 'list' | 'grid'): void
  (event: 'drop-files', payload: DragEvent): void
  (event: 'toggle-selection', id: number): void
  (event: 'download-file', id: number): void
  (event: 'delete-entry', id: number): void
  (event: 'drag-entry', id: number): void
  (event: 'drag-over-folder', id: number): void
  (event: 'drop-entry-on-folder', id: number): void
}>()
</script>

<style scoped>
.file-explorer {
  padding: 24px;
}

.explorer-header,
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.explorer-title {
  font-size: 1.35rem;
  font-weight: 700;
}

.explorer-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
}

.explorer-actions,
.toolbar__right,
.toolbar__left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.breadcrumbs {
  display: flex;
  gap: 10px;
  margin: 18px 0;
  flex-wrap: wrap;
}

.crumb {
  border: 0;
  color: var(--text-secondary);
  background: transparent;
}

.drop-zone {
  margin: 18px 0 24px;
  padding: 20px;
  border-radius: 20px;
  border: 1px dashed rgba(82, 177, 255, 0.42);
  background: linear-gradient(135deg, rgba(82, 177, 255, 0.12), rgba(42, 224, 170, 0.08));
  color: var(--text-secondary);
}

.items-panel.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.items-panel.is-list {
  display: grid;
  gap: 12px;
}

.item-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: rgba(8, 20, 35, 0.48);
}

.item-card.is-selected {
  border-color: rgba(82, 177, 255, 0.5);
  box-shadow: inset 0 0 0 1px rgba(82, 177, 255, 0.18);
}

.item-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(82, 177, 255, 0.14);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.item-card__title {
  font-weight: 700;
}

.item-card__meta {
  margin-top: 6px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.item-card__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.is-danger {
  border-color: rgba(255, 107, 129, 0.3);
  color: #ff9dad;
}

@media (max-width: 900px) {
  .explorer-header,
  .toolbar,
  .item-card {
    grid-template-columns: 1fr;
    display: grid;
  }

  .item-card__actions {
    justify-content: flex-start;
  }
}
</style>

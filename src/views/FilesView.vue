<template>
  <AppShell>
    <FileExplorer
      :breadcrumbs="fileStore.breadcrumbs"
      :current="fileStore.current"
      :items="fileStore.items"
      :selection="fileStore.selection"
      :view-mode="fileStore.viewMode"
      @create-directory="createDirectory"
      @select-files="fileInput?.click()"
      @select-directory="directoryInput?.click()"
      @open-directory="fileStore.openDirectory"
      @refresh="fileStore.refresh"
      @toggle-view="fileStore.setViewMode"
      @drop-files="handleDrop"
      @toggle-selection="fileStore.toggleSelection"
      @download-file="downloadFile"
      @delete-entry="fileStore.deleteEntry"
      @drag-entry="handleDragStart"
      @drag-over-folder="() => undefined"
      @drop-entry-on-folder="handleFolderDrop"
    />

    <input ref="fileInput" class="sr-only" multiple type="file" @change="handleFiles" />
    <input ref="directoryInput" class="sr-only" multiple type="file" webkitdirectory @change="handleFiles" />
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppShell from '../components/layout/AppShell.vue'
import FileExplorer from '../components/files/FileExplorer.vue'
import { apiEndpoints } from '../api/endpoints'
import { useFileStore } from '../stores/file'
import { useUploadStore } from '../stores/upload'

const fileStore = useFileStore()
const uploadStore = useUploadStore()
const fileInput = ref<HTMLInputElement | null>(null)
const directoryInput = ref<HTMLInputElement | null>(null)
const draggedEntryId = ref<number | null>(null)

onMounted(async () => {
  if (!fileStore.current) {
    await fileStore.loadDirectory()
  }
})

async function createDirectory() {
  const name = window.prompt('请输入文件夹名称')
  if (!name) {
    return
  }

  await fileStore.createDirectory(name)
}

async function handleFiles(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  if (!files.length || !fileStore.current) {
    return
  }

  await uploadStore.enqueue(files, fileStore.current.id)
  target.value = ''
}

async function handleDrop(event: DragEvent) {
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (!files.length || !fileStore.current) {
    return
  }

  await uploadStore.enqueue(files, fileStore.current.id)
}

function handleDragStart(id: number) {
  if (!fileStore.selection.includes(id)) {
    fileStore.selectOnly(id)
  }
  draggedEntryId.value = id
}

async function handleFolderDrop(folderId: number) {
  const ids = fileStore.selection.length ? fileStore.selection : draggedEntryId.value ? [draggedEntryId.value] : []
  if (!ids.length) {
    return
  }

  await fileStore.move(ids, folderId)
  draggedEntryId.value = null
}

function downloadFile(id: number) {
  window.open(apiEndpoints.files.download(id), '_blank')
}
</script>

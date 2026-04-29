import { defineStore } from 'pinia'

import { apiEndpoints } from '../api/endpoints'
import { http, unwrap } from '../api/http'
import type { FileDirectoryPayload, FileEntry } from '../types/api'

export const useFileStore = defineStore('files', {
  state: () => ({
    current: null as FileEntry | null,
    breadcrumbs: [] as FileDirectoryPayload['breadcrumbs'],
    items: [] as FileEntry[],
    loading: false,
    selection: [] as number[],
    viewMode: 'list' as 'list' | 'grid',
  }),
  getters: {
    selectedItems(state) {
      return state.items.filter((item) => state.selection.includes(item.id))
    },
  },
  actions: {
    async loadDirectory(parentId?: number) {
      this.loading = true
      try {
        const data = await unwrap<FileDirectoryPayload>(http.get(apiEndpoints.files.list(parentId)))
        this.current = data.current
        this.breadcrumbs = data.breadcrumbs
        this.items = data.items
        this.selection = []
      } finally {
        this.loading = false
      }
    },
    async refresh() {
      await this.loadDirectory(this.current?.id)
    },
    async openDirectory(id: number) {
      await this.loadDirectory(id)
    },
    setViewMode(mode: 'list' | 'grid') {
      this.viewMode = mode
    },
    toggleSelection(id: number) {
      if (this.selection.includes(id)) {
        this.selection = this.selection.filter((value) => value !== id)
      } else {
        this.selection = [...this.selection, id]
      }
    },
    selectOnly(id: number) {
      this.selection = [id]
    },
    clearSelection() {
      this.selection = []
    },
    async createDirectory(name: string) {
      await unwrap<FileEntry>(
        http.post(apiEndpoints.files.createDirectory, {
          parentId: this.current?.id,
          name,
        }),
      )
      await this.refresh()
    },
    async deleteEntry(id: number) {
      await unwrap<void>(http.delete(apiEndpoints.files.detail(id)))
      await this.refresh()
    },
    async move(ids: number[], targetParentId: number) {
      await unwrap<void>(
        http.post(apiEndpoints.files.move, {
          ids,
          targetParentId,
        }),
      )
      await this.refresh()
    },
  },
})

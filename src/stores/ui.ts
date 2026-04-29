import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    uploadDrawerOpen: true,
    pageMessage: '' as string | null,
  }),
  actions: {
    toggleUploadDrawer() {
      this.uploadDrawerOpen = !this.uploadDrawerOpen
    },
    setMessage(message: string | null) {
      this.pageMessage = message
    },
  },
})

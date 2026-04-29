import { defineStore } from 'pinia'

import { apiEndpoints } from '../api/endpoints'
import { http, unwrap } from '../api/http'
import type { UserProfile } from '../types/api'

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload extends LoginPayload {
  nickname: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    me: null as UserProfile | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.me),
  },
  actions: {
    async fetchMe() {
      this.loading = true

      try {
        this.me = await unwrap<UserProfile>(http.get(apiEndpoints.me.profile))
        return this.me
      } catch (error) {
        this.me = null
        throw error
      } finally {
        this.loading = false
      }
    },
    async login(payload: LoginPayload) {
      await unwrap<UserProfile>(http.post(apiEndpoints.auth.login, payload))
      await this.fetchMe()
    },
    async register(payload: RegisterPayload) {
      await unwrap<UserProfile>(http.post(apiEndpoints.auth.register, payload))
      await this.fetchMe()
    },
    async updateProfile(nickname: string) {
      this.me = await unwrap<UserProfile>(http.patch(apiEndpoints.me.profile, { nickname }))
    },
    async bindAvatar(file: File) {
      const formData = new FormData()
      formData.append('file', file)
      this.me = await unwrap<UserProfile>(
        http.post(apiEndpoints.me.avatar, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      )
    },
    async logout() {
      await unwrap<void>(http.post(apiEndpoints.auth.logout))
      this.me = null
    },
  },
})

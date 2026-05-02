const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const API_V2 = `${apiOrigin}/api/v2`

export const apiEndpoints = {
  auth: {
    login: `${API_V2}/auth/login`,
    register: `${API_V2}/auth/register`,
    logout: `${API_V2}/auth/logout`,
  },
  me: {
    profile: `${API_V2}/me`,
    avatar: `${API_V2}/me/avatar`,
  },
  files: {
    list(parentId?: number) {
      return typeof parentId === 'number' ? `${API_V2}/files?parentId=${encodeURIComponent(parentId)}` : `${API_V2}/files`
    },
    detail(id: number) {
      return `${API_V2}/files/${id}`
    },
    download(id: number, inline = false) {
      return `${API_V2}/files/${id}/download${inline ? '?inline=true' : ''}`
    },
    createDirectory: `${API_V2}/directories`,
    move: `${API_V2}/files/move`,
  },
  uploads: {
    prepare: `${API_V2}/uploads/prepare`,
    session(uploadId: string) {
      return `${API_V2}/uploads/${uploadId}`
    },
    part(uploadId: string, partNumber: number) {
      return `${API_V2}/uploads/${uploadId}/parts/${partNumber}`
    },
    complete(uploadId: string) {
      return `${API_V2}/uploads/${uploadId}/complete`
    },
  },
}

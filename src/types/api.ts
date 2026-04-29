export interface ApiResponse<T> {
  code: string
  message: string
  data: T
  requestId: string
}

export interface UserProfile {
  id: number
  username: string
  nickname: string
  status: boolean
  imgServiceId: number
  avatarUrl: string | null
}

export interface Breadcrumb {
  id: number
  name: string
}

export interface FileEntry {
  id: number
  name: string
  directory: boolean
  status: boolean
  parentId: number | null
  uploadDate: string
  size: number
  fileHash: string | null
  downloadUrl: string | null
}

export interface FileDirectoryPayload {
  current: FileEntry
  breadcrumbs: Breadcrumb[]
  items: FileEntry[]
}

export interface UploadPrepareFile {
  clientId: string
  name: string
  size: number
  relativePath: string
  md5?: string
}

export interface UploadPrepareDirectory {
  clientId: string
  path: string
}

export interface UploadPrepareResponse {
  createdDirectories: Array<{
    path: string
    directoryId: number
  }>
  instantFiles: Array<{
    clientId: string
    fileId: number
    message: string
  }>
  uploadSessions: Array<{
    uploadId: string
    clientId: string
    targetParentId: number
    chunkSize: number
    totalParts: number
    uploadedParts: number[]
    expiresAt: string
  }>
  conflicts: Array<{
    clientId: string
    path: string
    reason: string
  }>
}

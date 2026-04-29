import type { UploadPrepareDirectory, UploadPrepareFile } from '../types/api'

import { createClientId } from './format'

export interface UploadBatchItem {
  clientId: string
  file: File
  relativePath: string
  md5?: string
}

export interface UploadSelectionPlan {
  directories: UploadPrepareDirectory[]
  files: UploadPrepareFile[]
  items: UploadBatchItem[]
}

export function buildUploadSelection(files: File[]): UploadSelectionPlan {
  const directoryMap = new Map<string, UploadPrepareDirectory>()
  const items: UploadBatchItem[] = []

  for (const file of files) {
    const clientId = createClientId()
    const fullPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
    const segments = fullPath.split('/').filter(Boolean)
    const relativeDirectory = segments.slice(0, -1).join('/')

    if (relativeDirectory) {
      const parts = relativeDirectory.split('/')
      for (let index = 0; index < parts.length; index += 1) {
        const path = parts.slice(0, index + 1).join('/')
        if (!directoryMap.has(path)) {
          directoryMap.set(path, {
            clientId: createClientId(),
            path,
          })
        }
      }
    }

    items.push({
      clientId,
      file,
      relativePath: relativeDirectory,
    })
  }

  return {
    directories: Array.from(directoryMap.values()).sort((left, right) => left.path.localeCompare(right.path)),
    files: items.map((item) => ({
      clientId: item.clientId,
      name: item.file.name,
      size: item.file.size,
      relativePath: item.relativePath,
      md5: item.md5,
    })),
    items,
  }
}

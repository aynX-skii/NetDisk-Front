import { defineStore } from 'pinia'

import { apiEndpoints } from '../api/endpoints'
import { http, unwrap } from '../api/http'
import type { UploadPrepareResponse } from '../types/api'
import { computeMd5 } from '../utils/hashing'
import { buildUploadSelection, type UploadSelectionPlan } from '../utils/upload-plan'
import { useFileStore } from './file'

const CHUNK_SIZE = 8 * 1024 * 1024
const MAX_FILE_CONCURRENCY = 3
const MAX_PART_CONCURRENCY = 3
const SMALL_FILE_HASH_THRESHOLD = 64 * 1024 * 1024

type UploadStatus =
  | 'queued'
  | 'hashing'
  | 'preparing'
  | 'uploading'
  | 'paused'
  | 'completed'
  | 'instant'
  | 'error'
  | 'canceled'

interface UploadTask {
  clientId: string
  file: File
  relativePath: string
  uploadId: string | null
  totalParts: number
  uploadedParts: number[]
  status: UploadStatus
  progress: number
  error: string | null
  expiresAt: string | null
  active: boolean
}

const controllers = new Map<string, Map<number, AbortController>>()

function isStopped(status: UploadStatus): boolean {
  return status === 'paused' || status === 'canceled'
}

function calculateProgress(task: UploadTask): number {
  if (!task.totalParts) {
    return task.status === 'completed' || task.status === 'instant' ? 100 : 0
  }

  return Math.min(100, Math.round((task.uploadedParts.length / task.totalParts) * 100))
}

export const useUploadStore = defineStore('uploads', {
  state: () => ({
    tasks: [] as UploadTask[],
    runningCount: 0,
  }),
  getters: {
    activeTasks(state) {
      return state.tasks.filter((task) => !['completed', 'instant', 'canceled'].includes(task.status))
    },
    overallProgress(state) {
      if (!state.tasks.length) {
        return 0
      }

      return Math.round(
        state.tasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(1, state.tasks.length),
      )
    },
  },
  actions: {
    async enqueue(files: File[], parentId: number) {
      const plan = buildUploadSelection(files)

      for (const item of plan.items) {
        this.tasks.unshift({
          clientId: item.clientId,
          file: item.file,
          relativePath: item.relativePath,
          uploadId: null,
          totalParts: 0,
          uploadedParts: [],
          status: 'queued',
          progress: 0,
          error: null,
          expiresAt: null,
          active: false,
        })
      }

      await this.prepareBatch(plan, parentId)
      this.pumpQueue()
    },
    async prepareBatch(plan: UploadSelectionPlan, parentId: number) {
      for (const filePayload of plan.files) {
        const task = this.tasks.find((entry) => entry.clientId === filePayload.clientId)
        if (!task) {
          continue
        }

        if (task.file.size <= SMALL_FILE_HASH_THRESHOLD) {
          task.status = 'hashing'
          filePayload.md5 = await computeMd5(task.file)
        }

        task.status = 'preparing'
      }

      const prepare = await unwrap<UploadPrepareResponse>(
        http.post(apiEndpoints.uploads.prepare, {
          parentId,
          directories: plan.directories,
          files: plan.files,
        }),
      )

      for (const instantFile of prepare.instantFiles) {
        const task = this.tasks.find((entry) => entry.clientId === instantFile.clientId)
        if (task) {
          task.status = 'instant'
          task.progress = 100
          task.error = null
        }
      }

      for (const session of prepare.uploadSessions) {
        const task = this.tasks.find((entry) => entry.clientId === session.clientId)
        if (!task) {
          continue
        }

        task.uploadId = session.uploadId
        task.totalParts = session.totalParts
        task.uploadedParts = [...session.uploadedParts]
        task.progress = calculateProgress(task)
        task.expiresAt = session.expiresAt
        task.status = 'queued'
      }

      for (const conflict of prepare.conflicts) {
        const task = this.tasks.find((entry) => entry.clientId === conflict.clientId)
        if (task) {
          task.status = 'error'
          task.error = conflict.reason
        }
      }

      const fileStore = useFileStore()
      await fileStore.refresh()
    },
    pumpQueue() {
      const available = MAX_FILE_CONCURRENCY - this.runningCount
      if (available <= 0) {
        return
      }

      const tasks = this.tasks.filter((task) => task.uploadId && task.status === 'queued' && !task.active)
      tasks.slice(0, available).forEach((task) => {
        void this.processTask(task.clientId)
      })
    },
    async processTask(clientId: string) {
      const task = this.tasks.find((entry) => entry.clientId === clientId)
      if (!task || !task.uploadId || task.active) {
        return
      }

      const uploadId = task.uploadId
      task.active = true
      task.status = 'uploading'
      task.error = null
      this.runningCount += 1

      try {
        const uploaded = new Set(task.uploadedParts)
        const partNumbers = Array.from({ length: task.totalParts }, (_, index) => index + 1).filter(
          (part) => !uploaded.has(part),
        )

        let cursor = 0
        const uploadPart = async () => {
          while (cursor < partNumbers.length && task.status === 'uploading') {
            const partNumber = partNumbers[cursor]
            cursor += 1

            const start = (partNumber - 1) * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, task.file.size)
            const blob = task.file.slice(start, end)
            const controller = new AbortController()
            const taskControllers = controllers.get(clientId) ?? new Map<number, AbortController>()
            taskControllers.set(partNumber, controller)
            controllers.set(clientId, taskControllers)

            try {
              await http.put(apiEndpoints.uploads.part(uploadId, partNumber), blob, {
                headers: {
                  'Content-Type': 'application/octet-stream',
                },
                signal: controller.signal,
              })

              uploaded.add(partNumber)
              task.uploadedParts = Array.from(uploaded).sort((left, right) => left - right)
              task.progress = calculateProgress(task)
            } finally {
              taskControllers.delete(partNumber)
            }
          }
        }

        await Promise.all(Array.from({ length: MAX_PART_CONCURRENCY }, () => uploadPart()))

        if (isStopped(task.status)) {
          return
        }

        await unwrap<void>(http.post(apiEndpoints.uploads.complete(uploadId)))
        task.status = 'completed'
        task.progress = 100
        const fileStore = useFileStore()
        await fileStore.refresh()
      } catch (error) {
        if (isStopped(task.status)) {
          return
        }

        task.status = 'error'
        task.error = error instanceof Error ? error.message : '上传失败'
      } finally {
        task.active = false
        this.runningCount = Math.max(0, this.runningCount - 1)
        this.pumpQueue()
      }
    },
    pause(clientId: string) {
      const task = this.tasks.find((entry) => entry.clientId === clientId)
      if (!task) {
        return
      }

      task.status = 'paused'
      controllers.get(clientId)?.forEach((controller) => controller.abort())
    },
    async resume(clientId: string) {
      const task = this.tasks.find((entry) => entry.clientId === clientId)
      if (!task || !task.uploadId) {
        return
      }

      const session = await unwrap<UploadPrepareResponse['uploadSessions'][number]>(
        http.get(apiEndpoints.uploads.session(task.uploadId)),
      )
      task.uploadedParts = [...session.uploadedParts]
      task.totalParts = session.totalParts
      task.progress = calculateProgress(task)
      task.status = 'queued'
      this.pumpQueue()
    },
    async cancel(clientId: string) {
      const task = this.tasks.find((entry) => entry.clientId === clientId)
      if (!task) {
        return
      }

      task.status = 'canceled'
      controllers.get(clientId)?.forEach((controller) => controller.abort())
      if (task.uploadId) {
        await unwrap<void>(http.delete(apiEndpoints.uploads.session(task.uploadId)))
      }
    },
    retry(clientId: string) {
      const task = this.tasks.find((entry) => entry.clientId === clientId)
      if (!task) {
        return
      }

      task.error = null
      task.status = 'queued'
      this.pumpQueue()
    },
  },
})

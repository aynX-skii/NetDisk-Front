import axios, { type AxiosResponse } from 'axios'

import type { ApiResponse } from '../types/api'

export const http = axios.create({
  withCredentials: true,
})

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || '请求失败'
  }

  return error instanceof Error ? error.message : '请求失败'
}

export async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  let response: AxiosResponse<ApiResponse<T>>

  try {
    response = await request
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }

  const payload = response.data

  if (payload.code !== 'OK') {
    throw new Error(payload.message || '请求失败')
  }

  return payload.data
}

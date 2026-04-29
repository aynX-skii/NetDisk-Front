export async function computeMd5(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(new URL('../workers/hash.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event: MessageEvent<{ hash?: string; error?: string }>) => {
      worker.terminate()
      if (event.data.error) {
        reject(new Error(event.data.error))
      } else if (event.data.hash) {
        resolve(event.data.hash)
      } else {
        reject(new Error('无法计算文件指纹'))
      }
    }

    worker.onerror = (event) => {
      worker.terminate()
      reject(event.error ?? new Error('Worker 执行失败'))
    }

    worker.postMessage(file)
  })
}

import SparkMD5 from 'spark-md5'

self.onmessage = async (event: MessageEvent<File>) => {
  try {
    const buffer = await event.data.arrayBuffer()
    const hash = SparkMD5.ArrayBuffer.hash(buffer)
    self.postMessage({ hash })
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : '哈希计算失败',
    })
  }
}

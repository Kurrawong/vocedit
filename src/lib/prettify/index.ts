// Worker singleton
let worker: Worker | null = null
let messageId = 0
const pendingMessages = new Map<
  number,
  { resolve: (value: string) => void; reject: (error: Error) => void }
>()

function initWorker() {
  if (!window.Worker) {
    throw new Error('Web Workers are not supported in this browser')
  }

  if (!worker) {
    worker = new Worker(new URL('@/lib/prettify/rdflib-worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event) => {
      const { id, ok, data, error } = event.data
      const pending = pendingMessages.get(id)

      if (pending) {
        pendingMessages.delete(id)
        if (ok) {
          pending.resolve(data)
        } else {
          pending.reject(new Error(error))
        }
      }
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      // Reject all pending messages
      for (const [id, pending] of pendingMessages) {
        pending.reject(new Error('Worker error'))
        pendingMessages.delete(id)
      }
    }
  }
  return worker
}

export function prettify(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!data.trim()) {
      resolve('')
      return
    }

    const currentWorker = initWorker()
    const id = ++messageId

    pendingMessages.set(id, { resolve, reject })

    // Set a timeout to avoid hanging indefinitely
    setTimeout(() => {
      if (pendingMessages.has(id)) {
        pendingMessages.delete(id)
        reject(new Error('Request timeout'))
      }
    }, 60000) // 60 second timeout

    currentWorker.postMessage({ id, data })
  })
}

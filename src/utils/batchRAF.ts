type Callback = (ts: number) => void

let callbacks: Set<Callback> = new Set()
let batching = false

export function batchRequestAnimationFrame(callback: Callback) {
  callbacks.add(callback)
  if (!batching) {
    batching = true
    requestAnimationFrame((ts: number) => {
      const batch = callbacks
      batching = false
      callbacks = new Set()
      batch.forEach(f => f(ts))
      // console.debug('batchRAF', batch.size, 'execution time (ms)', performance.now() - ts)
    })
  }
}

export function removeFromBatchAnimationFrame(callback: Callback) {
  callbacks.delete(callback)
}

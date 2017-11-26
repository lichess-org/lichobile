let callbacks: Set<() => void> = new Set()
let batching = false

type Callback = (ts?: number) => void

export function batchRequestAnimationFrame(callback: Callback) {
  callbacks.add(callback)
  if (!batching) {
    batching = true
    requestAnimationFrame((ts: number) => {
      const batch = callbacks
      batching = false
      callbacks = new Set()
      // console.log(Array.from(batch).map(f => f.name))
      batch.forEach((f: Callback) => f(ts))
    })
  }
}

export function removeFromBatchAnimationFrame(callback: Callback) {
  callbacks.delete(callback)
}

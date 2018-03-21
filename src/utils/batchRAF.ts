type Callback = (ts?: number) => void

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
      // console.log(Array.from(batch).map(f => f.name))
      batch.forEach(f => f(ts))
    })
  }
}

export function removeFromBatchAnimationFrame(callback: Callback) {
  callbacks.delete(callback)
}

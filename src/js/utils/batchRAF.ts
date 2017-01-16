let callbacks: Set<() => void> = new Set()
let batching = false

function callSelf(f: () => void) {
  f();
}

export function batchRequestAnimationFrame(callback: () => void) {
  callbacks.add(callback)
  if (!batching) {
    batching = true
    requestAnimationFrame(() => {
      const batch = callbacks
      batching = false
      callbacks = new Set()
      // console.log(Array.from(batch).map(f => f.name))
      batch.forEach(callSelf)
    })
  }
}

export function removeFromBatchAnimationFrame(callback: () => void) {
  callbacks.delete(callback)
}

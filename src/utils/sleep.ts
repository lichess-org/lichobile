const IDLE_TIMER_DELAY = 15 * 60 * 1000
const SLEEP_DELAY = 60 * 60 * 1000

let sleepAgainTimeoutId: number
let cancelTimer: (() => void) | undefined

export function keepAwake() {
  window.plugins.insomnia.keepAwake()
  if (cancelTimer !== undefined) {
    cancelTimer()
  }
  cancelTimer = idleTimer(
    IDLE_TIMER_DELAY,
    () => {
      sleepAgainTimeoutId = setTimeout(() => {
        window.plugins.insomnia.allowSleepAgain()
      }, SLEEP_DELAY)
    },
    () => {
      clearTimeout(sleepAgainTimeoutId)
    }
  )
}

export function allowSleepAgain() {
  if (cancelTimer !== undefined) {
    cancelTimer()
    cancelTimer = undefined
  }
  // workaround for nasty bug (Uncaught RangeError: Maximum call stack size exceeded)
  // on older webviews
  // TODO investigate this
  setTimeout(() => {
    window.plugins.insomnia.allowSleepAgain()
  })
}

function idleTimer(delay: number, onIdle: () => void, onWakeUp: () => void): () => void {
  const events = ['touchstart']
  let listening = false
  let active = true
  let lastSeenActive = Date.now()
  let intervalID: number
  const onActivity = () => {
    if (!active) {
      // console.log('Wake up')
      onWakeUp()
    }
    active = true
    lastSeenActive = Date.now()
    stopListening()
  }
  const startListening = () => {
    if (!listening) {
      events.forEach((e) => {
        document.addEventListener(e, onActivity)
      })
      listening = true
    }
  }
  const stopListening = () => {
    if (listening) {
      events.forEach((e) => {
        document.removeEventListener(e, onActivity)
      })
      listening = false
    }
  }
  const cancel = () => {
    clearInterval(intervalID)
    stopListening()
  }
  intervalID = setInterval(() => {
    if (active && Date.now() - lastSeenActive > delay) {
      // console.log('Idle mode')
      onIdle()
      active = false
    }
    startListening()
  }, 30 * 1000)

  return cancel
}

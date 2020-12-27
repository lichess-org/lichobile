type Callback = (...args: any[]) => void
export default function backoff(delay: number, factor: number, callback: Callback): Callback {
  let timer: number | undefined
  let lastExec = 0

  return (...args: any[]): void => {
    const elapsed = performance.now() - lastExec

    const exec = () => {
      timer = undefined
      lastExec = performance.now()
      delay *= factor
      callback(args)
    }

    if (timer) clearTimeout(timer)

    if (elapsed > delay) exec()
    else timer = setTimeout(exec, delay - elapsed)
  }
}

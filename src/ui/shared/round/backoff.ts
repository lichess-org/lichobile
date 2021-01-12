type Callback<T> = (...args: T[]) => void
export default function backoff<T>(delay: number, factor: number, callback: Callback<T>): Callback<T> {
  let timer: number | undefined
  let lastExec = 0

  return (...args: T[]): void => {
    const elapsed = performance.now() - lastExec

    const exec = () => {
      timer = undefined
      lastExec = performance.now()
      delay *= factor
      callback(...args)
    }

    if (timer) clearTimeout(timer)

    if (elapsed > delay) exec()
    else timer = setTimeout(exec, delay - elapsed)
  }
}

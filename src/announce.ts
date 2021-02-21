import asyncStorage from './asyncStorage'
import redraw from './utils/redraw'

const STORAGE_KEY = 'announce'

export interface Announcement {
  msg: string
  date: string
}

let announce: Announcement | undefined

function keyOf(a: Announcement): string {
  return a.date // includes milliseconds, effectively unique
}

export function get(): Announcement | undefined {
  return announce
}

export async function set(a?: Announcement): Promise<void> {
  if (a) {
    const newKey = keyOf(a)
    const existing = await asyncStorage.get<string[]>(STORAGE_KEY)
    if (existing?.includes(newKey)) {
      // previously dismissed, no-op
      return
    }
  }
  announce = a
  redraw()
}

export async function dismiss(): Promise<void> {
  if (announce === undefined) {
    return
  }
  const dismissKey = keyOf(announce)

  // clear the announcement
  announce = undefined
  redraw()

  // clean up existing dismissed cache and add this new entry
  const existingDismissed = await asyncStorage.get<string[]>(STORAGE_KEY)
  const newDismissed = (existingDismissed || []).filter(dateStr => (new Date(dateStr) >= new Date()))
  newDismissed.push(dismissKey)
  await asyncStorage.set(STORAGE_KEY, newDismissed)

}

export default {
  get,
  set,
  dismiss,
}

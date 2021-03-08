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

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

export function get(): Announcement | undefined {
  if (announce && isExpired(announce.date)) {
    announce = undefined
  }
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
  const newDismissed = (existingDismissed || []).filter(dateStr => !isExpired(dateStr))
  newDismissed.push(dismissKey)
  await asyncStorage.set(STORAGE_KEY, newDismissed)

}

export default {
  get,
  set,
  dismiss,
}

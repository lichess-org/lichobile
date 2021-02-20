export interface Announcement {
  msg: string
  date: string
}

let announce: Announcement | undefined

export function get(): Announcement | undefined {
  return announce
}

export function set(a: Announcement | undefined): void {
  announce = a
}

export default {
  get,
  set,
}

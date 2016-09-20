export interface InboxData {
  threads: Array<Thread>
}

export interface Thread {
  id: string
  author: string
  name: string
  updatedAt: number
  isUnread: boolean
}

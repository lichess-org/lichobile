export interface InboxState {
  threads: Mithril.Property<PagedThreads>
  isLoading: Mithril.Property<boolean>
  first: () => void
  prev: () => void
  next: () => void
  last: () => void
}

export interface PagedThreads {
  currentPage: number
  currentPageResults: Array<Thread>
  maxPerPage: number
  nbPages: number
  nbResults: number
  nextPage: number
  previousPage: number
}

export interface Thread {
  id: string
  author: string
  name: string
  isUnread: boolean
  updatedAt: number
}

export interface ThreadState {
  id: Mithril.Property<string>
  thread: Mithril.Property<ThreadData>
  deleteAttempted: Mithril.Property<boolean>
  sendResponse: (form: HTMLFormElement) => void
  deleteThread: (id: string) => void
}

export interface ThreadAttrs {
  id: string
}

export interface ThreadData {
  id: string
  name: string
  posts: Array<Post>
}

export interface Post {
  sender: User
  receiver: User
  createdAt: number
  text: string
}

export interface User {
  online: boolean
  username: string
}

export interface ComposeAttrs {
  id: string
}

export interface ComposeState {
  id: Mithril.Property<string>
  errors: Mithril.Property<SendErrorResponse>
  send: (form: HTMLFormElement) => void
}

export interface SendErrorResponse {
  username: Array<string>
  subject: Array<string>
  text: Array<string>
}

export interface ComposeResponse {
  ok: string
  id: string
}

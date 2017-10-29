import { User } from '../../lichess/interfaces/user'

export interface InboxState {
  threads: Mithril.Stream<PagedThreads>
  isLoading: Mithril.Stream<boolean>
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
  id: Mithril.Stream<string>
  thread: Mithril.Stream<ThreadData>
  deleteAttempted: Mithril.Stream<boolean>
  sendResponse: (form: HTMLFormElement) => void
  deleteThread: (id: string) => void
  onKeyboardShow(e: Event): void
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

export interface ComposeResponse {
  ok: string
  id: string
}

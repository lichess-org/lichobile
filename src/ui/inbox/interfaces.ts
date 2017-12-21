import { User } from '../../lichess/interfaces/user'

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

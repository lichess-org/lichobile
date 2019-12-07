import Stream from 'mithril/stream'
import { Related } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'

export interface IRelationCtrl {
  related: Stream<Related[] | null>
  loadNextPage: (page: number) => void
  isLoadingNextPage: Stream<boolean>
  toggleFollowing: (obj: Related) => void
  challenge: (id: string) => void
  paginator: Stream<Paginator<Related> | undefined>
}

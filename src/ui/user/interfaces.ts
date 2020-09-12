import { Prop } from '~/utils'
import { Related } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'

export interface IRelationCtrl {
  related: Prop<Related[] | null>
  loadNextPage: (page: number) => void
  isLoadingNextPage: Prop<boolean>
  toggleFollowing: (obj: Related) => void
  challenge: (id: string) => void
  paginator: Prop<Paginator<Related> | undefined>
}

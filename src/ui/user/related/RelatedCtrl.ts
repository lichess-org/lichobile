import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'
import challengeForm from '../../challengeForm'

export default class RelatedCtrl {
  isLoadingNextPage = false

  following?: readonly Related[]
  followingPaginator?: Paginator<Related>

  constructor(readonly userId: string, readonly defaultTab?: number) {
    socket.createDefault()

    this.getData(this.userId, 1)
    .then(redraw)
    .catch(handleXhrError)
  }

  public loadNextPage = (page: number) => {
    this.isLoadingNextPage = true
    this.getData(this.userId, page)
    .then(() => {
      this.isLoadingNextPage = false
      redraw()
    })
    .catch(handleXhrError)
    redraw()
  }

  public toggleFollowing = (obj: Related) => {
    if (obj.relation) xhr.unfollow(obj.user).then(d => this.setNewUserState(obj, d))
    else xhr.follow(obj.user).then(d => this.setNewUserState(obj, d))
  }

  public challenge = (id: string) => {
    challengeForm.open(id)
  }

  private getData(userId: string, page: number): Promise<void> {
    return xhr.following(userId, page)
      .then(d => {
        this.following = (this.following || []).concat(d.paginator.currentPageResults)
        this.followingPaginator = d.paginator
      })
  }

  private setNewUserState(obj: Related, newData: xhr.RelationActionResult) {
    obj.relation = newData.following
    redraw()
  }
}

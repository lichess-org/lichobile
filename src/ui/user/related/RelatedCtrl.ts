import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'
import challengeForm from '../../challengeForm'

export default class RelatedCtrl {
  currentTab: number

  isLoadingNextPage = false

  followers?: readonly Related[]
  followersPaginator?: Paginator<Related>

  following?: readonly Related[]
  followingPaginator?: Paginator<Related>

  constructor(readonly userId: string, readonly defaultTab?: number) {
    this.currentTab = defaultTab || 0
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

  public onTabChange = (tabIndex: number) => {
    const loc = window.location.search.replace(/\?tab=\w+$/, '')
    try {
      window.history.replaceState(window.history.state, '', loc + '?tab=' + tabIndex)
    } catch (e) { console.error(e) }
    this.currentTab = tabIndex
    if ((this.currentTab === 0 && !this.followers) ||
      (this.currentTab === 1 && !this.following)) {
      this.getData(this.userId, 1)
      .then(redraw)
    }

    redraw()
  }

  private getData(userId: string, page: number): Promise<void> {
    return this.currentTab === 0 ?
      xhr.followers(userId, page)
      .then(d => {
        this.followers = (this.followers || []).concat(d.paginator.currentPageResults)
        this.followersPaginator = d.paginator
      }) :
      xhr.following(userId, page)
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

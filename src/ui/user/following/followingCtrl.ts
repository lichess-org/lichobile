import * as stream from 'mithril/stream'
import redraw from '../../../utils/redraw'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import challengeForm from '../../challengeForm'
import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'
import * as xhr from '../userXhr'
import { IRelationCtrl } from '../interfaces'

export default function FollowingCtrl(userId: string): IRelationCtrl {

  socket.createDefault()

  const related: Mithril.Stream<Related[] | null> = stream(null)
  const paginator: Mithril.Stream<Paginator<Related> | undefined> = stream(undefined)
  const isLoadingNextPage = stream(false)

  function loadNextPage(page: number) {
    isLoadingNextPage(true)
    xhr.following(userId, page)
    .then(data => {
      isLoadingNextPage(false)
      paginator(data.paginator)
      const res = data.paginator.currentPageResults
      const cur = related()
      const newR = cur ? cur.concat(res) : res
      related(newR)
      redraw()
    })
    .catch(handleXhrError)
    redraw()
  }

  xhr.following(userId, 1)
  .then(data => {
    paginator(data.paginator)
    related(data.paginator.currentPageResults)
    redraw()
  })
  .catch(handleXhrError)

  function setNewUserState(obj: Related, newData: xhr.RelationActionResult) {
    obj.relation = newData.following
    redraw()
  }

  return {
    related,
    loadNextPage,
    isLoadingNextPage,
    toggleFollowing: (obj: Related) => {
      if (obj.relation) xhr.unfollow(obj.user).then(d => setNewUserState(obj, d))
      else xhr.follow(obj.user).then(d => setNewUserState(obj, d))
    },
    challenge(id: string) {
      challengeForm.open(id)
    },
    paginator
  }
}

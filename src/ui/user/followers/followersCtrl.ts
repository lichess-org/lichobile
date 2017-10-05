import * as stream from 'mithril/stream'
import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import challengeForm from '../../challengeForm'

import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'

import { IRelationCtrl } from '../interfaces'

export default function FollowersCtrl(userId: string): IRelationCtrl {

  socket.createDefault()

  const related: Mithril.Stream<Related[] | null> = stream(null)
  const paginator: Mithril.Stream<Paginator<Related> | undefined> = stream(undefined)
  const isLoadingNextPage = stream(false)

  function loadNextPage(page: number) {
    isLoadingNextPage(true)
    xhr.followers(userId, page)
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

  xhr.followers(userId, 1)
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

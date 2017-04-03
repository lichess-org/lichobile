import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import challengeForm from '../../challengeForm'
import * as stream from 'mithril/stream'

import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'

export interface IRelationCtrl {
  related: Mithril.Stream<Related[]>
  loadNextPage: (page: number) => void
  isLoadingNextPage: Mithril.Stream<boolean>
  toggleFollowing: (obj: Related) => void
  challenge: (id: string) => void
  paginator: Mithril.Stream<Paginator<Related> | undefined>
}

export default function FollowingCtrl(userId: string): IRelationCtrl {

  socket.createDefault()

  const related: Mithril.Stream<Related[]> = stream([])
  const paginator: Mithril.Stream<Paginator<Related> | undefined> = stream(undefined)
  const isLoadingNextPage = stream(false)

  function loadNextPage(page: number) {
    isLoadingNextPage(true)
    xhr.following(userId, page)
    .then(data => {
      isLoadingNextPage(false)
      paginator(data.paginator)
      related(related().concat(data.paginator.currentPageResults))
      redraw()
    })
    .catch(handleXhrError)
    redraw()
  }

  xhr.following(userId, 1, true)
  .then(data => {
    paginator(data.paginator)
    related(data.paginator.currentPageResults)
    redraw()
  })
  .catch(handleXhrError)

  function setNewUserState(obj: Related, newData: xhr.RelationActionResult) {
    obj.relation = newData.following
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

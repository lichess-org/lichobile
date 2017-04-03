import * as stream from 'mithril/stream'
import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import socket from '../../../socket'
import challengeForm from '../../challengeForm'

import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'

export interface IFollowersCtrl {
  followers: Mithril.Stream<Related[]>
  loadNextPage: (page: number) => void
  isLoadingNextPage: Mithril.Stream<boolean>
  toggleFollowing: (obj: Related) => void
  challenge: (id: string) => void
  paginator: Mithril.Stream<Paginator<Related> | undefined>
}

export default function FollowersCtrl(userId: string): IFollowersCtrl {

  socket.createDefault()

  const followers: Mithril.Stream<Related[]> = stream([])
  const paginator: Mithril.Stream<Paginator<Related> | undefined> = stream(undefined)
  const isLoadingNextPage = stream(false)

  function loadNextPage(page: number) {
    isLoadingNextPage(true)
    xhr.followers(userId, page)
    .then(data => {
      isLoadingNextPage(false)
      paginator(data.paginator)
      followers(followers().concat(data.paginator.currentPageResults))
      redraw()
    })
    .catch(handleXhrError)
    redraw()
  }

  xhr.followers(userId, 1, true)
  .then(data => {
    paginator(data.paginator)
    followers(data.paginator.currentPageResults)
    redraw()
  })
  .catch(handleXhrError)

  function setNewUserState(obj: Related, newData: xhr.RelationActionResult) {
    obj.relation = newData.followable
  }

  return {
    followers,
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

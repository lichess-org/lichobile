import redraw from '../../../utils/redraw'
import * as xhr from '../userXhr'
import { handleXhrError } from '../../../utils'
import * as helper from '../../helper'
import socket from '../../../socket'
import challengeForm from '../../challengeForm'
import * as stream from 'mithril/stream'

var scroller

export default function oninit(vnode) {

  helper.analyticsTrackView('User following')

  socket.createDefault()

  const userId = vnode.attrs.id
  const following = stream([])
  const paginator = stream(null)
  const isLoadingNextPage = stream(false)

  function loadNextPage(page) {
    isLoadingNextPage(true)
    xhr.following(userId, page)
    .then(data => {
      isLoadingNextPage(false)
      paginator(data.paginator)
      following(following().concat(data.paginator.currentPageResults))
      redraw()
    })
    .catch(handleXhrError)
    redraw()
  }

  xhr.following(userId, 1, true)
  .then(data => {
    paginator(data.paginator)
    following(data.paginator.currentPageResults)
    redraw()
  })
  .then(() => setTimeout(() => {
    if (scroller) scroller.scrollTo(0, 0, 0)
  }, 50))
  .catch(handleXhrError)

  function setNewUserState(obj, newData) {
    obj.relation = newData.following
  }

  vnode.state = {
    following,
    loadNextPage,
    isLoadingNextPage,
    toggleFollowing: obj => {
      if (obj.relation) xhr.unfollow(obj.user).then(setNewUserState.bind(undefined, obj))
      else xhr.follow(obj.user).then(setNewUserState.bind(undefined, obj))
    },
    challenge(id) {
      challengeForm.open(id)
    },
    paginator
  }
}

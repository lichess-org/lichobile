import session from '../../session'
import redraw from '../../utils/redraw'
import * as xhr from './userXhr'
import router from '../../router'
import * as utils from '../../utils'
import challengeForm from '../challengeForm'
import * as stream from 'mithril/stream'
import { UserFullProfile } from '../../lichess/interfaces/user'

export interface UserCtrl {
  user: Mithril.Stream<UserFullProfile | undefined>
  isMe: () => boolean
  toggleFollowing: () => void
  toggleBlocking: () => void
  goToGames: () => void
  goToUserTV: () => void
  challenge: () => void
  composeMessage: () => void
}

export default function oninit(userId: string) {

  const user: Mithril.Stream<UserFullProfile | undefined> = stream(undefined)

  function setNewUserState(newData: Partial<UserFullProfile>) {
    Object.assign(user(), newData)
    redraw()
  }

  xhr.user(userId)
  .then(data => {
    user(data)
    redraw()
  })
  .then(session.refresh)
  .catch(utils.handleXhrError)

  return {
    user,
    isMe: () => session.getUserId() === userId,
    toggleFollowing() {
      const u = user()
      if (u && u.following) xhr.unfollow(u.id).then(setNewUserState)
      else if (u) xhr.follow(u.id).then(setNewUserState)
    },
    toggleBlocking() {
      const u = user()
      if (u && u.blocking) xhr.unblock(u.id).then(setNewUserState)
      else if (u) xhr.block(u.id).then(setNewUserState)
    },
    goToGames() {
      const u = user()
      if (u) {
        router.set(`/@/${u.id}/games`)
      }
    },
    goToUserTV() {
      const u = user()
      if (u) {
        router.set(`/@/${u.id}/tv`)
      }
    },
    challenge() {
      const u = user()
      if (u) {
        challengeForm.open(u.id)
      }
    },
    composeMessage() {
      const u = user()
      if (u) {
        router.set(`/inbox/new/${u.id}`)
      }
    }
  }
}

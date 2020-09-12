import session, { Session } from '../../session'
import redraw from '../../utils/redraw'
import * as xhr from './userXhr'
import router from '../../router'
import * as utils from '../../utils'
import challengeForm from '../challengeForm'
import { UserFullProfile } from '../../lichess/interfaces/user'

export interface IUserCtrl {
  user: utils.Prop<ProfileUser | null>
  isMe: () => boolean
  toggleFollowing: () => void
  toggleBlocking: () => void
  goToGames: () => void
  goToUserTV: () => void
  challenge: () => void
  composeMessage: () => void
  followers: () => void
}

export type ProfileUser = Session | UserFullProfile

export default function UserCtrl(userId: string): IUserCtrl {

  const user = utils.prop<ProfileUser | null>(null)

  function setNewUserState(newData: Partial<ProfileUser>) {
    Object.assign(user(), newData)
    redraw()
  }

  // by default, using session user so it can be displayed offline
  const sessionUser = session.get()
  if (sessionUser && sessionUser.id === userId) {
    user(sessionUser)
  }

  xhr.user(userId)
  .then(data => {
    user(data)
    redraw()
  })
  .then(session.refresh)
  .catch(err => {
    if (utils.hasNetwork()) {
      utils.handleXhrError(err)
    }
  })

  return {
    user,
    isMe: () => session.getUserId() === userId,
    toggleFollowing() {
      const u = user()
      if (u && isFullUser(u) && u.following) xhr.unfollow(u.id).then(setNewUserState)
      else if (u) xhr.follow(u.id).then(setNewUserState)
    },
    toggleBlocking() {
      const u = user()
      if (u && isFullUser(u) && u.blocking) xhr.unblock(u.id).then(setNewUserState)
      else if (u) xhr.block(u.id).then(setNewUserState)
    },
    goToGames() {
      const u = user()
      if (u) {
        const params: StringMap = {
          username: u.username,
          title: u.title,
        }
        if (u.patron) params.patron = '1'
        router.set(`/@/${u.id}/games?${utils.serializeQueryParameters(params)}`)
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
    },
    followers() {
      const u = user()
      if (u) {
        const params: StringMap = {
          username: u.username,
          title: u.title,
        }
        router.set(`/@/${u.id}/related?${utils.serializeQueryParameters(params)}`)
      }
    },
  }
}

export function isSessionUser(user: ProfileUser): user is Session {
  return (<Session>user).prefs !== undefined
}

export function isFullUser(user: ProfileUser): user is UserFullProfile {
  return (<UserFullProfile>user).count !== undefined
}

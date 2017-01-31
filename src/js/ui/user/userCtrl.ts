import session from '../../session';
import redraw from '../../utils/redraw';
import * as xhr from './userXhr';
import router from '../../router';
import * as utils from '../../utils';
import challengeForm from '../challengeForm';
import * as stream from 'mithril/stream';
import { UserFullProfile } from '../../lichess/interfaces/user';

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
    toggleFollowing: () => {
      if (user().following) xhr.unfollow(user().id).then(setNewUserState);
      else xhr.follow(user().id).then(setNewUserState);
    },
    toggleBlocking: () => {
      if (user().blocking) xhr.unblock(user().id).then(setNewUserState);
      else xhr.block(user().id).then(setNewUserState);
    },
    goToGames: () => router.set(`/@/${user().id}/games`),
    goToUserTV: () => router.set(`/@/${user().id}/tv`),
    challenge: () => challengeForm.open(user().id),
    composeMessage: () => router.set(`/inbox/new/${user().id}`)
  }
}

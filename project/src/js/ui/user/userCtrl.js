import session from '../../session';
import * as xhr from './userXhr';
import router from '../../router';
import * as utils from '../../utils';
import helper from '../helper';
import challengeForm from '../challengeForm';
import socket from '../../socket';
import m from 'mithril';

export default function oninit(vnode) {

  const userId = vnode.attrs.id;

  helper.analyticsTrackView('User Profile');

  socket.createDefault();

  const user = m.prop();

  function setNewUserState(newData) {
    Object.assign(user(), newData);
  }

  xhr.user(userId)
  .run(user)
  .run(session.refresh)
  .catch(error => {
    utils.handleXhrError(error);
    router.set('/');
  });

  vnode.state = {
    user,
    isMe: () => session.getUserId() === user().id,
    toggleFollowing: () => {
      if (user().following) xhr.unfollow(user().id).run(setNewUserState);
      else xhr.follow(user().id).run(setNewUserState);
    },
    toggleBlocking: () => {
      if (user().blocking) xhr.unblock(user().id).run(setNewUserState);
      else xhr.block(user().id).run(setNewUserState);
    },
    goToGames: () => router.set(`/@/${user().id}/games`),
    goToUserTV: () => router.set(`/@/${user().id}/tv`),
    challenge: () => challengeForm.open(user().id)
  };
}

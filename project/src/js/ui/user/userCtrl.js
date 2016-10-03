import session from '../../session';
import redraw from '../../utils/redraw';
import * as xhr from './userXhr';
import router from '../../router';
import * as utils from '../../utils';
import * as helper from '../helper';
import challengeForm from '../challengeForm';
import socket from '../../socket';
import * as m from 'mithril';

export default function oninit(vnode) {

  const userId = vnode.attrs.id;

  helper.analyticsTrackView('User Profile');

  socket.createDefault();

  const user = m.prop();

  function setNewUserState(newData) {
    Object.assign(user(), newData);
  }

  xhr.user(userId)
  .then(data => {
    user(data);
    redraw();
  })
  .then(session.refresh)
  .catch(utils.handleXhrError);

  vnode.state = {
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
  };
}

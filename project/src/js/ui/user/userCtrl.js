import session from '../../session';
import * as xhr from './userXhr';
import * as utils from '../../utils';
import helper from '../helper';
import challengeForm from '../challengeForm';
import socket from '../../socket';
import m from 'mithril';

export default function controller() {

  helper.analyticsTrackView('User Profile');

  socket.createDefault();

  const user = m.prop();

  function setNewUserState(newData) {
    Object.assign(user(), newData);
  }

  xhr.user(m.route.param('id'))
  .run(user)
  .run(session.refresh)
  .catch(error => {
    utils.handleXhrError(error);
    m.route('/');
  });

  return {
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
    goToGames: () => m.route(`/@/${user().id}/games`),
    goToUserTV: () => m.route(`/@/${user().id}/tv`),
    challenge: () => challengeForm.open(user().id)
  };
}

import session from '../../session';
import * as xhr from './userXhr';
import * as utils from '../../utils';
import helper from '../helper';
import {assign} from 'lodash/object';
import challengeForm from '../challengeForm';
import socket from '../../socket';
import m from 'mithril';

export default function controller() {

  helper.analyticsTrackView('User Profile');

  socket.createDefault();

  const user = m.prop();

  function setNewUserState(newData) {
    assign(user(), newData);
  }

  xhr.user(m.route.param('id')).then(user, error => {
    utils.handleXhrError(error);
    m.route('/');
  }).then(session.refresh);

  return {
    user,
    isMe: () => session.getUserId() === user().id,
    toggleFollowing: () => {
      if (user().following) xhr.unfollow(user().id).then(setNewUserState);
      else xhr.follow(user().id).then(setNewUserState);
    },
    toggleBlocking: () => {
      if (user().blocking) xhr.unblock(user().id).then(setNewUserState);
      else xhr.block(user().id).then(setNewUserState);
    },
    goToGames: () => m.route(`/@/${user().id}/games`),
    goToUserTV: () => m.route(`/@/${user().id}/tv`),
    challenge: () => challengeForm.open(user().id),
    onunload: () => {
      socket.destroy();
    }
  };
}

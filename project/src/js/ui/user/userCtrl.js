import session from '../../session';
import * as xhr from './userXhr';
import utils from '../../utils';
import helper from '../helper';
import {assign} from 'lodash/object';

module.exports = function() {

  helper.analyticsTrackView('User Profile');

  const user = m.prop();

  xhr.user(m.route.param('id')).then(user, error => {
    utils.handleXhrError(error);
    m.route('/');
  });

  return {
    user,
    isMe: () => session.getUserId() === user().id,
    toggleFollowing: () => {
      if (user().following) xhr.unfollow(user().id).then(data => assign(user(), data));
      else xhr.follow(user().id).then(data => assign(user(), data));
    }
  };
};

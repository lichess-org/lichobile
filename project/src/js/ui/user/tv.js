import { connectingHeader, viewOnlyBoardContent } from '../shared/common';
import layout from '../layout';
import helper from '../helper';
import * as utils from '../../utils';
import { tv } from './userXhr';
import roundCtrl from '../round/roundCtrl';
import roundView from '../round/view/roundView';
import m from 'mithril';

export default {
  controller: function() {
    var round;

    const userId = m.route.param('id');

    helper.analyticsTrackView('User TV');

    function onRedirect() {
      tv(userId).then(function(data) {
        m.redraw.strategy('all');
        data.userTV = userId;
        if (round) round.onunload();
        round = new roundCtrl(data, null, null, userId, onRedirect);
      }, function(error) {
        utils.handleXhrError(error);
      });
    }

    tv(userId).then(function(data) {
      data.userTV = userId;
      round = new roundCtrl(data, null, null, userId, onRedirect);
    }, function(error) {
      utils.handleXhrError(error);
      m.route('/');
    });

    return {
      getRound: function() { return round; },

      onunload: function() {
        if (round) {
          round.onunload();
          round = null;
        }
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.getRound()) return roundView(ctrl.getRound());

    const header = connectingHeader.bind(undefined, m.route.param('id') + ' TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

import { connectingHeader, viewOnlyBoardContent } from '../shared/common';
import layout from '../layout';
import helper from '../helper';
import * as utils from '../../utils';
import { tv } from './userXhr';
import roundCtrl from '../round/roundCtrl';
import roundView from '../round/view/roundView';
import m from 'mithril';

export default {
  oninit: function(vnode) {
    var round;

    const userId = vnode.attrs.id;

    helper.analyticsTrackView('User TV');

    function onRedirect() {
      tv(userId)
      .run(function(data) {
        m.redraw.strategy('all');
        data.userTV = userId;
        if (round) round.onunload();
        round = new roundCtrl(data, null, null, userId, onRedirect);
      })
      .catch(utils.handleXhrError);
    }

    tv(userId)
    .run(function(data) {
      data.userTV = userId;
      round = new roundCtrl(data, null, null, userId, onRedirect);
    })
    .catch(function(error) {
      utils.handleXhrError(error);
      m.route.set('/');
    });

    vnode.state = {
      getRound: function() { return round; },

      onunload: function() {
        if (round) {
          round.onunload();
          round = null;
        }
      }
    };
  },

  view: function(vnode) {
    const ctrl = vnode.state;
    if (ctrl.getRound()) return roundView(ctrl.getRound());

    const header = connectingHeader.bind(undefined, vnode.attrs.id + ' TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

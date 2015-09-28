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

    helper.analyticsTrackView('User TV');

    tv(m.route.param('id')).then(function(data) {
      data.userTV = m.route.param('id');
      round = new roundCtrl(data);
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

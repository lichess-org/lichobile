import { connectingHeader, viewOnlyBoardContent } from './widget/common';
import layout from './layout';
import helper from './helper';
import * as utils from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import roundCtrl from './round/roundCtrl';
import roundView from './round/view/roundView';
import m from 'mithril';

export default {
  controller: function() {
    var round;

    helper.analyticsTrackView('TV');

    function onChannelChange() {
      m.route('/tv');
    }

    function onFeatured(o) {
      xhr.game(o.id, o.color).then(function(data) {
        m.redraw.strategy('all');
        if (round) round.onunload();
        data.tv = settings.tv.channel();
        round = new roundCtrl(data, onFeatured, onChannelChange);
      }, function(error) {
        utils.handleXhrError(error);
      });
    }

    xhr.featured(settings.tv.channel(), m.route.param('flip')).then(function(data) {
      data.tv = settings.tv.channel();
      round = new roundCtrl(data, onFeatured, onChannelChange);
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

    const header = connectingHeader.bind(undefined, 'Lichess TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

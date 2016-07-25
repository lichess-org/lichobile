import { connectingHeader, viewOnlyBoardContent } from './shared/common';
import layout from './layout';
import helper from './helper';
import { handleXhrError } from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import roundCtrl from './round/roundCtrl';
import roundView from './round/view/roundView';
import m from 'mithril';

export default {
  oninit: function(vnode) {
    var round;

    helper.analyticsTrackView('TV');

    function onChannelChange() {
      m.route.set('/tv');
    }

    function onFeatured(o) {
      xhr.game(o.id, o.color)
      .run(function(data) {
        m.redraw.strategy('all');
        if (round) round.onunload();
        data.tv = settings.tv.channel();
        round = new roundCtrl(data, onFeatured, onChannelChange);
      })
      .catch(handleXhrError);
    }

    xhr.featured(settings.tv.channel(), vnode.attrs.flip)
    .run(function(data) {
      data.tv = settings.tv.channel();
      round = new roundCtrl(data, onFeatured, onChannelChange);
    })
    .catch(error => {
      handleXhrError(error);
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

    const header = connectingHeader.bind(undefined, 'Lichess TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

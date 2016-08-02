import { connectingHeader, viewOnlyBoardContent } from './shared/common';
import router from '../router';
import layout from './layout';
import helper from './helper';
import { handleXhrError } from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import roundCtrl from './round/roundCtrl';
import roundView from './round/view/roundView';
import m from 'mithril';

export default {
  oninit(vnode) {
    const ctrl = this;

    helper.analyticsTrackView('TV');

    function onChannelChange() {
      router.set('/tv');
    }

    function onFeatured() {
      router.set('/tv');
    }

    xhr.featured(settings.tv.channel(), vnode.attrs.flip)
    .run(data => {
      data.tv = settings.tv.channel();
      ctrl.round = new roundCtrl(vnode, data, onFeatured, onChannelChange);
    })
    .catch(error => {
      handleXhrError(error);
      router.set('/');
    });
  },

  onremove() {
    if (this.round) {
      this.round.onunload();
      this.round = null;
    }
  },

  view() {

    if (this.round) return roundView(this.round);

    const header = connectingHeader.bind(undefined, 'Lichess TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

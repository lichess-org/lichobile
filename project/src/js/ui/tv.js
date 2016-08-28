import * as m from 'mithril';
import router from '../router';
import helper from './helper';
import { handleXhrError } from '../utils';
import * as xhr from '../xhr';
import { LoadingBoard } from './shared/common';
import settings from '../settings';
import roundCtrl from './shared/round/roundCtrl';
import roundView from './shared/round/view/roundView';

export default {
  oninit(vnode) {
    helper.analyticsTrackView('TV');

    const onChannelChange = () => router.set('/tv', true);
    const onFeatured = () => router.set('/tv', true);

    xhr.featured(settings.tv.channel(), vnode.attrs.flip)
    .then(d => {
      d.tv = settings.tv.channel();
      this.round = new roundCtrl(vnode, d, onFeatured, onChannelChange);
    })
    .catch(handleXhrError);
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    this.round.unload();
  },

  view() {
    if (this.round) {
      return roundView(this.round);
    } else {
      return m(LoadingBoard);
    }
  }
};

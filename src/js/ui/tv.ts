import * as h from 'mithril/hyperscript';
import router from '../router';
import socket from '../socket';
import * as helper from './helper';
import { handleXhrError } from '../utils';
import * as xhr from '../xhr';
import { LoadingBoard } from './shared/common';
import settings from '../settings';
import OnlineRound from './shared/round/OnlineRound';
import roundView from './shared/round/view/roundView';

interface TVAttrs {
  id: string;
  color: Color;
  flip: boolean;
  channel?: string;
}

interface State {
  round: OnlineRound
}

const TV: Mithril.Component<TVAttrs, State> = {
  oninit(vnode) {
    helper.analyticsTrackView('TV');

    const onChannelChange = () => router.set('/tv', true);
    const onFeatured = () => router.set('/tv', true);

    if (vnode.attrs.channel) {
      settings.tv.channel(vnode.attrs.channel)
    }

    xhr.featured(settings.tv.channel(), vnode.attrs.flip)
    .then(d => {
      d.tv = settings.tv.channel();
      this.round = new OnlineRound(vnode.attrs.id, d, vnode.attrs.flip, onFeatured, onChannelChange);
    })
    .catch(handleXhrError);
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    socket.destroy();
    if (this.round) {
      this.round.unload();
    }
  },

  view() {
    if (this.round) {
      return roundView(this.round);
    } else {
      return h(LoadingBoard);
    }
  }
};

export default TV

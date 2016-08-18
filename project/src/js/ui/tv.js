import m from 'mithril';
import Vnode from 'mithril/render/vnode';
import signals from '../signals';
import { connectingHeader, viewOnlyBoardContent } from './shared/common';
import router from '../router';
import layout from './layout';
import helper from './helper';
import { handleXhrError } from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import roundCtrl from './round/roundCtrl';
import roundView from './round/view/roundView';

const LoadingBoard = {
  view() {
    return layout.board(
      connectingHeader,
      viewOnlyBoardContent
    );
  }
};

const TV = {
  oninit(vnode) {
    const { data, onFeatured, onChannelChange } = vnode.attrs;
    data.tv = settings.tv.channel();
    this.round = new roundCtrl(vnode, data, onFeatured, onChannelChange);
  },

  onremove() {
    this.round.onunload();
  },

  view() {
    return roundView(this.round);
  }
};

export default function({ params }) {
  helper.analyticsTrackView('TV');

  params.onChannelChange = () => router.set('/tv', true);
  params.onFeatured = () => router.set('/tv', true);

  function redraw() {
    // need to change key to effectively reload screen on game change
    m.render(document.body, Vnode(
      params.data ? TV : LoadingBoard,
      params.data ? params.data.game.id : 'loading',
      params,
      undefined,
      undefined,
      undefined
    ));
  }

  xhr.featured(settings.tv.channel(), params.flip)
  .then(data => {
    params.data = data;
  })
  .catch(error => {
    handleXhrError(error);
    router.set('/');
  });

  signals.redraw.removeAll();
  signals.redraw.add(redraw);
  redraw();
}

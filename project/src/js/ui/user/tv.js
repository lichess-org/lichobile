import m from 'mithril';
import Vnode from 'mithril/render/vnode';
import signals from '../../signals';
import { connectingHeader, viewOnlyBoardContent } from '../shared/common';
import router from '../../router';
import layout from '../layout';
import helper from '../helper';
import * as utils from '../../utils';
import { tv } from './userXhr';
import roundCtrl from '../round/roundCtrl';
import roundView from '../round/view/roundView';

const LoadingBoard = {
  view() {
    return layout.board(
      connectingHeader,
      viewOnlyBoardContent
    );
  }
};

const UserTv = {
  oninit: function(vnode) {
    const { id, data, onRedirect } = vnode.attrs;
    data.userTV = id;
    this.round = new roundCtrl(vnode, data, null, null, id, onRedirect);
  },

  onremove() {
    this.round.onunload();
  },

  view: function() {
    return roundView(this.round);
  }
};

export default function({ params }) {
  helper.analyticsTrackView('User TV');

  params.onRedirect = () => router.set(`/@/${params.id}/tv`, true);

  function redraw() {
    // need to change key to effectively reload screen on game change
    m.render(document.body, Vnode(
      params.data ? UserTv : LoadingBoard,
      params.data ? params.data.game.id : 'loading',
      params,
      undefined,
      undefined,
      undefined
    ));
  }

  tv(params.id)
  .then(data => {
    params.data = data;
  })
  .catch(error => {
    utils.handleXhrError(error);
    router.set('/');
  });

  signals.redraw.removeAll();
  signals.redraw.add(redraw);
  redraw();
}

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
    const ctrl = this;
    const userId = vnode.attrs.id;

    helper.analyticsTrackView('User TV');

    function onRedirect() {
      m.route.set(`/@/${userId}/tv`, null, { replace: true });
    }

    tv(userId)
    .run(data => {
      data.userTV = userId;
      ctrl.round = new roundCtrl(vnode, data, null, null, userId, onRedirect);
    })
    .catch(error => {
      utils.handleXhrError(error);
      m.route.set('/');
    });

  },

  onremove() {
    if (this.round) {
      this.round.onunload();
      this.round = null;
    }
  },

  view: function(vnode) {
    if (this.round) return roundView(this.round);

    const header = connectingHeader.bind(undefined, vnode.attrs.id + ' TV');

    return layout.board(header, viewOnlyBoardContent);
  }
};

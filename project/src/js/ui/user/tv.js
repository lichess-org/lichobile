import * as m from 'mithril';
import router from '../../router';
import helper from '../helper';
import { handleXhrError } from '../../utils';
import { LoadingBoard } from '../shared/common';
import roundCtrl from '../round/roundCtrl';
import roundView from '../round/view/roundView';
import { tv } from './userXhr';

export default {
  oninit(vnode) {
    helper.analyticsTrackView('TV');

    const userId = vnode.attrs.id;
    const onRedirect = () => router.set(`/@/${userId}/tv`, true);

    tv(userId)
    .then(data => {
      data.userTV = userId;
      this.round = new roundCtrl(vnode, data, null, null, userId, onRedirect);
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

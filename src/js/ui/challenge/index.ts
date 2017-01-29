import socket from '../../socket';
import * as helper from '../helper';
import router from '../../router';
import { handleXhrError } from '../../utils';
import { throttle } from 'lodash';
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr';
import challengesApi from '../../lichess/challenges';
import i18n from '../../i18n';
import * as stream from 'mithril/stream';
import layout from '../layout';
import { viewOnlyBoardContent, header as headerWidget } from '../shared/common';
import { joinPopup, awaitChallengePopup, awaitInvitePopup } from './challengeView';
import { ChallengeState } from './interfaces';

const throttledPing = throttle(() => socket.send('ping'), 1000);

interface Attrs {
  id: string
}

const ChallengeScreen: Mithril.Component<Attrs, ChallengeState> = {
  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy();
    window.plugins.insomnia.allowSleepAgain();
    clearTimeout(this.pingTimeoutId);
  },

  oninit(vnode) {
    const challenge = stream(undefined);

    window.plugins.insomnia.keepAwake();

    const reloadChallenge = () => {
      getChallenge(challenge().id)
      .then(d => {
        challenge(d.challenge);
        switch (d.challenge.status) {
          case 'accepted':
            router.set(`/game/${d.challenge.id}`, true);
            break;
          case 'declined':
            window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
            router.backHistory();
            break;
        }
      });
    }

    const pingNow = () => {
      throttledPing();
      this.pingTimeoutId = setTimeout(pingNow, 2000);
    }

    const onSocketOpen = () => {
      // reload on open in case the reload msg has not been received
      reloadChallenge();
      pingNow();
    }

    getChallenge(vnode.attrs.id).then(d => {
      challenge(d.challenge);
      socket.createChallenge(d.challenge.id, d.socketVersion, onSocketOpen, {
        reload: reloadChallenge
      });
    })
    .catch(err => {
      handleXhrError(err);
      router.set('/');
    });

    this.challenge = challenge;

    this.joinChallenge = () => {
      return acceptChallenge(challenge().id)
      .then(d => router.set('/game' + d.url.round, true))
      .then(() => challengesApi.remove(challenge().id))
    }

    this.declineChallenge = () => {
      return declineChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(router.backHistory);
    }

    this.cancelChallenge = () => {
      return cancelChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(router.backHistory);
    }
  },

  view(vnode) {
    let overlay: () => Mithril.Children;
    let board = viewOnlyBoardContent;

    const challenge = this.challenge();

    const header = () => headerWidget('lichess.org');

    if (challenge) {
      board = () => viewOnlyBoardContent(challenge.initialFen, null, challenge.color)

      if (challenge.direction === 'in') {
        overlay = joinPopup(this);
      } else if (challenge.direction === 'out') {
        if (challenge.destUser) {
          overlay = awaitChallengePopup(this);
        } else {
          overlay = awaitInvitePopup(this);
        }
      }
    }

    return layout.board(header, board, overlay);
  }
};

export default ChallengeScreen;

import * as helper from '../helper';
import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import challengesApi from '../../lichess/challenges';
import { uniqBy } from 'lodash';
import session from '../../session';
import settings from '../../settings';
import * as xhr from '../../xhr';
import socket from '../../socket';
import * as Zanimo from 'zanimo';
import * as stream from 'mithril/stream';
import layout from '../layout';
import { header as headerWidget } from '../shared/common';
import { Seek } from '../../lichess/interfaces';
import { Challenge } from '../../lichess/interfaces/challenge';
import { renderBody, renderFooter } from './correspondenceView';

interface Attrs {
  tab: string
}

export interface State {
  selectedTab: Mithril.Stream<string>
  sendingChallenges: Mithril.Stream<Array<Challenge>>
  cancelChallenge: (id: string) => Promise<void>
  getPool: () => Array<Seek>
  cancel: (seekId: string) => Promise<void>
  join: (seekId: string) => void
}

const CorrespondenceScreen: Mithril.Component<Attrs, State> = {
  oninit(vnode) {

    let pool: Array<Seek> = [];
    const selectedTab = stream(vnode.attrs.tab || 'public');
    const sendingChallenges = stream(getSendingCorres());

    helper.analyticsTrackView('Correspondence');

    socket.createLobby(reload, {
      redirect: socket.redirectToGame,
      reload_seeks: reload,
      resync: () => xhr.lobby().then(d => {
        socket.setVersion(d.lobby.version);
      })
    });

    challengesApi.refresh().then(() => {
      sendingChallenges(getSendingCorres());
    });

    function getSendingCorres() {
      return challengesApi.sending().filter(challengesApi.isPersistent);
    }

    function cancelChallenge(id: string) {
      return xhr.cancelChallenge(id)
      .then(() => {
        challengesApi.remove(id);
        sendingChallenges(getSendingCorres());
      });
    }

    function reload(feedback?: boolean) {
      xhr.seeks(feedback)
      .then((d) => {
        pool = fixSeeks(d).filter(s => settings.game.supportedVariants.indexOf(s.variant.key) !== -1);
        redraw();
      });
    }

    reload(true);

    vnode.state = {
      selectedTab,
      sendingChallenges,
      cancelChallenge,
      getPool() {
        return pool;
      },
      cancel(seekId) {
        return Zanimo(document.getElementById(seekId), 'opacity', '0', '300', 'ease-out')
          .then(() => socket.send('cancelSeek', seekId))
          .catch(console.log.bind(console));
      },
      join(seekId) {
        socket.send('joinSeek', seekId);
      }
    }
  },

  oncreate: helper.viewFadeIn,

  view(vnode) {
    const header = () => headerWidget(i18n('correspondence'))
    const body = () => renderBody(this)

    return layout.free(header, body, renderFooter);
  }
}

function seekUserId(seek: Seek) {
  return seek.username.toLowerCase();
}

function fixSeeks(seeks: Seek[]): Array<Seek> {
  const userId = session.getUserId();
  if (userId) seeks.sort((a, b) => {
    if (seekUserId(a) === userId) return -1;
    if (seekUserId(b) === userId) return 1;
    return 0;
  });
  return uniqBy(seeks, s => {
    const username = seekUserId(s) === userId ? s.id : s.username;
    const key = username + s.mode + s.variant.key + s.days;
    return key;
  });
}

export default CorrespondenceScreen

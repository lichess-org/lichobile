import * as utils from '../utils';
import redraw from '../utils/redraw';
import settings from '../settings';
import * as helper from './helper';
import spinner from '../spinner';
import router from '../router';
import { loader } from './shared/common';
import popupWidget from './shared/popup';
import * as xhr from '../xhr';
import i18n from '../i18n';
import socket, { RedirectObj } from '../socket';
import { LobbyData } from '../lichess/interfaces';
import * as m from 'mithril';

let nbPlayers = 0;
let nbGames = 0;
let isOpen = false;

// reference created hookId to avoid creating more than 1 hook
let hookId: string | null = null;

export default {
  startSeeking,
  cancelSeeking,
  view() {

    function content() {
      const nbPlayersStr = i18n('nbConnectedPlayers', nbPlayers || '?');
      const nbGamesStr = i18n('nbGamesInPlay', nbGames || '?');
      const conf = settings.gameSetup.human;
      const variant = conf.availableVariants.find(v => v[1] === conf.variant())[0];
      const timeMode = conf.timeMode();
      const mode = conf.mode() === '0' ? i18n('casual') : i18n('rated');
      let time: string;
      if (timeMode === '1') {
        time = conf.time() + '+' + conf.increment();
      } else if (timeMode === '2') {
        time = i18n('nbDays', conf.days());
      } else {
        time = '∞';
      }
      const variantMode = ` • ${variant} • ${mode}`;

      return m('div.lobby-waitingPopup', [
        m('div.lobby-waitingForOpponent', i18n('waitingForOpponent')),
        m('br'),
        m('div.gameInfos', [
          m('span[data-icon=p]', time), variantMode
        ]),
        m('br'),
        spinner.getVdom(),
        m('div.lobby-nbPlayers', [
          m('div', socket.isConnected() ?
            m.trust(nbPlayersStr.replace(/(\d+)/, '<strong>$1</strong>')) :
            m('div', [i18n('reconnecting'), loader])
          ),
          m('div', socket.isConnected() ?
            m.trust(nbGamesStr.replace(/(\d+)/, '<strong>$1</strong>')) :
            m('div', [i18n('reconnecting'), loader])
          ),
        ]),
        m('button[data-icon=L]', {
          oncreate: helper.ontap(() => cancelSeeking())
        }, i18n('cancel'))
      ]);
    }

    return popupWidget(
      null,
      null,
      content,
      isOpen
    );
  }
}

function startSeeking() {
  router.backbutton.stack.push(cancelSeeking);

  isOpen = true;
  window.plugins.insomnia.keepAwake();
  hookId = null;

  xhr.lobby(true).then(data => {
    socket.createLobby(data.lobby.version, createHook, {
      redirect: (d: RedirectObj) => {
        closePopup();
        helper.analyticsTrackEvent('Seek', 'Found');
        socket.redirectToGame(d);
      },
      n: (_: never, d: PongMessage) => {
        nbPlayers = d.d;
        nbGames = d.r;
        redraw();
      },
      resync: () => xhr.lobby().then((d: LobbyData) => {
        socket.setVersion(d.lobby.version);
      })
    });
  });
};

function closePopup(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
};

function cancelSeeking(fromBB?: string) {
  closePopup(fromBB);

  if (hookId) socket.send('cancel', hookId);
  hookId = null;

  socket.restorePrevious();

  window.plugins.insomnia.allowSleepAgain();

  helper.analyticsTrackEvent('Seek', 'Canceled');
};


function createHook() {
  if (hookId) return; // hook already created!
  xhr.seekGame()
  .then(data => {
    helper.analyticsTrackEvent('Seek', 'Created');
    hookId = data.hook.id;
  })
  .catch(utils.handleXhrError);
}

import * as utils from '../utils';
import redraw from '../utils/redraw';
import session from '../session';
import settings from '../settings';
import * as helper from './helper';
import spinner from '../spinner';
import router from '../router';
import { loader } from './shared/common';
import popupWidget from './shared/popup';
import * as xhr from '../xhr';
import i18n from '../i18n';
import socket, { RedirectObj } from '../socket';
import * as m from 'mithril';

let nbPlayers = 0;
let nbGames = 0;
let isOpen = false;

// reference created hookId to avoid creating more than 1 hook
let hookId: string | null = null
// ref to selected pool
let currentPool: string | null = null
// we send poolIn message every 10s in case of server disconnection
// (bad network, server restart, etc.)
let poolInIntervalId: number

export default {
  startSeeking,
  cancelSeeking,
  view() {

    function content() {
      const nbPlayersStr = i18n('nbConnectedPlayers', nbPlayers || '?')
      const nbGamesStr = i18n('nbGamesInPlay', nbGames || '?')

      return m('div.lobby-waitingPopup', [
        m('div.lobby-waitingForOpponent', i18n('waitingForOpponent')),
        m('br'),
        isPool() ? renderPoolSetup() : renderCustomSetup(),
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

const socketHandlers = {
  redirect: (d: RedirectObj) => {
    closePopup();
    if (isPool()) {
      leavePool()
    }
    socket.redirectToGame(d);
  },
  n: (_: never, d: PongMessage) => {
    nbPlayers = d.d;
    nbGames = d.r;
    redraw();
  }
}

function renderCustomSetup() {
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

  return m('div.gameInfos', [
    m('span[data-icon=p]', time), variantMode
  ])
}

function renderPoolSetup() {
  const pool = settings.gameSetup.human.pool();
  const variantMode = ` • Standard • ${i18n('rated')}`;
  return m('div.gameInfos', [
    m('span[data-icon=p]', pool), variantMode
  ])
}

function isPool() {
  return session.isConnected() && settings.gameSetup.human.preset() === 'quick'
}

// generic function to seek a game, using either hook or pool method,
// based on user choice
function startSeeking() {
  router.backbutton.stack.push(cancelSeeking);

  isOpen = true;

  window.plugins.insomnia.keepAwake();

  if (isPool())
    enterPool()
  else
    sendHook()
};

function closePopup(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
};

function cancelSeeking(fromBB?: string) {
  closePopup(fromBB);

  if (isPool()) {
    leavePool()
  } else {
    if (hookId) socket.send('cancel', hookId);
    hookId = null;
  }

  socket.restorePrevious();

  window.plugins.insomnia.allowSleepAgain();
};

function sendHook() {
  hookId = null;
  socket.createLobby(() => {
    if (hookId) return; // hook already created!
    xhr.seekGame()
    .then(data => {
      hookId = data.hook.id;
    })
    .catch(utils.handleXhrError);
  }, socketHandlers)
}

function enterPool() {
  currentPool = settings.gameSetup.human.pool()
  socket.createLobby(() => {
    socket.send('poolIn', { id: currentPool })
    clearInterval(poolInIntervalId)
    poolInIntervalId = setInterval(() => {
      socket.send('poolIn', { id: currentPool })
    }, 10000)
  }, socketHandlers)
}

function leavePool() {
  clearInterval(poolInIntervalId)
  socket.send('poolOut', currentPool)
}

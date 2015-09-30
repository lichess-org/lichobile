import * as utils from '../utils';
import helper from './helper';
import layout from './layout';
import { header, viewOnlyBoardContent, loader } from './shared/common';
import popupWidget from './shared/popup';
import * as xhr from '../xhr';
import i18n from '../i18n';
import socket from '../socket';
import signals from '../signals';
import m from 'mithril';

var nbPlaying = 0;

var seek = {};

seek.controller = function() {

  var connectedWS = true;
  var hookId;

  helper.analyticsTrackView('Seek');

  function createHook() {
    if (hookId) return; // hook already created!
    xhr.seekGame().then(function(data) {
      hookId = data.hook.id;
    }, function(error) {
      utils.handleXhrError(error);
    });
  }

  function onConnected() {
    var wasOff = !connectedWS;
    connectedWS = true;
    if (wasOff) m.redraw();
  }

  function onDisconnected() {
    var wasOn = connectedWS;
    connectedWS = false;
    if (wasOn) setTimeout(function() {
      m.redraw();
    }, 500);
  }

  xhr.lobby(true).then(data => {
    socket.createLobby(data.lobby.version, createHook, {
      redirect: d => m.route('/game' + d.url),
      n: function(n) {
        nbPlaying = n;
        m.redraw();
      },
      resync: () => xhr.lobby().then(d => {
        socket.setVersion(d.lobby.version);
      })
    });
  });

  function cancel() {
    if (hookId) socket.send('cancel', hookId);
    utils.backHistory();
  }

  document.addEventListener('backbutton', cancel, false);
  signals.socket.connected.add(onConnected);
  signals.socket.disconnected.add(onDisconnected);
  window.plugins.insomnia.keepAwake();

  return {
    cancel: cancel,
    isConnectedWS: () => connectedWS,

    onunload: function() {
      socket.destroy();
      document.removeEventListener('backbutton', cancel, false);
      signals.socket.connected.remove(onConnected);
      signals.socket.disconnected.remove(onDisconnected);
      window.plugins.insomnia.allowSleepAgain();
    }
  };
};

seek.view = function(ctrl) {
  function overlays() {
    return popupWidget(
      null,
      m('div', i18n('waitingForOpponent') + '...'),
      function() {
        return m('div.seek_real_time', [
          m('div.nb_players', ctrl.isConnectedWS() ?
            i18n('nbConnectedPlayers', nbPlaying || '?') :
            m('div', [i18n('reconnecting'), loader])
          ),
          m('br'),
          m('br'),
          m('button[data-icon=L]', {
            config: helper.ontouch(ctrl.cancel)
          }, i18n('cancel'))
        ]);
      },
      true
    );
  }

  return layout.board(header, viewOnlyBoardContent, overlays);
};

module.exports = seek;

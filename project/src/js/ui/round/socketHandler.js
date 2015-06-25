import gameApi from '../../lichess/game';
import ground from './ground';
import xhr from './roundXhr';
import sound from '../../sound';
import session from '../../session';
import utils from '../../utils';
import socket from '../../socket';

export default function(ctrl, onFeatured) {

  var handlers = {
    takebackOffers: function(o) {
      ctrl.data.player.proposingTakeback = o[ctrl.data.player.color];
      ctrl.data.opponent.proposingTakeback = o[ctrl.data.opponent.color];
      m.redraw();
    },
    move: function(o) {
      ctrl.apiMove(o);
    },
    checkCount: function(e) {
      var isWhite = ctrl.data.player.color === 'white';
      ctrl.data.player.checks = isWhite ? e.white : e.black;
      ctrl.data.opponent.checks = isWhite ? e.black : e.white;
      m.redraw();
    },
    reload: function() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    redirect: function(e) {
      if (!ctrl.data.tv) m.route('/game/' + e.id);
    },
    resync: function() {
      xhr.reload(ctrl).then(function(data) {
        socket.setVersion(data.player.version);
        ctrl.reload(data);
      }, function(err) {
        utils.handleXhrError(err);
      });
    },
    clock: function(o) {
      if (ctrl.clock) ctrl.clock.update(o.white, o.black);
    },
    end: function(winner) {
      ctrl.data.game.winner = winner;
      ground.end(ctrl.chessground);
      xhr.reload(ctrl).then(ctrl.reload);
      if (!ctrl.data.player.spectator) sound.dong();
      window.plugins.insomnia.allowSleepAgain();
      // refresh current games card list
      if (session.isConnected()) session.refresh();
      setTimeout(function() {
        ctrl.showActions();
        m.redraw();
      }, 1000);
    },
    gone: function(isGone) {
      if (!ctrl.data.opponent.ai) {
        gameApi.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone);
        if (!ctrl.chat || !ctrl.chat.showing) m.redraw();
      }
    },
    message: function(m) {
      if (ctrl.chat) ctrl.chat.append(m);
    },
    tvSelect: function(o) {
      if (ctrl.data.tv && o.channel === 'best' & onFeatured) onFeatured(o);
    },
    crowd: function(o) {
      ['white', 'black'].forEach(function(c) {
        gameApi.setOnGame(ctrl.data, c, o[c]);
      });
      if (!ctrl.chat || !ctrl.chat.showing) m.redraw();
    }
  };

  return function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  };
}

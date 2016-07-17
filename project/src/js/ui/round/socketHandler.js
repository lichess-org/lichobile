import gameApi from '../../lichess/game';
import ground from './ground';
import * as xhr from './roundXhr';
import sound from '../../sound';
import vibrate from '../../vibrate';
import session from '../../session';
import { handleXhrError, removeOfflineGameData } from '../../utils';
import socket from '../../socket';
import m from 'mithril';

export default function(ctrl, onFeatured, onUserTVRedirect) {

 return {
    takebackOffers: function(o) {
      if (!ctrl.data.player.proposingTakeback && o[ctrl.data.player.color]) {
        sound.dong();
        vibrate.quick();
      }
      if (!ctrl.data.opponent.proposingTakeback && o[ctrl.data.opponent.color]) {
        sound.dong();
        vibrate.quick();
      }
      ctrl.data.player.proposingTakeback = o[ctrl.data.player.color];
      ctrl.data.opponent.proposingTakeback = o[ctrl.data.opponent.color];
      m.redraw();
    },
    move: function(o) {
      o.isMove = true;
      ctrl.apiMove(o);
      m.redraw(false, true);
    },
    drop: function(o) {
      o.isDrop = true;
      ctrl.apiMove(o);
      m.redraw(false, true);
    },
    checkCount: function(e) {
      var isWhite = ctrl.data.player.color === 'white';
      ctrl.data.player.checks = isWhite ? e.white : e.black;
      ctrl.data.opponent.checks = isWhite ? e.black : e.white;
      m.redraw();
    },
    berserk: function(color) {
      ctrl.setBerserk(color);
    },
    reload: function() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    redirect: function(e) {
      socket.redirectToGame(e);
    },
    resync: function() {
      if (onUserTVRedirect) {
        onUserTVRedirect();
      } else {
        xhr.reload(ctrl).then(function(data) {
          socket.setVersion(data.player.version);
          ctrl.reload(data);
        }, function(err) {
          handleXhrError(err);
        });
      }
    },
    clock: function(o) {
      if (ctrl.clock) ctrl.clock.update(o.white, o.black);
    },
    end: function(winner) {
      ctrl.data.game.winner = winner;
      ground.end(ctrl.chessground);
      xhr.reload(ctrl).then(ctrl.reload);
      window.plugins.insomnia.allowSleepAgain();
      if (ctrl.data.game.speed === 'correspondence') {
        removeOfflineGameData(ctrl.data.url.round.substr(1));
      }
      if (!ctrl.data.player.spectator) {
        sound.dong();
        vibrate.quick();
        setTimeout(function() {
          session.refresh();
          ctrl.showActions();
          m.redraw();
        }, 500);
      }
    },
    gone: function(isGone) {
      if (!ctrl.data.opponent.ai && ctrl.data.game.speed !== 'correspondence') {
        gameApi.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone);
        if (!ctrl.chat || !ctrl.chat.showing) m.redraw(false, true);
      }
    },
    message: function(msg) {
      if (ctrl.chat) ctrl.chat.append(msg);
    },
    tvSelect: function(o) {
      if (ctrl.data.tv && o.channel === ctrl.data.tv && onFeatured) onFeatured(o);
    },
    crowd: function(o) {
      ['white', 'black'].forEach(function(c) {
        gameApi.setOnGame(ctrl.data, c, o[c]);
      });
      if (!ctrl.chat || !ctrl.chat.showing) m.redraw(false, true);
    }
  };
}

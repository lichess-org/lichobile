import gameApi from '../../../lichess/game';
import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import vibrate from '../../../vibrate';
import session from '../../../session';
import { removeOfflineGameData } from '../../../utils/offlineGames';
import socket from '../../../socket';
import Round, { ApiMoveOrDrop } from './Round';
import * as xhr from './roundXhr';
import ground from './ground';

export default function(ctrl: Round, onFeatured: () => void, onUserTVRedirect: () => void) {

 return {
    takebackOffers(o: { [index: string]: boolean }) {
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
      redraw();
    },
    move(o: ApiMoveOrDrop) {
      o.isMove = true;
      ctrl.apiMove(o);
      redraw();
    },
    drop(o: any) {
      o.isDrop = true;
      ctrl.apiMove(o);
      redraw();
    },
    checkCount(e: { white: number, black: number }) {
      const isWhite = ctrl.data.player.color === 'white';
      ctrl.data.player.checks = isWhite ? e.white : e.black;
      ctrl.data.opponent.checks = isWhite ? e.black : e.white;
      redraw();
    },
    berserk(color: Color) {
      ctrl.setBerserk(color);
    },
    reload() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    redirect(e: any) {
      socket.redirectToGame(e);
    },
    resync() {
      if (onUserTVRedirect) {
        onUserTVRedirect();
      } else {
        xhr.reload(ctrl)
        .then(data => {
          socket.setVersion(data.player.version);
          ctrl.reload(data);
        });
      }
    },
    clock(o: { white: number, black: number }) {
      if (ctrl.clock) ctrl.clock.update(o.white, o.black);
    },
    end(winner: Color) {
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
          redraw();
        }, 500);
      }
    },
    gone(isGone: boolean) {
      if (!ctrl.data.opponent.ai && ctrl.data.game.speed !== 'correspondence') {
        gameApi.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone);
        if (!ctrl.chat || !ctrl.chat.showing) redraw();
      }
    },
    message(msg: string) {
      if (ctrl.chat) ctrl.chat.append(msg);
    },
    tvSelect(o: { channel: string }) {
      if (ctrl.data.tv && o.channel === ctrl.data.tv && onFeatured) onFeatured();
    },
    crowd(o: { [key: string]: boolean }) {
      ['white', 'black'].forEach(c => {
        gameApi.setOnGame(ctrl.data, <Color>c, o[c]);
      });
      if (!ctrl.chat || !ctrl.chat.showing) redraw();
    }
  };
}

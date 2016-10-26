import * as m from 'mithril'
import socket from '../../socket';
import router from '../../router';
import { apiVersion } from '../../http';
import redraw from '../../utils/redraw';
import { hasNetwork, serializeQueryParameters, handleXhrError } from '../../utils'
import * as chess from '../../chess';
import { fetchJSON } from '../../http';
import * as helper from '../helper';
import makeData from '../shared/offlineRound/data';
import { getAnalyseData } from '../../utils/offlineGames';

export interface State {
  importGame(e: Event): void
  importing: Mithril.Property<boolean>
}

export default function oninit(vnode: Mithril.Vnode<{}>): void {
  helper.analyticsTrackView('Import game');

  socket.createDefault();

  const importing = m.prop(false);

  function submitOnline(pgn: string) {
    return fetchJSON('/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v' + apiVersion + '+json'
      },
      body: serializeQueryParameters({ pgn })
    }, true)
  }

  // function submitOffline(pgn: string) {
  //   importing(true);
  //   return chess.pgnRead({ pgn })
  //   .then((data: chess.PgnReadResponse) => {
  //     const setup = data.setup;
  //     const gameData = makeData({
  //       id: 'imported_pgn',
  //       variant: data.variant,
  //       initialFen: setup.fen,
  //       fen: setup.fen,
  //       player: setup.player,
  //       color: setup.player
  //     });
  //     gameData.player.spectator = true;
  //     const situations = data.replay;
  //     const analyseData = getAnalyseData({ data: gameData, situations, ply: setup.ply });
  //     importing(false);
  //     close();
  //     redraw();
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     window.plugins.toast.show('Invalid PGN', 'short', 'center');
  //     importing(false);
  //     redraw();
  //   });
  // }

  window.addEventListener('native.keyboardhide', helper.onKeyboardHide);
  window.addEventListener('native.keyboardshow', helper.onKeyboardShow);

  vnode.state = {
    importGame(e: Event) {
      const target = <any>e.target;
      const pgn = target[0].value;
      if (!pgn) return;
      importing(true);
      redraw()
      if (hasNetwork()) {
        submitOnline(pgn)
        .then(data => {
          console.log(data)
          router.set(`/analyse/online${data.url.round}`);
        })
        .catch(err => {
          importing(false);
          redraw()
          console.error(err);
          handleXhrError(err);
        })
      }
    },
    importing
  };
}

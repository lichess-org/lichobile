import * as m from 'mithril';
import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import * as chess from '../../chess';
import popupWidget from '../shared/popup';
import makeData from '../shared/offlineRound/data';
import { getAnalyseData } from '../../utils/offlineGames';
import backbutton from '../../backbutton';

import { AnalyseCtrlInterface, ImportPgnPopupInterface } from './interfaces';

export default {

  controller: function(root: AnalyseCtrlInterface) {
    let isOpen = false;
    const importing = m.prop(false);

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    function submit(e: Event) {
      const target = <any>e.target;
      const pgn = target[0].value;
      importing(true);
      chess.pgnRead({ pgn })
      .then((data: chess.PgnReadResponse) => {
        const setup = data.setup;
        const gameData = makeData({
          variant: data.variant,
          initialFen: setup.fen,
          fen: setup.fen,
          player: setup.player,
          color: setup.player
        });
        gameData.player.spectator = true;
        const situations = data.replay;
        const analyseData = getAnalyseData({ data: gameData, situations, ply: setup.ply });
        root.setData(analyseData);
        importing(false);
        close();
        redraw();
      })
      .catch(err => {
        console.error(err);
        window.plugins.toast.show('Import failed. Please make sure the PGN you entered is valid', 'short', 'center');
        importing(false);
        redraw();
      });
    }

    return {
      open,
      close,
      importing,
      submit,
      isOpen: function() {
        return isOpen;
      }
    };
  },

  view: function(ctrl: ImportPgnPopupInterface) {
    return popupWidget(
      'importPgnPopup',
      () => m('h2.withIcon[data-icon=U]', i18n('pasteThePgnStringHere')),
      () => {
        return m('form', {
          onsubmit: (e: Event) => {
            e.preventDefault();
            ctrl.submit(e);
          }
        }, [
          m('textarea.pgnImport'),
          m('button.newGameButton', ctrl.importing() ?
            m('div.fa.fa-hourglass-half') : i18n('importGame'))
        ]);
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

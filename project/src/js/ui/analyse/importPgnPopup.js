import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import makeData from '../shared/offlineRound/data';
import { getAnalyseData } from '../../utils/offlineGames';
import backbutton from '../../backbutton';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;
    const fen = m.prop();
    const importing = m.prop(false);

    function open(fentoSet) {
      backbutton.stack.push(close);
      fen(fentoSet);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    function submit(target) {
      const pgn = target[0].value;
      importing(true);
      root.chessLogic.importPgn(pgn)
      .then(data => {
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
        const analyseData = getAnalyseData({ data: gameData, situations });
        analyseData.orientation = setup.player;
        root.resetHashes();
        root.init(analyseData);
        importing(false);
        close();
        m.redraw();
      })
      .catch(err => {
        console.error(err);
        window.plugins.toast.show('Import failed. Please make sure the PGN you entered is valid', 'short', 'center');
        importing(false);
        m.redraw();
      });
    }

    return {
      open,
      close,
      fen,
      importing,
      submit,
      isOpen: function() {
        return isOpen;
      }
    };
  },

  view: function(ctrl) {
    return popupWidget(
      'importPgnPopup',
      () => m('h2.withIcon[data-icon=U]', i18n('pasteThePgnStringHere')),
      () => {
        return m('form', {
          onsubmit: e => {
            e.preventDefault();
            ctrl.submit(e.target);
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

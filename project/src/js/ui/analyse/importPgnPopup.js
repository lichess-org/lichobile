import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;
    const fen = m.prop();

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
      root.chessLogic.importPgn(pgn)
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
    }

    return {
      open,
      close,
      fen,
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
          m('button.newGameButton', i18n('importGame'))
        ]);
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

import * as m from 'mithril'
import socket from '../../socket';
import router from '../../router';
import { apiVersion } from '../../http';
import redraw from '../../utils/redraw';
import { hasNetwork, serializeQueryParameters, handleXhrError } from '../../utils'
import { fetchJSON } from '../../http';
import * as helper from '../helper';
import { header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';

export interface State {
  importGame(e: Event): void
  importing: Mithril.Stream<boolean>
}

const ImporterScreen: Mithril.Component<{}, State> = {
  oninit(vnode) {
    helper.analyticsTrackView('Import game');

    socket.createDefault();

    const importing = m.prop(false);

    function submitOnline(pgn: string): Promise<OnlineGameData> {
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

    window.addEventListener('native.keyboardhide', helper.onKeyboardHide);
    window.addEventListener('native.keyboardshow', helper.onKeyboardShow);

    vnode.state = {
      importGame(e: Event) {
        const target = e.target as EventTarget;
        const pgn = target[0].value;
        if (!pgn) return;
        importing(true);
        redraw()
        if (hasNetwork()) {
          submitOnline(pgn)
          .then(data => {
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
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.removeEventListener('native.keyboardshow', helper.onKeyboardShow);
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide);
  },

  view(vnode) {
    const headerCtrl = () => header(i18n('importGame'));
    const bodyCtrl = () => renderBody(vnode.state);
    return layout.free(headerCtrl, bodyCtrl);
  }

}

function renderBody(ctrl: State) {
  return m('div.gameImporter.native_scroller', [
    m('p', 'When pasting a game PGN, you get a browsable replay and a computer analysis.'),
    m('form', {
      onsubmit: (e: Event) => {
        e.preventDefault();
        ctrl.importGame(e);
      }
    }, [
      m('label', i18n('pasteThePgnStringHere') + ' :'),
      m('textarea.pgnImport'),
      m('button.fat', ctrl.importing() ?
        m('div.fa.fa-hourglass-half') : i18n('importGame'))
    ])
  ]);
}

export default ImporterScreen

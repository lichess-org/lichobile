import * as h from 'mithril/hyperscript'
import socket from '../../socket';
import router from '../../router';
import settings from '../../settings';
import { apiVersion } from '../../http';
import redraw from '../../utils/redraw';
import { hasNetwork, serializeQueryParameters, handleXhrError } from '../../utils'
import { fetchJSON } from '../../http';
import * as helper from '../helper';
import { dropShadowHeader } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import formWidgets from '../shared/form';
import * as stream from 'mithril/stream';

export interface State {
  importGame(e: Event): void
  importing: Mithril.Stream<boolean>
}

interface SendData {
  pgn: string
  analyse?: boolean
}

const ImporterScreen: Mithril.Component<{}, State> = {
  oninit(vnode) {
    helper.analyticsTrackView('Import game');

    socket.createDefault();

    const importing = stream(false);

    function submitOnline(pgn: string, analyse: boolean): Promise<OnlineGameData> {
      const data: SendData = { pgn }
      if (analyse) data.analyse = true;

      return fetchJSON('/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/vnd.lichess.v' + apiVersion + '+json'
        },
        body: serializeQueryParameters(data)
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
          submitOnline(pgn, settings.importer.analyse())
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
    const headerCtrl = () => dropShadowHeader(i18n('importGame'));
    const bodyCtrl = () => renderBody(vnode.state);
    return layout.free(headerCtrl, bodyCtrl);
  }

}

function renderBody(ctrl: State) {
  return h('div.gameImporter.native_scroller', [
    h('p', 'When pasting a game PGN, you get a browsable replay and a computer analysis.'),
    h('form', {
      onsubmit: (e: Event) => {
        e.preventDefault();
        ctrl.importGame(e);
      }
    }, [
      h('label', i18n('pasteThePgnStringHere') + ' :'),
      h('textarea.pgnImport'),
      formWidgets.renderCheckbox(i18n('requestAComputerAnalysis'), 'analyse', settings.importer.analyse),
      h('button.fatButton', ctrl.importing() ?
        h('div.fa.fa-hourglass-half') : i18n('importGame'))
    ])
  ]);
}

export default ImporterScreen

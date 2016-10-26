import * as m from 'mithril'
import { header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';

import { State as ImporterState } from './importerOninit'

export default function view(vnode: Mithril.Vnode<{}>) {
  const ctrl = vnode.state;
  const headerCtrl = () => header(i18n('importGame'));
  const bodyCtrl = () => renderBody(ctrl);
  return layout.free(headerCtrl, bodyCtrl);
}


function renderBody(ctrl: ImporterState) {
  return m('div.gameImporter.native_scroller', [
    m('p', 'When pasting a game PGN, you get a browsable replay and a computer analysis.'),
    m('p', 'You can import a game when you are online and offline. Only when you are online you can retrieve the game later from your profile.'),
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

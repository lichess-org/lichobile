import * as h from 'mithril/hyperscript'
import socket from '../../socket'
import settings from '../../settings'
import * as helper from '../helper'
import { dropShadowHeader } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import formWidgets from '../shared/form'

import ImporterCtrl, { IImporterCtrl } from './ImporterCtrl'

interface State {
  ctrl: IImporterCtrl
}

const ImporterScreen: Mithril.Component<{}, State> = {
  oninit() {
    socket.createDefault()
    this.ctrl = ImporterCtrl()
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.removeEventListener('native.keyboardshow', helper.onKeyboardShow)
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide)
  },

  view() {
    const headerCtrl = () => dropShadowHeader(i18n('importGame'))
    const bodyCtrl = () => renderBody(this.ctrl)
    return layout.free(headerCtrl, bodyCtrl)
  }

}

function renderBody(ctrl: IImporterCtrl) {
  return h('div.gameImporter.native_scroller', [
    h('p', 'When pasting a game PGN, you get a browsable replay and a computer analysis.'),
    h('form', {
      onsubmit: (e: Event) => {
        e.preventDefault()
        const target = e.target as HTMLFormElement
        const pgn: string = target[0].value
        if (pgn) ctrl.importGame(pgn)
      }
    }, [
      h('label', i18n('pasteThePgnStringHere') + ' :'),
      h('textarea.pgnImport'),
      formWidgets.renderCheckbox(i18n('requestAComputerAnalysis'), 'analyse', settings.importer.analyse),
      h('button.fatButton', ctrl.importing() ?
        h('div.fa.fa-hourglass-half') : i18n('importGame'))
    ])
  ])
}

export default ImporterScreen

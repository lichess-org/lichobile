import h from 'mithril/hyperscript'
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

export interface ImportEvent {
  pgn: string
}

const ImporterScreen: Mithril.Component<ImportEvent, State> = {
  oninit(vnode) {
    socket.createDefault()
    this.ctrl = ImporterCtrl()
    this.ctrl.pgn(vnode.attrs.pgn)
  },

  oncreate: helper.viewFadeIn,

  view() {
    const header = dropShadowHeader(i18n('importGame'))
    const body = renderBody(this.ctrl)
    return layout.free(header, body)
  }

}

function renderBody(ctrl: IImporterCtrl) {
  return h('div.gameImporter.native_scroller', [
    h('p', i18n('importGameExplanation')),
    h('form', {
      onsubmit: (e: Event) => {
        e.preventDefault()
        if (ctrl.pgn()) ctrl.importGame(ctrl.pgn()!)
      }
    }, [
      h('label', i18n('pasteThePgnStringHere') + ' :'),
      h('textarea.pgnImport', {
        value: ctrl.pgn(),
        onchange(e: Event) {
          const target = e.target as HTMLTextAreaElement
          ctrl.pgn(target.value)
        }
      }),
      formWidgets.renderCheckbox(i18n('requestAComputerAnalysis'), 'analyse', settings.importer.analyse),
      h('button.fatButton', ctrl.importing() ?
        h('div.fa.fa-hourglass-half') : i18n('importGame'))
    ])
  ])
}

export default ImporterScreen

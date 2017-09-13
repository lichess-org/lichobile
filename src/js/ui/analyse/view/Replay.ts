import * as h from 'mithril/hyperscript'
import { noop } from '../../../utils'
import settings from '../../../settings'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'
import renderTree from './treeView'

interface ReplayDataSet extends DOMStringMap {
  path: string
}

let pieceNotation: boolean
export default {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.vm.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
    pieceNotation = pieceNotation || settings.game.pieceNotation()
    const replayClass = 'analyse-replay native_scroller' + (pieceNotation ? ' displayPieces' : '')
    return h('div#replay.analyse-replay.native_scroller', {
      className: replayClass,
      oncreate: helper.ontapY(e => onReplayTap(ctrl, e!), undefined, getMoveEl)
    }, [
      renderOpeningBox(ctrl),
      renderTree(ctrl)
    ])
  }
} as Mithril.Component<{ ctrl: AnalyseCtrl }, {}>

function onReplayTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getMoveEl(e)
  if (el && (el.dataset as ReplayDataSet).path) {
    ctrl.jump((el.dataset as ReplayDataSet).path)
  }
}

function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move')
}

function renderOpeningBox(ctrl: AnalyseCtrl) {
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  if (opening) return h('div', {
    key: 'opening-box',
    className: 'analyse-openingBox',
    oncreate: helper.ontapY(noop, () => window.plugins.toast.show(opening.eco + ' ' + opening.name, 'short', 'center'))
  }, [
    h('strong', opening.eco),
    ' ' + opening.name
  ])
}


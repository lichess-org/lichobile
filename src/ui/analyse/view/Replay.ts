import h from 'mithril/hyperscript'
import redraw from '../../../utils/redraw'
import settings from '../../../settings'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'
import renderTree from './treeView'

interface Attrs {
  ctrl: AnalyseCtrl
  rightTabActive: boolean
}

let pieceNotation: boolean
export default {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.replaying
  },
  view({ attrs }) {
    const { ctrl, rightTabActive } = attrs
    pieceNotation = pieceNotation || settings.game.pieceNotation()
    const className = [
      pieceNotation ? 'displayPieces' : '',
      rightTabActive ? 'rta' : '',
    ].join(' ')
    return h('div#replay.analyse-replay.native_scroller', {
      className,
      oncreate: helper.ontapXY(e => onReplayTap(ctrl, e), (e: TouchEvent) => {
        const el = getMoveEl(e!)
        const ds = el.dataset
        if (el && ds.path) {
          ctrl.contextMenu = ds.path
          redraw()
        }
      }, getMoveEl, false)
    }, renderTree(ctrl))
  }
} as Mithril.Component<Attrs>

function onReplayTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getMoveEl(e)
  if (el && el.dataset.path) {
    ctrl.jump(el.dataset.path)
  }
}

function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move')
}

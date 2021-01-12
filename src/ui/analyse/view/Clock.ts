import h from 'mithril/hyperscript'

import AnalyseCtrl from '../AnalyseCtrl'

export default {
  onbeforeupdate({ attrs }, { attrs: oldAttrs }) {
    return attrs.color !== oldAttrs.color || !attrs.ctrl.replaying
  },
  view({ attrs }) {
    const { ctrl, color } = attrs
    const node = ctrl.node, clock = node.clock
    if (clock === undefined) return
    const parentClock = ctrl.tree.getParentClock(node, ctrl.path)
    let whiteCentis, blackCentis
    const isWhiteTurn = node.ply % 2 === 0
    if (isWhiteTurn) {
      whiteCentis = parentClock
      blackCentis = clock
    }
    else {
      whiteCentis = clock
      blackCentis = parentClock
    }
    const centis = color === 'white' ? whiteCentis! : blackCentis!
    const current = color === 'white' ? isWhiteTurn : !isWhiteTurn

    return h('span.analyse-clock', {
      className: current ? 'current' : '',
    }, clockContent(centis))
  }
} as Mithril.Component<{ ctrl: AnalyseCtrl, color: Color }>

function clockContent(centis: number): Mithril.Child {
  if (centis === undefined) return h('span.time', ['-'])
  const date = new Date(centis * 10),
  millis = date.getUTCMilliseconds(),
  sep = ':',
  baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds())
  if (centis >= 360000) return h('span.time', [Math.floor(centis / 360000) + sep + baseStr])
  const tenthsStr = Math.floor(millis / 100).toString()
  return h('span.time', [
    baseStr,
    h('tenths', '.' + tenthsStr)
  ])
}

function pad2(num: number): string {
  return (num < 10 ? '0' : '') + num
}

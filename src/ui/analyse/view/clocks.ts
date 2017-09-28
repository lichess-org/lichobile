import * as h from 'mithril/hyperscript'

import AnalyseCtrl from '../AnalyseCtrl'

export default {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
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
    const whitePov = ctrl.bottomColor() === 'white'
    const whiteEl = renderClock('white', whiteCentis!, isWhiteTurn)
    const blackEl = renderClock('black', blackCentis!, !isWhiteTurn)

    return h('div.analyse-clocks', whitePov ?
      [blackEl, whiteEl] : [whiteEl, blackEl]
    )
  }
} as Mithril.Component<{ ctrl: AnalyseCtrl }, {}>

function renderClock(color: Color, centis: number, current: boolean): Mithril.BaseNode {
  return h('div.analyse-clock', {
    className: current ? 'current' : '',
  }, [h('span.color-icon.' + color), clockContent(centis)])
}

function clockContent(centis: number): Mithril.BaseNode {
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

import * as h from 'mithril/hyperscript'
import * as range from 'lodash/range'

import AnalyseCtrl from '../AnalyseCtrl'
import { renderEval } from '../util'
import pv2san from './pv2san'

export default function renderCeval(ctrl: AnalyseCtrl) {
  if (!ctrl.ceval.enabled()) return h('div.ceval-notEnabled', 'not enabled')

  const multiPv = ctrl.ceval.multiPv
  const node = ctrl.node
  if (node.ceval) {
    const pvs = node.ceval.pvs
    return h('div.ceval-pv_box.native_scroller', {
      key: 'ceval-pvs',
      'data-fen': node.fen
    }, range(multiPv).map((i) => {
      if (!pvs[i]) return h('div.pv')
      const san = pv2san(ctrl.ceval.variant, node.fen, false, pvs[i].moves, pvs[i].mate)
      return h('div.ceval-pv', {
        'data-uci': pvs[i].moves[0],
        className: i % 2 ? 'even' : 'odd'
      }, [
        multiPv > 1 ? h('strong.ceval-pv_eval', pvs[i].mate !== undefined ? ('#' + pvs[i].mate) : renderEval(pvs[i].cp!)) : null,
        h('div.ceval-pv-line', san)
      ])
    }))
  }
  else {
    return h('div.ceval-pv_box.native_scroller.loading', {
      key: 'ceval-loading'
    }, spinnerPearl())
  }
}

export const EvalBox: Mithril.Component<{ ctrl: AnalyseCtrl }, {}> = {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
    const node = ctrl.node
    if (!node) return null

    const { ceval } = node
    const fav = node.eval || ceval
    let pearl: Mithril.Children, percent: number

    if (fav && fav.cp !== undefined) {
      pearl = renderEval(fav.cp)
      percent = ceval ?
        Math.min(100, Math.round(100 * ceval.depth / ceval.maxDepth)) : 0
    }
    else if (fav && fav.mate !== undefined) {
      pearl = '#' + fav.mate
      percent = 100
    }
    else if (ctrl.gameOver()) {
      pearl = '-'
      percent = 0
    }
    else  {
      pearl = ctrl.replaying ? '' : spinnerPearl()
      percent = 0
    }

    return (
      <div className="ceval-curEval">
        { pearl }
      </div>
    )
  }
}

function spinnerPearl() {
 return h('div.spinner.fa.fa-hourglass-half')
}

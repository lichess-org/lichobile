import * as h from 'mithril/hyperscript'

import AnalyseCtrl from '../AnalyseCtrl'
import { renderEval } from '../util'

export default function renderCeval(ctrl: AnalyseCtrl) {
  return h('div', 'todo')
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
      pearl = ctrl.replaying ? '' : spinnerPearl
      percent = 0
    }

    return (
      <div className="analyse-curEval">
        { pearl }
        { ctrl.settings.s.showBestMove && ceval && ceval.bestSan ?
        <div className="analyse-bestMove">
          best {ceval.bestSan}
        </div> : null
        }
      </div>
    )
  }
}

const spinnerPearl = <div className="spinner fa fa-hourglass-half"></div>

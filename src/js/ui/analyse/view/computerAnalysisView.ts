import * as h from 'mithril/hyperscript'
import i18n  from '../../../i18n'
import * as gameApi from '../../../lichess/game'
import { playerName } from '../../../utils'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import { viewportDim, renderRatingDiff } from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'
import AcplChart from '../charts/acpl'

export default function renderComputerAnalysis(ctrl: AnalyseCtrl): Mithril.BaseNode {
  const vw = viewportDim().vw

  return h('div.analyse-computerAnalysis.native_scroller', [
    ctrl.data.analysis ? [
      h('svg#acpl-chart.acpl-chart', {
        width: vw,
        height: 200,
        oncreate({ dom }: Mithril.DOMNode) {
          setTimeout(() => {
            AcplChart(dom as SVGElement, ctrl.data)
          }, 300)
        }
      }),
      h(AcplSummary, { d: ctrl.data })
    ] : h('div', 'Request computer analysis')
  ])
}

const AcplSummary: Mithril.Component<{ d: AnalyseData }, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.d.analysis !== oldattrs.d.analysis
  },

  view({ attrs }) {
    const { d } = attrs

    return h('div.evalSummary', ['white', 'black'].map((color: Color) => {
      const p = gameApi.getPlayer(d, color)

      return h('table', [
        h('thead', h('tr', [
          h('th', h('span.light.color-icon.' + color)),
          h('td', [playerName(p), p ? renderRatingDiff(p) : null])
        ])),
        h('tbody', [
          advices.map(a => {
            const nb = d.analysis && d.analysis[color][a[0]]
            return h('tr', [
              h('th', nb),
              h('td', i18n(a[1]))
            ])
          }),
          h('tr', [
            h('th', d.analysis && d.analysis[color].acpl),
            h('td', i18n('averageCentipawnLoss'))
          ])
        ])
      ])
    }))
  }
}

const advices = [
  ['inaccuracy', 'inaccuracies'],
  ['mistake', 'mistakes'],
  ['blunder', 'blunders']
]

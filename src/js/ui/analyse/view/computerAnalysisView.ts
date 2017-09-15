import * as h from 'mithril/hyperscript'
import i18n  from '../../../i18n'
import redraw from '../../../utils/redraw'
import * as gameApi from '../../../lichess/game'
import spinner from '../../../spinner'
import { playerName, handleXhrError } from '../../../utils'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import * as helper from '../../helper'

import { requestComputerAnalysis } from '../analyseXhr'
import AnalyseCtrl from '../AnalyseCtrl'
import AcplChart from '../charts/acpl'

export default function renderComputerAnalysis(ctrl: AnalyseCtrl): Mithril.BaseNode {
  const vw = helper.viewportDim().vw

  return h('div.analyse-computerAnalysis.native_scroller', [
    ctrl.data.analysis ? [
      h('svg#acpl-chart.acpl-chart', {
        width: vw,
        height: 100,
        oncreate({ dom }: Mithril.DOMNode) {
          setTimeout(() => {
            AcplChart(dom as SVGElement, ctrl.data)
          }, 300)
        }
      }),
      h(AcplSummary, { d: ctrl.data })
    ] : renderAnalysisRequest(ctrl)
  ])
}

function renderAnalysisRequest(ctrl: AnalyseCtrl) {
  return h('div.analyse-requestComputer', [
    ctrl.analysisProgress ? h('div.analysisProgress', [
      h('span', 'Analysis in progress'),
      spinner.getVdom()
    ]) : h('button.fatButton', {
      oncreate: helper.ontap(() => {
        return requestComputerAnalysis(ctrl.data.game.id)
        .then(() => {
          ctrl.analysisProgress = true
          redraw()
        })
        .catch(handleXhrError)
      })
    }, [h('span.fa.fa-bar-chart'), i18n('requestAComputerAnalysis')])
  ])

}
const AcplSummary: Mithril.Component<{ d: AnalyseData }, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.d.analysis !== oldattrs.d.analysis
  },

  view({ attrs }) {
    const { d } = attrs

    return h('div.analyse-evalSummary', ['white', 'black'].map((color: Color) => {
      const p = gameApi.getPlayer(d, color)

      return h('table', [
        h('thead', h('tr', [
          h('th', h('span.color-icon.' + color)),
          h('td', [playerName(p), p ? helper.renderRatingDiff(p) : null])
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

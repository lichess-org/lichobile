import * as h from 'mithril/hyperscript'
import i18n  from '../../../i18n'
import redraw from '../../../utils/redraw'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import * as gameApi from '../../../lichess/game'
import spinner from '../../../spinner'
import { handleXhrError } from '../../../utils'
import { playerName } from '../../../lichess/player'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import * as helper from '../../helper'

import { requestComputerAnalysis } from '../analyseXhr'
import AnalyseCtrl from '../AnalyseCtrl'
import drawAcplChart from '../charts/acpl'

export default function renderComputerAnalysis(ctrl: AnalyseCtrl): Mithril.BaseNode {
  return h('div.analyse-computerAnalysis.native_scroller',
    ctrl.data.analysis ? renderAnalysis(ctrl) : renderAnalysisRequest(ctrl)
  )
}

function renderAnalysis(ctrl: AnalyseCtrl) {
  const vw = helper.viewportDim().vw

  return h.fragment({
    key: 'analysis'
  }, [
    h('svg#acpl-chart.analyse-acplChart', {
      key: 'chart',
      width: vw,
      height: 100,
      oncreate({ dom }: Mithril.DOMNode) {
        setTimeout(() => {
          this.updateCurPly = drawAcplChart(dom as SVGElement, ctrl.data, ctrl.node.ply)
        }, 300)
      },
      onupdate() {
        if (this.updateCurPly) batchRequestAnimationFrame(() =>
          this.updateCurPly(ctrl.node.ply)
        )
      }
    }),
    h(AcplSummary, { d: ctrl.data })
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

function renderAnalysisRequest(ctrl: AnalyseCtrl) {
  return h('div.analyse-requestComputer', {
    key: 'request-analysis'
  }, [
    ctrl.analysisProgress ? h('div.analyse-requestProgress', [
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

const advices = [
  ['inaccuracy', 'inaccuracies'],
  ['mistake', 'mistakes'],
  ['blunder', 'blunders']
]

import * as h from 'mithril/hyperscript'
import i18n  from '../../../i18n'
import { handleXhrError, shallowEqual } from '../../../utils'
import redraw from '../../../utils/redraw'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import * as gameApi from '../../../lichess/game'
import spinner from '../../../spinner'
import { playerName } from '../../../lichess/player'
import { AnalyseData, RemoteEvalSummary } from '../../../lichess/interfaces/analyse'
import * as helper from '../../helper'

import { requestComputerAnalysis } from '../analyseXhr'
import AnalyseCtrl from '../AnalyseCtrl'
import drawAcplChart from '../charts/acpl'
import drawMoveTimesChart from '../charts/moveTimes'

export default function renderGameAnalysis(ctrl: AnalyseCtrl): Mithril.BaseNode {
  const isPortrait = helper.isPortrait()
  const vd = helper.viewportDim()
  const d = ctrl.data

  return h('div.analyse-gameAnalysis.native_scroller',
    d.analysis ? renderAnalysis(ctrl, vd, isPortrait) : renderAnalysisRequest(ctrl),
    d.game.moveCentis ? renderMoveTimes(ctrl, d.game.moveCentis, vd, isPortrait) : null
  )
}

function renderAnalysis(ctrl: AnalyseCtrl, vd: helper.ViewportDim, isPortrait: boolean) {
  return h('div.analyse-computerAnalysis', {
    key: 'analysis'
  }, [
    h('strong.title', i18n('computerAnalysis')),
    ctrl.analysisProgress ?
    h('div.analyse-gameAnalysis_chartPlaceholder', spinner.getVdom('monochrome')) :
    h('svg#acpl-chart.analyse-chart', {
      key: 'chart',
      width: isPortrait ? vd.vw : vd.vw - vd.vh + helper.headerHeight,
      height: 100,
      oncreate({ dom }: Mithril.DOMNode) {
        setTimeout(() => {
          this.updateCurPly = drawAcplChart(dom as SVGElement, ctrl.data, ctrl.node.ply)
        }, 300)
      },
      onupdate() {
        if (this.updateCurPly) batchRequestAnimationFrame(() => {
          if (ctrl.onMainline) this.updateCurPly(ctrl.node.ply)
          else this.updateCurPly(null)
        })
      }
    }),
    h(AcplSummary, { d: ctrl.data, analysis: ctrl.data.analysis! })
  ])
}

const AcplSummary: Mithril.Component<{ d: AnalyseData, analysis: RemoteEvalSummary }, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return !shallowEqual(attrs.analysis, oldattrs.analysis)
  },

  view({ attrs }) {
    const { d, analysis } = attrs

    return h('div.analyse-evalSummary', ['white', 'black'].map((color: Color) => {
      const p = gameApi.getPlayer(d, color)

      return h('table', [
        h('thead', h('tr', [
          h('th', h('span.color-icon.' + color)),
          h('td', [playerName(p), p ? helper.renderRatingDiff(p) : null])
        ])),
        h('tbody', [
          advices.map(a => {
            const nb = analysis && analysis[color][a[0]]
            return h('tr', [
              h('th', nb),
              h('td', i18n(a[1]))
            ])
          }),
          h('tr', [
            h('th', analysis && analysis[color].acpl),
            h('td', i18n('averageCentipawnLoss'))
          ])
        ])
      ])
    }))
  }
}

function renderAnalysisRequest(ctrl: AnalyseCtrl) {
  return h('div.analyse-computerAnalysis', {
    key: 'request-analysis'
  }, [
    ctrl.analysisProgress ? h('div.analyse-requestProgress', [
      h('span', 'Analysis in progress'),
      spinner.getVdom('monochrome')
    ]) : h('button.fatButton', {
      oncreate: helper.ontapXY(() => {
        return requestComputerAnalysis(ctrl.data.game.id)
        .then(() => {
          ctrl.analysisProgress = true
          redraw()
        })
        .catch(handleXhrError)
      })
    }, [i18n('requestAComputerAnalysis')])
  ])
}

function renderMoveTimes(ctrl: AnalyseCtrl, moveCentis: number[], vd: helper.ViewportDim, isPortrait: boolean) {
  return h('div.analyse-moveTimes', {
    key: 'move-times'
  }, [
    h('strong.title', i18n('moveTimes')),
    h('svg#moveTimes-chart.analyse-chart', {
      key: 'movetimes-chart',
      width: isPortrait ? vd.vw : vd.vw - vd.vh + helper.headerHeight,
      height: 150,
      oncreate({ dom }: Mithril.DOMNode) {
        setTimeout(() => {
          this.updateCurPly = drawMoveTimesChart(dom as SVGElement, ctrl.data, moveCentis, ctrl.node.ply)
        }, 300)
      },
      onupdate() {
        if (this.updateCurPly) batchRequestAnimationFrame(() => {
          if (ctrl.onMainline) this.updateCurPly(ctrl.node.ply)
          else this.updateCurPly(null)
        })
      }
    })
  ])
}

const advices = [
  ['inaccuracy', 'inaccuracies'],
  ['mistake', 'mistakes'],
  ['blunder', 'blunders']
]

import * as h from 'mithril/hyperscript'
import i18n  from '../../../i18n'
import * as gameApi from '../../../lichess/game'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'

export default function renderComputerAnalysis(ctrl: AnalyseCtrl): Mithril.BaseNode {
  return h('div.analyse-computerAnalysis.native_scroller', [
    ctrl.data.analysis ?
      renderEvalSummary(ctrl) : h('div', 'Request computer analysis')
  ])
}

function renderEvalSummary(ctrl: AnalyseCtrl): Mithril.BaseNode {
  const d = ctrl.data

  return h('div.evalSummary', ['white', 'black'].map((color: Color) => {
    return h('table', [
      h('thead', h('tr', [
        h('th', h('span.light.color-icon.' + color)),
        h('td', renderPlayer(d, color))
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

const advices = [
  ['inaccuracy', 'inaccuracies'],
  ['mistake', 'mistakes'],
  ['blunder', 'blunders']
]

function renderPlayer(data: AnalyseData, color: Color) {
  const p = gameApi.getPlayer(data, color)
  if (p) {
    if (p.name) return [p.name]
    if (p.ai) return ['Stockfish level ' + p.ai]
    if (p.user) return [p.user.username, helper.renderRatingDiff(p)]
  }
  return ['Anonymous']
}


import h from 'mithril/hyperscript'
import i18n, { plural } from '~/i18n'
import { ForecastStep } from '~/lichess/interfaces/forecast'
import settings from '~/settings'
import { ontap } from '~/ui/helper'
import AnalyseCtrl from '../AnalyseCtrl'
import ForecastCtrl from './ForecastCtrl'
import { groupMoves } from './util'

type MaybeVNode = Mithril.Child | null

function makeCandidateNodes(
  ctrl: AnalyseCtrl,
  fctrl: ForecastCtrl
): ForecastStep[] {
  const afterPly = ctrl.tree.getCurrentNodesAfterPly(
    ctrl.nodeList,
    ctrl.mainline,
    ctrl.data.game.turns
  )
  return fctrl.truncate(
    afterPly.map((node) => ({
      ply: node.ply,
      fen: node.fen,
      uci: node.uci!,
      san: node.san!,
      check: node.check,
    }))
  )
}

function renderNodesHtml(nodes: ForecastStep[]): MaybeVNode[] {
  if (!nodes[0]) return []
  if (!nodes[0].san) nodes = nodes.slice(1)
  if (!nodes[0]) return []

  return groupMoves(nodes).map(({ black, white, index }) => {
    return h('move', [
      h('index', index + (white ? '.' : '...')),
      white ? h('san', white) : null,
      black ? h('san', black) : null,
    ])
  })
}

function renderOnMyTurnView(ctrl: AnalyseCtrl, candidate: ForecastStep[]): MaybeVNode {
  if (!ctrl.forecast?.isMyTurn) return
  const firstNode = candidate[0]
  if (!firstNode) return
  const candidates = ctrl.forecast!.findStartingWithNode(firstNode)
  if (!candidates.length) return

  const lineCount = candidates.filter((candidate) => {
    return candidate.length > 1
  }).length

  return (
    h('div.on-my-turn',
      h(
        'button.defaultButton',
        {
          oncreate: ontap(() => ctrl.forecast!.playAndSave(firstNode))
        }, [
          h('span.fa.fa-check'),
          h('span', [
            h('strong', i18n('playX', candidate[0].san)),
            ' ',
            lineCount ? h('span', plural('andSaveNbPremoveLines', lineCount)) : null
          ])
        ],
      )
    )
  )
}

function renderSpinner(): Mithril.Child {
  return h('div.spinner_overlay', h('div.spinner.fa.fa-hourglass-half'))
}

export default function renderForecasts(ctrl: AnalyseCtrl): MaybeVNode {
  const fctrl = ctrl.forecast
  if (!fctrl) return null

  const candidateNodes = makeCandidateNodes(ctrl, fctrl)
  const isCandidate = fctrl.isCandidate(candidateNodes)

  return (
    h('div.forecasts-wrapper.native_scroller', [
      h(
        'div.forecasts-list',
        {
          class: settings.game.pieceNotation() ? 'displayPieces' : '',
        },
        [
          ...fctrl.lines.map((nodes, i) => {
            return h(
              'div.forecast',
              {
                key: nodes.map(node => node.san).join(''),
                oncreate: ontap(
                  () => { /* noop */ },
                  () => {
                    fctrl.contextIndex = i
                  }
                ),
              },
              [h('sans', renderNodesHtml(nodes))]
            )
          }),
          isCandidate
            ? h(
                'div.forecast.add-forecast',
                {
                  key: `candidate-${candidateNodes.map(node => node.san).join('')}`,
                  oncreate: ontap(() => {
                    const candidateNodes = makeCandidateNodes(ctrl, fctrl)
                    fctrl.add(candidateNodes)
                  })
                },
                [
                  h('span.fa.fa-plus-circle'),
                  h('sans', renderNodesHtml(candidateNodes)),
                ]
              )
            : h.fragment({key: 'emptyCandidateForecast'}, []),
        ]
      ),
      h(
        'div.info',
        isCandidate ? null : i18n('playVariationToCreateConditionalPremoves')
      ),
      renderOnMyTurnView(ctrl, candidateNodes),
      fctrl.loading ? renderSpinner() : null,
    ])
  )
}

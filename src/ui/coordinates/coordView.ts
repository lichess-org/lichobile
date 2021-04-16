import h from 'mithril/hyperscript'
import settings from '~/settings'
import { header } from '../shared/common'
import Board from '../shared/Board'
import i18n from '../../i18n'
import layout from '../layout'
import * as helper from '../helper'

import CoordCtrl from './CoordCtrl'

export default function view(ctrl: CoordCtrl): Mithril.Children {

  const store = settings.coordinates

  const renderCoord = (e: Key, i: number) => {
    return h('div.next_coord', {
      className: ('coord' + (i + 1)) + (ctrl.tempWrong === true && i === 0 ? ' nope' : ''),
    }, e)
  }

  return layout.board(header(i18n('coordinateTraining')), [
    h('div.coord-trainer__board_wrapper', [
      h('div.coord-trainer__progress', [
        h('div.coord-trainer__progress_bar', {
          className: ctrl.wrongAnswer ? 'nope' : '',
          style: { width: ctrl.progress + '%' }
        }),
      ]),
      h('div.coord-trainer__coords', [
        ...ctrl.coords.map(renderCoord),
      ]),
      h(Board, {
        variant: 'standard',
        chessground: ctrl.chessground
      }),
    ]),
    h('div.table.training-tableWrapper', [
      h('div.training-table.coord-trainer__table.native_scroller.box', [
        ctrl.started ?
          h('div.coord-trainer__score', {
            className: ctrl.wrongAnswer ? 'nope' : '',
          }, ctrl.score) :
          h.fragment({}, [
            ctrl.averageScores ? h('div.coord-trainer__average', [
              h('div', h.trust(i18n('averageScoreAsWhiteX', `<strong>${ctrl.averageScores.white !== null ? ctrl.averageScores.white : '?'}</strong>`))),
              h('div', h.trust(i18n('averageScoreAsBlackX', `<strong>${ctrl.averageScores.black !== null ? ctrl.averageScores.black : '?'}</strong>`))),
            ]) : null,
            h('button.start.defaultButton.fat.wrap',
              { oncreate: helper.ontap(() => ctrl.startTraining()) },
              i18n('startTraining')
            ),
          ]),
      ]),
      h('div.actions_bar.coord-trainer__colorChoice',
        ['black', 'random', 'white'].map(o => {
          return h('i.action_bar_button.' + o, {
            className: o === store.colorChoice() ? 'selected' : '',
            oncreate: helper.ontap(() => {
              store.colorChoice(o as Color | 'random')
            })
          })
        })
      ),
    ]),
  ])
}

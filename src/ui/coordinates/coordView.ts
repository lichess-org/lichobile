import h from 'mithril/hyperscript'
import { header } from '../shared/common'
import Board from '../shared/Board'
import i18n from '../../i18n'
import layout from '../layout'
import CoordCtrl from './coordCtrl'
import * as helper from '../helper'
import * as util from '~/chessground/util'

export default function view(ctrl: CoordCtrl) {

  const isWrongAnswer = (index: number) =>
    ctrl.wrongAnswer === true && index === 0 ? 'nope' : ''

  return layout.board(header(i18n('coordinateTraining')), [
    h('main#trainer.coord-trainer.training', [
      h('div.coord-trainer__side', { style: { visibility: ctrl.started } }, [
        h('div.box', [h('h1', i18n('coordinates'))]),
        h('form.color.buttons', [
          h('group.radio', [
            h('div', [
              h('input#coord_color_3', {
                type: 'radio',
                name: 'color',
                value: 3,
                onclick: () => ctrl.chessground.orienteWithColor('black'),
              }),
              h('label.color.color_3', { for: 'coord_color_3' }, [h('i')]),
            ]),
            h('div', [
              h('input#coord_color_2', {
                type: 'radio',
                name: 'color',
                checked: 'checked',
                value: 2,
                onclick: () => ctrl.chessground.orienteWithColor(util.randomColor()),
              }),
              h('label.color.color_2', { for: 'coord_color_2' }, [h('i')]),
            ]),
            h('div', [
              h('input#coord_color_1', {
                type: 'radio',
                name: 'color',
                value: 1,
                onclick: () => ctrl.chessground.orienteWithColor('white'),
              }),
              h('label.color.color_1', { for: 'coord_color_1' }, [h('i')]),
            ]),
          ]),
        ]),
      ]),
      h('div.coord-trainer__board.main-board', [
        ...ctrl.coords.map((e: Key, i: number) =>
          h('div.next_coord', {
            id: 'next_coord' + i,
            className: isWrongAnswer(i)
          }
            , e)
        ),
        h(Board, {
          variant: 'standard',
          chessground: ctrl.chessground
        }),
      ]),
      h('div.coord-trainer__table', { style: { visibility: ctrl.started } }, [
        h(
          'button.start.button.button-fat',
          { oncreate: helper.ontap(() => ctrl.startTraining()) },
          i18n('startTraining')
        ),
      ]),
      h('div.coord-trainer__score', ctrl.score),
      h('div.coord-trainer__progress', [
        h('div.progress_bar', { style: { width: ctrl.progress + '%' } }),
      ]),
    ]),
  ])
}

import h from 'mithril/hyperscript'
import Chessground from '~/chessground/Chessground'
import redraw from '~/utils/redraw'
import { header } from '../shared/common'
import Board from '../shared/Board'
import i18n from '../../i18n'
import layout from '../layout'
import { INITIAL_FEN } from 'chessops/fen'
import CoordCtrl from './coordCtrl'

let orientation = (Math.random() > 0.5 ? 'white' : 'black') as Color
let random = true

function reOriente(color: Color | undefined): void {
  random = false
  if (color === undefined) {
    color = Math.random() > 0.5 ? 'white' : ('black' as Color)
    random = true
  }

  orientation = color
  redraw()
}

export default function view(ctrl: CoordCtrl) {
  const board = h(Board, {
    key: orientation,
    variant: 'standard',
    chessground: new Chessground({
      fen: INITIAL_FEN,
      orientation: orientation,
      coordinates: false,
      movable: {
        free: false,
        color: null,
      },
      events: {
        select: ctrl.handleSelect.bind(ctrl),
      },
    }),
  })

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
                onclick: () => reOriente('black'),
              }),
              h('label.color.color_3', { for: 'coord_color_3' }, [h('i')]),
            ]),
            h('div', [
              h('input#coord_color_2', {
                type: 'radio',
                name: 'color',
                disabled: random,
                checked: random ? 'checked' : null,
                value: 2,
                onclick: () => reOriente(undefined),
              }),
              h('label.color.color_2', { for: 'coord_color_2' }, [h('i')]),
            ]),
            h('div', [
              h('input#coord_color_1', {
                type: 'radio',
                name: 'color',
                value: 1,
                onclick: () => reOriente('white'),
              }),
              h('label.color.color_1', { for: 'coord_color_1' }, [h('i')]),
            ]),
          ]),
        ]),
      ]),
      h('div.coord-trainer__board.main-board', [
        ...ctrl.coords.map((e: Key, i: number) =>
          h('div.next_coord', {
            key: i,
            id: 'next_coord' + i,
            className: isWrongAnswer(i)
          }
            , e)
        ),
        board,
      ]),
      h('div.coord-trainer__table', { style: { visibility: ctrl.started } }, [
        h(
          'button.start.button.button-fat',
          { onclick: ctrl.startTraining.bind(ctrl) },
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

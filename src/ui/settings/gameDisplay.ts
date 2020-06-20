import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import { onPieceNotationChange } from '../shared/round/view/replay'
import layout from '../layout'
import i18n from '../../i18n'
import settings from '../../settings'
import h from 'mithril/hyperscript'

function renderBody() {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('boardCoordinates'), 'coords', settings.game.coords)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('squareCoordinates'), 'squareCoords', settings.game.squareCoords.enabled, function() {})),
      h('ul.submenu', [
          h('li.list_item.square-coords-opacity-setting', [
              formWidgets.renderSlider(
                  'white opacity', 'whiteOpacity', 0, 100, 1, settings.game.squareCoords.whiteSquaresOpacity,
                  function() {}
              )]),
          h('li.list_item.square-coords-opacity-setting', [
              formWidgets.renderSlider(
                  'black opacity', 'blackOpacity', 0, 100, 1, settings.game.squareCoords.blackSquaresOpacity,
                  function() {}
              )]),
          h('li.list_item.square-coords-opacity-setting', [
              h('div',  {className: 'overlay-coordinates-sample-wrapper'}, [
                  h('div', {className: 'overlay-coordinates-sample board'}),
                  h('div', {className: 'overlay-coordinates-sample white-squares', opacity : (settings.game.squareCoords.whiteSquaresOpacity() / 100).toString(10)}),
                  h('div', {className: 'overlay-coordinates-sample black-squares', opacity : (settings.game.squareCoords.blackSquaresOpacity() / 100).toString(10)})
                  ]
              )]
          )
      ]),
      h('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.game.animations)),
      h('li.list_item', formWidgets.renderCheckbox('Magnified dragged piece', 'magnified',
        settings.game.magnified)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('boardHighlights'), 'highlights',
        settings.game.highlights)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.game.pieceDestinations)),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(
          i18n('pgnPieceNotation'), [
            { label: i18n('chessPieceSymbol'), value: true },
            { label: i18n('pgnLetter'), value: false },
          ],
          settings.game.pieceNotation,
          false,
          onPieceNotationChange,
        )
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(
          'Clock position', [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
          settings.game.clockPosition
        )
      ),
      h('li.list_item',
        formWidgets.renderCheckbox(i18n('movesPlayed'), 'moveList', settings.game.moveList)
      ),
      h('li.list_item', [
        formWidgets.renderCheckbox(i18n('zenMode'), 'zenMode', settings.game.zenMode),
      ])
   ])
  ]
}

export default {
  oncreate: helper.viewSlideIn,
  // controller() {},
  view() {
    const header = dropShadowHeader(null, backButton(i18n('gameDisplay')))
    return layout.free(header, renderBody())
  }
}

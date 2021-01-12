import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import settings from '../../settings'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import { onPieceNotationChange } from '../shared/round/view/replay'
import layout from '../layout'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('gameDisplay')))
    return layout.free(header, renderBody())
  }
} as Mithril.Component

function renderBody() {
  return [
    h('ul.native_scroller.page.settings_list.multiChoices', [
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton('Magnified dragged piece', formWidgets.booleanChoice, settings.game.magnified)
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(i18n('pieceAnimation'), formWidgets.booleanChoice, settings.game.animations)
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(i18n('boardHighlights'), formWidgets.booleanChoice, settings.game.highlights)
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(i18n('pieceDestinations'), formWidgets.booleanChoice, settings.game.pieceDestinations)
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(i18n('boardCoordinates'), formWidgets.booleanChoice, settings.game.coords)
      ),
      h('li.list_item',
        formWidgets.renderMultipleChoiceButton(i18n('moveListWhilePlaying'), formWidgets.booleanChoice, settings.game.moveList)
      ),
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
      h('li.list_item', [
        formWidgets.renderMultipleChoiceButton(i18n('zenMode'), formWidgets.booleanChoice, settings.game.zenMode),
      ])
   ])
  ]
}

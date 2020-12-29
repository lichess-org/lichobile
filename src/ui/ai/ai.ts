import h from 'mithril/hyperscript'
import socket from '../../socket'
import { getCurrentAIGame } from '../../utils/offlineGames'
import * as sleepUtils from '../../utils/sleep'
import * as helper from '../helper'
import { emptyFen, playerFromFen } from '../../utils/fen'
import i18n from '../../i18n'
import layout from '../layout'
import { header as renderHeader } from '../shared/common'
import { viewOnlyBoardContent } from '../shared/round/view/roundView'
import GameTitle from '../shared/GameTitle'

import { overlay, renderContent } from './aiView'
import AiRound from './AiRound'

interface Attrs {
  fen?: string
  variant?: VariantKey
  color?: Color
}

interface State {
  round?: AiRound
}

export default {
  oninit({ attrs }) {
    socket.createDefault()

    getCurrentAIGame()
    .then(saved => {
      const setupFen = attrs.fen
      const setupVariant = attrs.variant
      const setupColor = attrs.color

      this.round = new AiRound(saved, setupFen, setupVariant, setupColor)
    })
    sleepUtils.keepAwake()
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    sleepUtils.allowSleepAgain()
    if (this.round) this.round.engine?.exit()
  },
  view({ attrs }) {
    let content: Mithril.Children, header: Mithril.Children

    if (this.round && this.round.data && this.round.chessground && this.round.engine) {
      header = renderHeader(h(GameTitle, { data: this.round.data }))
      content = renderContent(this.round)
    } else {
      const fen = attrs.fen || emptyFen
      const color = playerFromFen(fen)
      header = renderHeader(i18n('playOfflineComputer'))
      content = viewOnlyBoardContent(fen, color, undefined)
    }

    return layout.board(
      header,
      content,
      undefined,
      this.round && overlay(this.round)
    )
  }
} as Mithril.Component<Attrs, State>

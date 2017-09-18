import * as h from 'mithril/hyperscript'
import socket from '../../socket'
import { getCurrentAIGame } from '../../utils/offlineGames'
import * as helper from '../helper'
import { playerFromFen } from '../../utils/fen'
import { standardFen } from '../../lichess/variant'
import i18n from '../../i18n'
import layout from '../layout'
import { header as renderHeader, viewOnlyBoardContent } from '../shared/common'
import GameTitle from '../shared/GameTitle'

import { overlay, renderContent } from './aiView'
import AiRound from './AiRound'

interface Attrs {
  fen?: string
  variant?: VariantKey
  color?: Color
}

interface State {
  round: AiRound
}

const AiScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    socket.createDefault()

    const saved = getCurrentAIGame()
    const setupFen = attrs.fen
    const setupVariant = attrs.variant
    const setupColor = attrs.color

    this.round = new AiRound(saved, setupFen, setupVariant, setupColor)

    window.plugins.insomnia.keepAwake()
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain()
    if (this.round) this.round.engine.exit()
  },
  view() {
    let content: () => Mithril.Children, header: () => Mithril.Children

    if (this.round.data && this.round.chessground) {
      header = () => renderHeader(h(GameTitle, { data: this.round.data }))
      content = () => renderContent(this.round)
    } else {
      const fen = this.round.vm.setupFen || this.round.vm.savedFen || standardFen
      const color = playerFromFen(fen)
      header = () => renderHeader(i18n('playOfflineComputer'))
      content = () => viewOnlyBoardContent(fen, color, undefined)
    }

    return layout.board(
      header,
      content,
      () => overlay(this.round)
    )
  }
}

export default AiScreen

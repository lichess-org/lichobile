import * as h from 'mithril/hyperscript'
import socket from '../../socket'
import * as helper from '../helper'
import { getCurrentOTBGame } from '../../utils/offlineGames'
import { playerFromFen } from '../../utils/fen'
import { standardFen } from '../../lichess/variant'
import settings from '../../settings'
import i18n from '../../i18n'
import layout from '../layout'
import { header as renderHeader, viewOnlyBoardContent } from '../shared/common'
import GameTitle from '../shared/GameTitle'

import OtbRound from './OtbRound'
import { overlay, renderContent } from './otbView'

interface Attrs {
  fen?: string
  variant?: VariantKey
}

interface State {
  round: OtbRound
}

const OtbScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    socket.createDefault()

    const saved = getCurrentOTBGame()
    const setupFen = attrs.fen
    const setupVariant = attrs.variant

    this.round = new OtbRound(saved, setupFen, setupVariant)

    window.plugins.insomnia.keepAwake()
    document.addEventListener('pause', () => saveClock(this.round), false)
    window.addEventListener('unload', () => saveClock(this.round))
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain()
    document.removeEventListener('pause', () => saveClock(this.round), false)
    window.removeEventListener('unload', () => saveClock(this.round))
    saveClock(this.round)
  },
  view() {
    let content: () => Mithril.Children, header: () => Mithril.Children
    const pieceTheme = settings.otb.useSymmetric() ? 'symmetric' : undefined

    if (this.round.data && this.round.chessground) {
      header = () => renderHeader(h(GameTitle, { data: this.round.data }))
      content = () => renderContent(this.round, pieceTheme)
    } else {
      const fen = this.round.vm.setupFen || this.round.vm.savedFen || standardFen
      const color = fen ? playerFromFen(fen) : 'white'
      header = () => renderHeader(i18n('playOnTheBoardOffline'))
      content = () => viewOnlyBoardContent(fen, color, undefined, 'standard', undefined, pieceTheme)
    }

    return layout.board(
      header,
      content,
      () => overlay(this.round),
      this.round.data && this.round.data.player.color || 'white'
    )
  }
}

function saveClock (round: OtbRound) {
  if (round.clock && round.clock.isRunning())
    round.clock.startStop()
  round.save()
}

export default OtbScreen

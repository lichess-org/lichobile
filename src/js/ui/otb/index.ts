import socket from '../../socket'
import * as helper from '../helper'
import { getCurrentOTBGame } from '../../utils/offlineGames'
import { playerFromFen } from '../../utils/fen'
import settings from '../../settings'
import i18n from '../../i18n'
import layout from '../layout'
import { gameTitle, header as renderHeader, viewOnlyBoardContent } from '../shared/common'

import OtbRound from './OtbRound'
import { overlay, renderContent } from './otbView'

interface Attrs {
  fen?: string
}

interface State {
  round: OtbRound
}

const OtbScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    helper.analyticsTrackView('Offline On The Board')

    socket.createDefault()

    const saved = getCurrentOTBGame()
    const setupFen = attrs.fen

    this.round = new OtbRound(saved, setupFen)

    window.plugins.insomnia.keepAwake()
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain()
  },
  view() {
    let content: () => Mithril.Children, header: () => Mithril.Children
    const pieceTheme = settings.otb.useSymmetric() ? 'symmetric' : undefined

    if (this.round.data && this.round.chessground) {
      header = () => renderHeader(gameTitle(this.round.data))
      content = () => renderContent(this.round, pieceTheme)
    } else {
      const fen = this.round.vm.setupFen || this.round.vm.savedFen
      const color = fen ? playerFromFen(fen) : 'white'
      header = () => renderHeader(i18n('playOnTheBoardOffline'))
      content = () => viewOnlyBoardContent(fen, undefined, color, 'standard', undefined, pieceTheme)
    }

    return layout.board(
      header,
      content,
      () => overlay(this.round),
      this.round.data && this.round.data.player.color || 'white'
    )
  }
}

export default OtbScreen

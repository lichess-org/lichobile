import h from 'mithril/hyperscript'
import socket from '../../socket'
import * as helper from '../helper'
import { getCurrentOTBGame } from '../../utils/offlineGames'
import * as sleepUtils from '../../utils/sleep'
import { playerFromFen, emptyFen } from '../../utils/fen'
import settings from '../../settings'
import i18n from '../../i18n'
import layout from '../layout'
import { header as renderHeader } from '../shared/common'
import { viewOnlyBoardContent } from '../shared/round/view/roundView'
import GameTitle from '../shared/GameTitle'

import OtbRound from './OtbRound'
import { overlay, renderContent } from './otbView'

interface Attrs {
  fen?: string
  variant?: VariantKey
}

interface State {
  round?: OtbRound
}

export default {
  oninit({ attrs }) {
    socket.createDefault()

    getCurrentOTBGame().then(saved => {
      this.round = new OtbRound(saved, attrs.fen, attrs.variant)
      window.addEventListener('unload', this.round.saveClock)
    })

    sleepUtils.keepAwake()
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    sleepUtils.allowSleepAgain()
    if (this.round) {
      this.round.unload()
      window.removeEventListener('unload', this.round.saveClock)
    }
  },
  view({ attrs }) {
    let content: Mithril.Children, header: Mithril.Children
    const pieceTheme = settings.otb.useSymmetric() ? 'symmetric' : undefined

    if (this.round && this.round.data && this.round.chessground) {
      header = renderHeader(h(GameTitle, { data: this.round.data }))
      content = renderContent(this.round, pieceTheme)
    } else {
      const fen = attrs.fen || emptyFen
      const color = fen ? playerFromFen(fen) : 'white'
      header = renderHeader(i18n('playOnTheBoardOffline'))
      content = viewOnlyBoardContent(fen, color, undefined, 'standard', undefined, pieceTheme)
    }

    return layout.board(
      header,
      content,
      undefined,
      this.round && overlay(this.round),
      undefined,
      this.round && this.round.data && this.round.data.player.color || 'white'
    )
  }
} as Mithril.Component<Attrs, State>

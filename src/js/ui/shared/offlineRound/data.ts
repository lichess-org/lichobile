import session from '../../../session'
import { oppositeColor } from '../../../utils'
import { standardFen } from '../../../utils/fen'
import i18n from '../../../i18n'
import { OfflineGameData } from '../../../lichess/interfaces/game'

const standardVariant: Variant = {
  key: 'standard',
  name: 'Standard',
  short: 'STD',
  title: 'Standard rules of chess (FIDE)'
}

export interface OfflineDataConfig {
  id: string
  variant: Variant
  initialFen: string
  fen: string
  color: Color
  player: Color
  pref?: {
    centerPiece: boolean
  }
}

export default function data(cfg: OfflineDataConfig): OfflineGameData {

  const confColor = cfg.color || 'white'

  const player = {
    id: 'player',
    color: confColor,
    username: cfg.id === 'offline_ai' ? session.appUser(i18n(confColor)) : i18n(confColor),
    spectator: false
  }

  return {
    game: {
      id: cfg.id,
      offline: true,
      variant: cfg.variant || standardVariant,
      initialFen: cfg.initialFen || standardFen,
      source: 'offline',
      fen: cfg.fen || standardFen,
      player: cfg.player || 'white',
      status: {
        id: 20,
        name: 'created'
      }
    },
    player,
    opponent: {
      id: 'opponent',
      color: oppositeColor(confColor),
      username: i18n(oppositeColor(confColor))
    },
    pref: {
      animationDuration: 300,
      highlight: true,
      destination: true,
      centerPiece: cfg.pref && cfg.pref.centerPiece || false
    },
    steps: []
  }
}

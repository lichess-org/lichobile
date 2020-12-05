import { getLichessVariant, getInitialFen } from '../../lichess/variant'
import settings from '../../settings'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import { playerFromFen, plyFromFen } from '../../utils/fen'
import { oppositeColor } from '../../utils'

const emptyPocket = {
  queen: 0,
  rook: 0,
  knight: 0,
  bishop: 0,
  pawn: 0
}

export function makeDefaultData(variantKey: VariantKey, fen?: string): AnalyseData {
  const player = playerFromFen(fen)
  const ply = plyFromFen(fen)
  const variant = getLichessVariant(variantKey)

  const initialFen = fen || getInitialFen(variantKey)

  return {
    game: {
      fen: initialFen,
      id: 'synthetic',
      initialFen: initialFen,
      player,
      source: 'offline',
      status: {
        id: 10,
        name: 'created'
      },
      turns: 0,
      startedAtTurn: 0,
      variant
    },
    takebackable: false,
    orientation: 'white',
    opponent: {
      color: oppositeColor(player)
    },
    player: {
      color: player
    },
    pref: {
      destination: settings.game.pieceDestinations(),
      highlight: settings.game.highlights(),
    },
    treeParts: [
      {
        fen: initialFen,
        ply,
        crazyhouse: variant.key === 'crazyhouse' ? {
          pockets: [emptyPocket, emptyPocket]
        } : undefined,
        pgnMoves: []
      }
    ],
    userAnalysis: true
  }
}

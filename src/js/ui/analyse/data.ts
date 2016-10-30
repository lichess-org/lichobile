import { playerFromFen, plyFromFen, standardFen } from '../../utils/fen';
import { oppositeColor } from '../../utils';
import { AnalysisData } from './interfaces';

export function makeDefaultData(fen: string): AnalysisData {
  const player = playerFromFen(fen);
  const ply = plyFromFen(fen);
  return {
    game: {
      fen: fen || standardFen,
      id: 'synthetic',
      initialFen: fen || standardFen,
      player,
      source: 'offline',
      status: {
        id: 10,
        name: 'created'
      },
      turns: 0,
      variant: {
        key: 'standard',
        name: 'Standard',
        short: 'Std',
        title: 'Standard rules of chess (FIDE)'
      }
    },
    opponent: {
      id: oppositeColor(player),
      color: oppositeColor(player)
    },
    player: {
      color: player,
      id: player
    },
    pref: {
      animationDuration: 300,
      destination: true,
      highlight: true
    },
    steps: [
      {
        fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        ply,
        san: null,
        uci: null,
        check: false,
        pgnMoves: []
      }
    ]
  };
}

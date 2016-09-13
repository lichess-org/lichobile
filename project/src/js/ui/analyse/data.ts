import { readFen } from '../editor/editor';
import { oppositeColor } from '../../utils';

export function makeDefaultData(fen: string): AnalysisData {
  const player = playerFromFen(fen);
  const ply = plyFromFen(fen);
  return {
    game: {
      fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      id: 'synthetic',
      initialFen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
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
        check: false
      }
    ]
  };
}

function playerFromFen(fen: string): Color {
  if (fen) {
    const { color } = readFen(fen);

    return color() === 'w' ? 'white' : 'black';
  }

  return 'white';
}

function plyFromFen(fen: string) {
  if (fen) {
    const { color, moves } = readFen(fen);
    return moves() * 2 - (color() === 'w' ? 2 : 1);
  }

  return 0;
}

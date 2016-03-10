import { readFen } from '../editor/editor';
import { oppositeColor } from '../../utils';

export function makeData(from) {

  const data = from;

  if (data.game.moves) data.game.moves = data.game.moves.split(' ');
  else data.game.moves = [];

  if (!data.game.moveTimes) data.game.moveTimes = [];

  return data;
}

export function makeDefaultData(fen) {
  const player = playerFromFen(fen);
  return {
    game: {
      fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      id: 'synthetic',
      initialFen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      initialColor: player,
      opening: null,
      player,
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
      color: oppositeColor(player)
    },
    orientation: player,
    path: 0,
    player: {
      color: player,
      id: null
    },
    pref: {
      animationDuration: 300,
      destination: true,
      highlight: true
    },
    steps: [
      {
        fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        ply: 0,
        san: null,
        uci: null
      }
    ],
    userAnalysis: true
  };
}

function playerFromFen(fen) {
  if (fen) {
    const { color } = readFen(fen);

    return color() === 'w' ? 'white' : 'black';
  }

  return 'white';
}

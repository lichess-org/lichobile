import { readFen } from '../editor/editor';
import { oppositeColor } from '../../utils';

export function makeData(from) {

  const data = from;

  if (data.game.moves) data.game.moves = data.game.moves.split(' ');
  else data.game.moves = [];

  if (!data.game.moveTimes) data.game.moveTimes = [];

  return data;
}

export function makeDefaultData(fen, orientation) {
  const player = playerFromFen(fen);
  const ply = plyFromFen(fen);
  return {
    game: {
      fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      id: 'synthetic',
      initialFen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
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
    orientation: orientation || 'white',
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
        ply,
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

function plyFromFen(fen) {
  if (fen) {
    const { color, moves } = readFen(fen);
    return moves() * 2 - (color() === 'w' ? 2 : 1);
  }

  return 0;
}

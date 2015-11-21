import { Chess } from 'chess.js';
import { oppositeColor } from '../../../utils';

export default function data(cfg) {

  cfg = cfg || {};
  cfg.color = cfg.color || 'white';
  cfg.fen = cfg.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const chess = new Chess(cfg.fen);

  return {
    game: {
      variant: {
        key: 'standard',
        name: 'Standard',
        'short': 'STD',
        title: 'Standard rules of chess (FIDE)'
      },
      initialFen: cfg.fen,
      fen: cfg.fen,
      player: chess.turn() === 'w' ? 'white' : 'black',
      status: {
        id: 20,
        name: 'started'
      }
    },
    player: {
      color: cfg.color
    },
    opponent: {
      color: oppositeColor(cfg.color)
    },
    pref: {
      highlight: true,
      destination: true,
      centerPiece: cfg.pref && cfg.pref.centerPiece || false
    }
  };
}

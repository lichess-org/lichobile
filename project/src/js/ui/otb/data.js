var opposite = require('chessground').util.opposite;

module.exports = function(cfg) {

  cfg = cfg || {};
  cfg.color = cfg.color || 'white';

  return {
    "game": {
      "id": "KqlWRcxy",
      "variant": {
        "key": "standard",
        "name": "Standard",
        "short": "STD",
        "title": "Standard rules of chess (FIDE)"
      },
      "initialFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "player": 'white',
      "status": {
        "id": 20,
        "name": "started"
      }
    },
    "player": {
      "color": cfg.color
    },
    "opponent": {
      "color": opposite(cfg.color)
    },
    "pref": {
      "highlight": true,
      "destination": true
    }
  };
};

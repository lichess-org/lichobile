module.exports = function(cfg) {

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
      "player": "white",
      "status": {
        "id": 20,
        "name": "started"
      }
    },
    "player": {
      "color": "white"
    },
    "opponent": {
      "color": "black"
    },
    "pref": {
      "highlight": true,
      "destination": true,
      "animationDuration": 300
    }
  };
};

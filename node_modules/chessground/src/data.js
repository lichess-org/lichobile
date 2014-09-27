var fen = require('./fen');
var configure = require('./configure');

module.exports = function(cfg) {
  var defaults = {
    pieces: fen.read(fen.initial),
    orientation: 'white',
    turnColor: 'white', // turn to play. white | black
    check: null, // square currently in check "a2" | nil
    lastMove: null, // squares part of the last move ["c3" "c4"] | nil
    selected: null, // square selected by the user "a1" | nil
    render: null, // function that rerenders the board
    bounds: null, // function that calculates the board bounds
    animation: {
      enabled: true,
      duration: 200,
      /*{ // current
       *  start: timestamp,
       *  duration: ms,
       *  anims: {
       *    a2: [[-30, 50], [-20, 37]], ...
       *  }
       *}*/
      current: {}
    },
    movable: {
      free: true, // all moves are valid - board editor
      color: 'both', // color that can move. white | black | both | nil
      dests: {}, // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | nil
      dropOff: 'revert', // when a piece is dropped outside the board. "revert" | "trash"
      dropped: null, // last dropped dest, not to be animated
      // dragCenter: true, // whether to center the piece under the cursor on drag start
      events: {
        after: function(orig, dest) {} // called after the move has been played
      }
    },
    premovable: {
      enabled: true, // allow premoves for color that can not move
      dests: [], // premove destinations for the current selection
      current: null // keys of the current saved premove ["e2" "e4"] | nil
    },
    draggable: {
      enabled: true, // allow moves & premoves to use drag'n drop
      distance: 3, // minimum distance to initiate a drag, in pixels
      /*{ // current
       *  orig: "a2", // orig key of dragging piece
       *  rel: [100, 170] // x, y of the piece at original position
       *  pos: [20, -12] // relative current position
       *  over: "b3" // square being moused over
       *}*/
      current: {}
    },
    events: {
      change: function() {} // called after the situation changes on the board
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};

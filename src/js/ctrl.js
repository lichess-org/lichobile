'use strict';

var chessground = require('chessground');

module.exports = function() {

  this.chessground = new chessground.controller({
    orientation: 'white',
    movable: {
      free: false,
      color: 'both',
      dropOff: 'trash'
    },
    premovable: {
      enabled: true
    }
  });

};

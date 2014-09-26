'use strict';

var chessground = require('chessground');
var m = require('mithril');

module.exports = function(ctrl) {
  return m('div.chessground.wood.merida', [
    chessground.view(ctrl.chessground)
  ]);
};
'use strict';

var chessground = require('chessground');
var m = require('mithril');

function renderHeader(){
  return m('header', [
    m('span.lichess', ["%"]),
    m('h1.title', [ "lichess.org" ]),
    m('span.lichess', ["r"]),
  ]);
}

function renderBoard(ctrl){
  return m('div.content', [
    m('div.chessground.wood.merida', [
      chessground.view(ctrl.chessground)
    ])
  ]);
}

function renderFooter(){
  return m('footer', [
    m('span.lichess', ["h"]),
    m('span.lichess', ["G"])
  ]);
}

module.exports = function(ctrl) {
  return m('div', [
    renderHeader(),
    renderBoard(ctrl),
    renderFooter()
  ]);
};
'use strict';

var chessground = require('chessground');
var m    = require('mithril');
var game = require('./game2');

function renderHeader(){
  return m('header', [
    m('span.lichess', ["%"]),
    m('h1.title', [ "lichess.org" ]),
    m('span.lichess', ["r"]),
  ]);
}

function renderContent(ctrl){
  return m('div.content', [
    game.view(ctrl.game)
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
    renderContent(ctrl),
    renderFooter()
  ]);
};

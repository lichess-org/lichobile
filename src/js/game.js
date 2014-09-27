'use strict';

var Chessground = require('chessground');
var m           = require('mithril');
var model       = require('./model');
var clock       = require('./clock');

var controller = function() {

  this.ground = new Chessground.controller({
    orientation: 'white',
    movable: {
      free: false,
      color: null
    },
    premovable: {
      enabled: true
    }
  });

  // this.clock = {
  //   player: new clock.controller(true, this.play.clock[this.play.player.color], ".timer.after", this.play.clock.initial),
  //   opponent: new clock.controller(false, this.play.clock[model.negate(this.play.player.color)], ".timer.before", this.play.clock.initial)
  // };
};

var view = function(ctrl) {
  function renderGame(ctrl){
    return m('div', [
        renderOponnent(ctrl),
        renderBoard(ctrl),
        renderPlayer(ctrl)
    ]);
  }

  function renderPlayer(ctrl){
    return m('div.player', [
      m('h1', 'player'),
      m('span', '1459'),
      // clock.view(ctrl.clock.player),
      // m('div.timer.after'),
    ]);
  }

  function renderOponnent(ctrl){
    // var name  = ( "id" in ctrl.play.opponent ? ctrl.play.opponent.id : "AI" );

    return m('div.opponent', [
      m('h1', 'ai'),
      m('span', '1564'),
      // clock.view(ctrl.clock.opponent),
      // m('div.timer.before'),
    ]);
  }

  function renderBoard(ctrl){
    return m('div.chessground.wood.merida', [
      Chessground.view(ctrl.ground)
    ]);
  }

  return renderGame(ctrl);
};

module.exports = {
  controller: controller,
  view: view
};

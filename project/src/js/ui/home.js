var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');

var home = {};

home.controller = function() {};

home.view = function() {
  function overlays() {
    return [
      gamesMenu.view()
    ];
  }

  return layout.board(widgets.header, widgets.board, widgets.empty, menu.view, overlays);
};

module.exports = home;

var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');

var home = {};

home.controller = function() {

  function onBackButton() {
    if (gamesMenu.isOpen()) {
      gamesMenu.close();
      m.redraw();
    } else
      window.navigator.app.exitApp();
  }

  document.addEventListener('backbutton', onBackButton, false);

  return {
    onunload: function() {
      document.removeEventListener('backbutton', onBackButton, false);
    }
  };
};

home.view = function() {
  function overlays() {
    return [
      gamesMenu.view()
    ];
  }

  return layout.board(widgets.header, widgets.board, widgets.empty, menu.view, overlays);
};

module.exports = home;

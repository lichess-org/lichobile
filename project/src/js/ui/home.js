var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');

var home = {};

home.controller = function() {

  window.analytics.trackView('Home');

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

home.view = widgets.startBoardView;

module.exports = home;

var widgets = require('./_commonWidgets');

var home = {};

home.controller = function() {

  window.analytics.trackView('Home');

  return {
  };
};

home.view = widgets.startBoardView;

module.exports = home;

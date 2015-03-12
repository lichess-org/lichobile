var widgets = require('./widget/common');

var home = {};

home.controller = function() {

  window.analytics.trackView('Home');

  return {
  };
};

home.view = widgets.startBoardView;

module.exports = home;

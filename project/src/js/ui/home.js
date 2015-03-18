var widgets = require('./widget/common');
var helper = require('./helper');

var home = {};

home.controller = function() {

  helper.analyticsTrackView('Home');

  return {
  };
};

home.view = widgets.startBoardView;

module.exports = home;

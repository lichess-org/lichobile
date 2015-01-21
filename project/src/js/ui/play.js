var session = require('../session');
var utils = require('../utils');
var xhr = require('../xhr');
var widgets = require('./_commonWidgets');
var roundCtrl = require('./round/roundCtrl');
var roundView = require('./round/view/roundView');

module.exports = {
  controller: function() {
    var round;
    xhr.game(m.route.param('id')).then(function(data) {
      if (session.isConnected()) session.refresh(true);
      round = new roundCtrl(data);
    }, function(error) {
      utils.handleXhrError(error);
      m.route('/');
    });

    return {
      onunload: function() {
        if (round) {
          round.onunload();
          round = null;
        }
      },
      round: function() {
        return round;
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.round()) return roundView(ctrl.round());
    else return widgets.startBoardView();
  }
};

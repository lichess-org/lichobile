var widgets = require('./widget/common');
var layout = require('./layout');
var helper = require('./helper');
var utils = require('../utils');
var menu = require('./menu');
var xhr = require('../xhr');
var roundCtrl = require('./round/roundCtrl');
var roundView = require('./round/view/roundView');

module.exports = {
  controller: function() {
    var round;

    helper.analyticsTrackView('TV');

    function onFeatured(o) {
      xhr.game(o.id).then(function(data) {
        m.redraw.strategy('all');
        if (round) round.onunload();
        data.tv = true;
        round = new roundCtrl(data, onFeatured);
      }, function(error) {
        utils.handleXhrError(error);
      });
    }

    xhr.featured(m.route.param('flip')).then(function(data) {
      data.tv = true;
      round = new roundCtrl(data, onFeatured);
    }, function(error) {
      utils.handleXhrError(error);
      m.route('/');
    });

    return {
      getRound: function() { return round; },

      onunload: function() {
        if (round) {
          round.onunload();
          round = null;
        }
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.getRound()) return roundView(ctrl.getRound());

    var header, board;

    header = utils.partialf(widgets.connectingHeader, 'Lichess TV');
    board = widgets.board;

    return layout.board(header, board, widgets.empty, menu.view, widgets.empty);
  }
};

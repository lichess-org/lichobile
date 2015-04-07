var widgets = require('./widget/common');
var layout = require('./layout');
var helper = require('./helper');
var utils = require('../utils');
var menu = require('./menu');
var xhr = require('../xhr');
var roundCtrl = require('./round/roundCtrl');
var roundView = require('./round/view/roundView');
var socket = require('../socket');

module.exports = {
  controller: function() {
    var tvSocket, round;

    helper.analyticsTrackView('TV');

    // get current featured game and display it
    xhr.featured(m.route.param('flip')).then(function(data) {
      data.tv = true;
      round = new roundCtrl(data);
    }, function(error) {
      utils.handleXhrError(error);
      m.route('/');
    });

    xhr.lobby(true).then(function(data) {
      tvSocket = socket.connectLobby(data.lobby.version, utils.noop, {
        featured: function(o) {
          xhr.game(o.id).then(function(data) {
            m.redraw.strategy('all');
            if (round) round.onunload();
            data.tv = true;
            round = new roundCtrl(data);
          }, function(error) {
            utils.handleXhrError(error);
            m.route('/');
          });
        }
      });
    });

    return {
      getRound: function() { return round; },

      onunload: function() {
        if (tvSocket) {
          tvSocket.destroy();
          tvSocket = null;
        }
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

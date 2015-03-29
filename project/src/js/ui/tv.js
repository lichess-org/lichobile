var settings = require('../settings');
var gamesMenu = require('./gamesMenu');
var widgets = require('./widget/common');
var layout = require('./layout');
var utils = require('../utils');
var menu = require('./menu');
var xhr = require('../xhr');
var roundCtrl = require('./round/roundCtrl');
var roundView = require('./round/view/roundView');
var socket = require('../socket');

module.exports = {
  controller: function() {
    var tvSocket, round;

    tvSocket = socket.connectTV({
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

    return {
      getRound: function() { return round; },

      onunload: function() {
        if (tvSocket) {
          tvSocket.destroy();
          tvSocket = null;
        }
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.getRound()) return roundView(ctrl.getRound());

    var theme = settings.general.theme;
    var pov = gamesMenu.lastJoined;
    var header, board;

    if (pov) {
      header = widgets.connectingHeader;
      board = utils.partialf(widgets.boardArgs, pov.fen, pov.lastMove, pov.color,
        pov.variant.key, theme.board(), theme.piece());
    } else {
      header = utils.partialf(widgets.header, 'lichess.org');
      board = widgets.board;
    }

    return layout.board(header, board, widgets.empty, menu.view, widgets.empty,
      pov ? pov.color : null);
  }
};

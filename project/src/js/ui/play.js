var session = require('../session');
var utils = require('../utils');
var xhr = require('../xhr');
var widgets = require('./widget/common');
var roundCtrl = require('./round/roundCtrl');
var roundView = require('./round/view/roundView');
var gamesMenu = require('./gamesMenu');
var layout = require('./layout');
var menu = require('./menu');
var storage = require('../storage');
var settings = require('../settings');

module.exports = {
  controller: function() {
    var round;
    xhr.game(m.route.param('id')).then(function(data) {
      if (session.isConnected()) session.refresh();
      round = new roundCtrl(data);
      if (data.player.user === undefined)
        storage.set('lastPlayedGameURLAsAnon', data.url.round);
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
    var theme = settings.general.theme;
    var pov = gamesMenu.lastJoined;
    var header, board;
    if (pov) {
      header = widgets.connectingHeader;
      board = utils.partialƒ(widgets.boardArgs, pov.fen, pov.lastMove, pov.color,
        pov.variant.key, theme.board(), theme.piece());
    } else {
      header = widgets.header;
      board = widgets.board;
    }
    return layout.board(header, board, widgets.empty, menu.view, null, pov ? pov.color : null);
  }
};

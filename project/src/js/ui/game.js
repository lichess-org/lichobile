var session = require('../session');
var i18n = require('../i18n');
var utils = require('../utils');
var helper = require('./helper');
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
    var id = m.route.param('id');
    var joinable = false;
    var gameData;
    var round;

    xhr.game(id, m.route.param('pov')).then(function(data) {
      if (data.game.joinable) {
        gameData = data;
        joinable = true;
      } else {
        if (session.isConnected()) session.refresh();
        round = new roundCtrl(data);
        if (data.player.user === undefined)
          storage.set('lastPlayedGameURLAsAnon', data.url.round);
      }
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
      },
      joinable: function() {
        return joinable;
      },
      joinUrlChallenge: function(id) {
        xhr.joinUrlChallenge(id).then(function(data) {
          m.route('/game' + data.url.round);
        });
      },
      data: function() {
        return gameData;
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.round()) return roundView(ctrl.round());
    var theme = settings.general.theme;
    var pov = gamesMenu.lastJoined;
    var header, board, overlay;
    if (pov) {
      header = widgets.connectingHeader;
      board = utils.partialf(widgets.boardArgs, pov.fen, pov.lastMove, pov.color,
        pov.variant.key, theme.board(), theme.piece());
    } else {
      header = widgets.header;
      board = widgets.board;
    }
    var data = ctrl.data();
    var opp = data.opponent.user;
    var mode = data.game.rated ? i18n('rated') : i18n('casual');
    var joinDom;
    if (data.game.rated && !session.isConnected()) {
      joinDom = [i18n('thisGameIsRated'), m('br'), m('br'), i18n('mustSignInToJoin')];
    } else {
      joinDom = m('button[data-icon=E]', {
        config: helper.ontouchend(utils.f(ctrl.joinUrlChallenge, data.game.id))
      },
      i18n('join'));
    }
    if (ctrl.joinable) {
      overlay = function() {
        return widgets.overlayPopup(
          'join_url_challenge',
          opp ? opp.username : 'Anonymous',
          m('div.infos', [
            m('div.explanation', data.game.variant.name + ', ' + mode),
            m('div.time', utils.gameTime(data)),
            m('br'),
            m('div.join', joinDom)
          ]),
          true
        );
      };
    }
    return layout.board(header, board, widgets.empty, menu.view, overlay, pov ? pov.color : null);
  }
};

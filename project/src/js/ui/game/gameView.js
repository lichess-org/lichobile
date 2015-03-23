var session = require('../../session');
var roundView = require('../round/view/roundView');
var gamesMenu = require('../gamesMenu');
var layout = require('../layout');
var menu = require('../menu');
var settings = require('../../settings');
var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var i18n = require('../../i18n');

function joinOverlay(ctrl) {
  if (!ctrl.joinable) return;

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

  return function() {
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

module.exports = function(ctrl) {
  if (ctrl.round()) return roundView(ctrl.round());

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

  var overlay = joinOverlay(ctrl);

  return layout.board(header, board, widgets.empty, menu.view, overlay,
    pov ? pov.color : null);
};

var session = require('../../session');
var roundView = require('../round/view/roundView');
var gameLogic = require('../../lichess/game');
var gamesMenu = require('../gamesMenu');
var loginModal = require('../loginModal');
var layout = require('../layout');
var menu = require('../menu');
var settings = require('../../settings');
var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var popupWidget = require('../widget/popup');
var i18n = require('../../i18n');

function joinOverlay(ctrl) {
  var data = ctrl.getData();
  var opp = data.opponent.user;
  var mode = data.game.rated ? i18n('rated') : i18n('casual');
  var joinDom;
  if (data.game.rated && !session.isConnected()) {
    joinDom = m('div.error', [
      i18n('thisGameIsRated'), m('br'), m('br'), i18n('mustSignInToJoin'),
      m('div.go_or_cancel', [
        m('button.binary_choice[data-icon=E]', {
          config: helper.ontouchend(loginModal.open)
        }, i18n('signIn')),
        m('button.binary_choice[data-icon=L]', {
          config: helper.ontouchend(utils.backHistory)
        }, i18n('cancel'))
      ])
    ]);
  } else {
    joinDom = m('div.go_or_cancel', [
      m('button.binary_choice[data-icon=E]', {
          config: helper.ontouchend(utils.f(ctrl.joinUrlChallenge, data.game.id))
      }, i18n('join')),
      m('button.binary_choice[data-icon=L]', {
        config: helper.ontouchend(utils.backHistory)
      }, i18n('cancel'))
    ]);
  }

  return function() {
    return popupWidget(
      'join_url_challenge',
      opp ? opp.username : 'Anonymous',
      m('div.infos', [
        m('p.explanation', data.game.variant.name + ', ' + mode),
        m('p.time[data-icon=p]', gameLogic.time(data)),
        m('br'),
        joinDom
      ]),
      true
    );
  };
}

function awaitInviteOverlay(ctrl) {
  var data = ctrl.getData();
  var mode = data.game.rated ? i18n('rated') : i18n('casual');

  return function() {
    return popupWidget(
      'await_url_challenge',
      null,
      m('div.infos', [
        m('p.explanation', i18n('toInviteSomeoneToPlayGiveThisUrl')),
        m('input.lichess_game_url', {
          value: gameLogic.publicUrl(data),
          readonly: true
        }),
        m('p.explanation.small', i18n('theFirstPersonToComeOnThisUrlWillPlayWithYou')),
        m('div.go_or_cancel.clearfix', [
          m('button.binary_choice[data-icon=E]', {
            config: helper.ontouchend(function() {
              window.plugins.socialsharing.share(null, null, null, gameLogic.publicUrl(data));
            })
          }, i18n('shareGameURL')),
          m('button.binary_choice[data-icon=L]', {
            config: helper.ontouchend(ctrl.cancelChallenge)
          }, i18n('cancel'))
        ]),
        m('br'),
        m('p.explanation.small', data.game.variant.name + ', ' + mode),
        m('p.time.small[data-icon=p]', gameLogic.time(data))
      ]),
      true
    );
  };
}

function awaitChallengeOverlay(ctrl) {
  return function() {
    return popupWidget(
      'await_url_challenge',
      i18n('challengeToPlay'),
      m('div.infos', [
        m('div.user', m.route.param('userId')),
        m('br'),
        m('div.loader', m('span[data-icon=U]')),
        m('br'),
        m('p', i18n('waitingForOpponent')),
        m('button[data-icon=L]', {
          config: helper.ontouchend(ctrl.cancelChallenge)
        }, i18n('cancel'))
      ]),
      true
    );
  };
}

module.exports = function(ctrl) {
  if (ctrl.getRound()) return roundView(ctrl.getRound());

  var theme = settings.general.theme;
  var pov = gamesMenu.lastJoined;
  var header, board, overlay;

  if (pov) {
    header = widgets.connectingHeader;
    board = utils.partialf(widgets.boardArgs, pov.fen, pov.lastMove, pov.color,
      pov.variant.key, theme.board(), theme.piece());
  } else {
    header = utils.partialf(widgets.header, 'lichess.org');
    board = widgets.board;
  }

  if (ctrl.isJoinable()) overlay = joinOverlay(ctrl);
  else if (ctrl.isAwaitingInvite()) overlay = awaitInviteOverlay(ctrl);
  else if (ctrl.isAwaitingChallenge()) overlay = awaitChallengeOverlay(ctrl);

  return layout.board(header, board, widgets.empty, menu.view, overlay,
    pov ? pov.color : null);
};

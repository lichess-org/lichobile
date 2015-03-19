var chessground = require('chessground');
var settings = require('../../../settings');
var layout = require('../../layout');
var widgets = require('../../widget/common');
var menu = require('../../menu');
var clock = require('../clock');
var renderPromotion = require('../promotion').view;
var utils = require('../../../utils');
var helper = require('../../helper');
var i18n = require('../../../i18n');
var button = require('./button');
var game = require('../game');
var gameStatus = require('../status');
var replayView = require('../replay/replayView');
var renderChat = require('../chat').view;
var renderCorrespondenceClock = require('../correspondenceClock/correspondenceView');

function compact(x) {
  if (Object.prototype.toString.call(x) === '[object Array]') {
    var elems = x.filter(function(n) {
      return n !== undefined;
    });
    return elems.length > 0 ? elems : null;
  }
  return x;
}

function ratingDiff(player) {
  if (typeof player.ratingDiff === 'undefined') return null;
  if (player.ratingDiff === 0) return m('span.rp.null', 0);
  if (player.ratingDiff > 0) return m('span.rp.up', ' +' + player.ratingDiff);
  if (player.ratingDiff < 0) return m('span.rp.down', ' ' + player.ratingDiff);
}

function renderMaterial(material) {
  var children = [];
  for (var role in material) {
    var piece = m('div.' + role);
    var count = material[role];
    var content;
    if (count === 1) content = piece;
    else {
      content = [];
      for (var i = 0; i < count; i++) content.push(piece);
    }
    children.push(m('div.tomb', content));
  }
  return children;
}

function renderCheckCount(ctrl, color) {
  var player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
  if (typeof player.checks !== 'undefined') return m('div.checks', player.checks);
}

function renderAntagonist(ctrl, player, material) {
  return m('section.antagonist', [
    m('div.vertical_align', [
      m('div.infos', [
        m('h2', utils.playerName(player)),
        m('div', [
          player.user ? m('h3.rating', [
            player.rating,
            ratingDiff(player)
          ]) : null,
          renderCheckCount(ctrl, player.color),
          renderMaterial(material)
        ])
      ]),
      ctrl.clock ? clock.view(ctrl.clock, player.color, ctrl.isClockRunning() ? ctrl.data.game.player : null) : (
        ctrl.data.correspondence ? renderCorrespondenceClock(
          ctrl.correspondenceClock, i18n, player.color, ctrl.data.game.player
        ) : null
      )
    ])
  ]);
}

function renderGameRunningActions(ctrl) {
  if (ctrl.data.player.spectator) return null;

  var d = ctrl.data;
  var answerButtons = compact([
    button.cancelDrawOffer(ctrl),
    button.answerOpponentDrawOffer(ctrl),
    button.cancelTakebackProposition(ctrl),
    button.answerOpponentTakebackProposition(ctrl),
    (game.mandatory(d) && game.nbMoves(d, d.player.color) === 0) ? m('div.text[data-icon=j]',
      ctrl.trans('youHaveNbSecondsToMakeYourFirstMove', 30)
    ) : undefined
  ]);
  return [
    m('div.game_controls', [
      button.shareLink(ctrl),
      button.moretime(ctrl),
      button.standard(ctrl, game.abortable, 'L', 'abortGame', 'abort'),
      button.forceResign(ctrl) || [
        button.standard(ctrl, game.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
        button.standard(ctrl, game.drawable, '2', 'offerDraw', 'draw-yes'),
        button.standard(ctrl, game.resignable, 'b', 'resign', 'resign'),
        button.threefoldClaimDraw(ctrl)
      ]
    ]),
    answerButtons ? m('div.answers', answerButtons) : null
  ];
}

function renderGameEndedActions(ctrl) {
  var result;
  if (gameStatus.finished(ctrl.data)) switch (ctrl.data.game.winner) {
    case 'white':
      result = '1-0';
      break;
    case 'black':
      result = '0-1';
      break;
    default:
      result = '½-½';
  }
  var winner = game.getPlayer(ctrl.data, ctrl.data.game.winner);
  var status = gameStatus.toLabel(ctrl.data) +
    (winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  var buttons = [
    button.answerOpponentRematch(ctrl),
    button.cancelRematch(ctrl),
    button.rematch(ctrl)
  ];
  return [
    m('div.result', [result, m('br'), m('br'), status]),
    ctrl.data.player.spectator ? null : m('div.control.buttons', buttons)
  ];
}

function gameInfos(data) {
  var time;
  if (data.clock)
    time = utils.secondsToMinutes(data.clock.initial).toString() + '+' +
      data.clock.increment;
  var mode = data.game.rated ? i18n('rated') : i18n('casual');
  var icon = utils.gameIcon(data.game.perf);
  var infos = [time + ' • ' + data.game.perf, m('br'), mode];
  return [
    m('div.icon-game', {
      'data-icon': icon ? icon : ''
    }),
    m('div.game-title', infos)
  ];
}

function renderPlayerActions(ctrl) {
  return widgets.overlayPopup(
    gameInfos(ctrl.data),
    game.playable(ctrl.data) ?  renderGameRunningActions(ctrl) : renderGameEndedActions(ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  );
}


function renderGameButtons(ctrl) {
  var actions = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      className: helper.classSet({
        'answer_required': ctrl.data.opponent.proposingTakeback ||
          ctrl.data.opponent.offeringDraw ||
          game.forceResignable(ctrl.data) ||
          ctrl.data.opponent.offeringRematch
      }),
      config: helper.ontouchend(ctrl.showActions)
    }),
    ctrl.chat ? m('button#open_chat.game_action[data-icon=c]', {
      className: helper.classSet({
        unread: ctrl.chat.unread
      }),
      config: helper.ontouchend(ctrl.chat.open || utils.noop)
    }) : m('button.game_action.empty[data-icon=c]'),
    replayView.renderButtons(ctrl.replay)
  ];
  return m('section#game_actions', actions);
}

module.exports = function(ctrl) {

  var material = chessground.board.getMaterialDiff(ctrl.chessground.data);

  function footer() {
    var els = [
      renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color]),
      renderGameButtons(ctrl),
      renderPlayerActions(ctrl)
    ];
    if (ctrl.chat) els.push(renderChat(ctrl.chat));

    return els;
  }

  function header() {
    return [
      m('nav', {
        className: ctrl.vm.connectedWS ? '' : 'reconnecting'
      }, [
        widgets.menuButton(),
        widgets.gameButton(),
        ctrl.vm.connectedWS ? m('h1.playing', ctrl.title) : m('h1.reconnecting', [
          i18n('reconnecting'),
          widgets.loader
        ])
      ]),
      renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color])
    ];
  }

  function board() {
    var x = helper.viewportDim().vw;
    return m('section.board_wrapper', {
      style: {
        height: x + 'px'
      }
    }, [
      m('div.board', {
        className: [
          settings.general.theme.board(),
          settings.general.theme.piece(),
          ctrl.data.game.variant.key
        ].join(' ')
      }, chessground.view(ctrl.chessground), renderPromotion(ctrl))
    ]);
  }

  return layout.board(header, board, footer, menu.view, null, ctrl.data.player.color);
};

module.exports.renderMaterial = renderMaterial;

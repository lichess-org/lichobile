var chessground = require('chessground');
var clock = require('../clock');
var renderPromotion = require('../promotion').view;
var utils = require('../../../utils');
var i18n = require('../../../i18n');
var button = require('./button');
var round = require('../round');
var gameStatus = require('../status');
var replayView = require('../replay/replayView');

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
  if (player.ratingDiff > 0) return m('span.rp.up', '+' + player.ratingDiff);
  if (player.ratingDiff < 0) return m('span.rp.down', player.ratingDiff);
}

function renderUser(ctrl, player) {
  return player.user ? (
    (player.user.title ? player.user.title + ' ' : '') + player.user.username
  ) : 'Anonymous';
}

function renderMaterial(ctrl, color) {
  var material = chessground.board.getMaterialDiff(ctrl.chessground.data)[color];
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
  return m('div.material', children);
}

function renderAntagonist(ctrl, player) {
  return m('section.antagonist', [
    m('div.vertical_align', [
      m('div.infos', [
        m('h2', player.ai ? i18n('aiNameLevelAiLevel', 'Stockfish', player.ai) : renderUser(ctrl, player)),
        m('div', [
          player.user ? m('h3.rating', [
            player.rating,
            ratingDiff(player)
          ]) : null,
          renderMaterial(ctrl, player.color)
        ])
      ]),
      ctrl.clock ? clock.view(ctrl.clock, player.color, ctrl.isClockRunning() ? ctrl.data.game.player : null) : null
    ])
  ]);
}

function renderGameRunningActions(ctrl) {
  var d = ctrl.data;
  var answerButtons = compact([
    button.cancelDrawOffer(ctrl),
    button.answerOpponentDrawOffer(ctrl),
    button.cancelTakebackProposition(ctrl),
    button.answerOpponentTakebackProposition(ctrl), (round.mandatory(d) && round.nbMoves(d, d.player.color) === 0) ? m('div.text[data-icon=j]',
      ctrl.trans('youHaveNbSecondsToMakeYourFirstMove', 30)
    ) : null
  ]);
  return [
    m('div.actions', [
      button.standard(ctrl, round.abortable, 'L', 'abortGame', 'abort'),
      button.standard(ctrl, round.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
      button.standard(ctrl, round.drawable, '2', 'offerDraw', 'draw-yes'),
      button.standard(ctrl, round.resignable, 'b', 'resign', 'resign'),
      button.forceResign(ctrl),
      button.threefoldClaimDraw(ctrl)
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
  var winner = round.getPlayer(ctrl.data, ctrl.data.game.winner);
  var status = gameStatus.toLabel(ctrl.data) +
    (winner ? ', ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') : null);
  var buttons = compact(ctrl.vm.redirecting ? null : [
    button.joinRematch(ctrl),
    button.answerOpponentRematch(ctrl),
    button.cancelRematch(ctrl),
    button.rematch(ctrl)
  ]);
  return [
    m('div.result', [ result, m('br'), m('br'), status ]),
    buttons ? m('div.control.buttons', buttons) : null,
  ];
}

function renderPlayerActions(ctrl) {
  return m('div.overlay', {
    class: utils.classSet({
      hide: !ctrl.vm.showingActions
    })
  }, [
    m('div.overlay-close', {
        config: utils.ontouchend(function() {
          ctrl.vm.showingActions = false;
        })
      },
      '+'),
    m('div#player_controls.overlay-content', round.playable(ctrl.data) ?
      renderGameRunningActions(ctrl) : renderGameEndedActions(ctrl)
    )
  ]);
}


function renderGameButtons(ctrl) {
  var actions = [
    m('button#open_player_controls.game_action[data-icon=O]', {
      class: utils.classSet({
        'answer_required': ctrl.data.opponent.proposingTakeback || ctrl.data.opponent.offeringDraw
      }),
      config: utils.ontouchend(function() {
        ctrl.vm.showingActions = true;
      })
    }),
    m('button.game_action[data-icon=c].disabled'),
    replayView.renderButtons(ctrl.replay),
    renderPlayerActions(ctrl)
  ];

  return m('section#game_actions', actions);
}

function renderFooter(ctrl) {
  return [
    renderAntagonist(ctrl, ctrl.data.player),
    renderGameButtons(ctrl)
  ];
}

function renderHeader(ctrl) {
  return renderAntagonist(ctrl, ctrl.data.opponent);
}

function renderBoard(ctrl) {
  var x = utils.getViewportDims().vw;
  return m('section.board_wrapper', {
    style: {
      height: x + 'px'
    }
  }, [
    m('div.board.grey.merida', [
      chessground.view(ctrl.chessground), renderPromotion(ctrl)
    ])
  ]);
}

module.exports = {
  renderBoard: renderBoard,
  renderFooter: renderFooter,
  renderHeader: renderHeader
};

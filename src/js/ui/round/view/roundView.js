var chessground = require('chessground');
var clock = require('../clock');
var renderPromotion = require('../promotion').view;
var utils = require('../../../utils');
var i18n = require('../../../i18n');
var buttons = require('./buttons');
var replayView = require('../replay/replayView');

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
  ]);
}

function renderPlayerActions(ctrl) {
  return m('div.overlay', {
    class: utils.classSet({
      hide: !ctrl.vm.showingActions
    })
  }, [
    m('div.overlay-close',
      { config: utils.ontouchend(function() { ctrl.vm.showingActions = false; }) },
    '+'),
    m('div#player_controls', [
      m('button.resign[data-icon=b]', 'Resign'),
      m('button.draw[data-icon=2]', 'Draw'),
      m('button.takeback[data-icon=i]', 'Takeback')
    ])
  ]);
}

function renderGameActions(ctrl) {
  var actions = [
    m('button.game_action[data-icon=O]', {
      config: utils.ontouchend(function() { ctrl.vm.showingActions = true; })
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
    renderGameActions(ctrl)
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

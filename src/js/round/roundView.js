var chessground = require('chessground');
var clock = require('./clock');
var renderPromotion = require('./promotion').view;
var utils = require('../utils');
var i18n = require('../i18n');

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
      m('h2', player.ai ? i18n('aiNameLevelAiLevel', 'Stockfish ', player.ai) : (player.user ? player.user.username : 'Anonymous')),
      m('div', [
        player.user ? m('h3.rating', player.rating) : null,
        renderMaterial(ctrl, player.color)
      ])
    ]),
    ctrl.clock ? clock.view(ctrl.clock, player.color, ctrl.isClockRunning() ? ctrl.data.game.player : null) : null
  ]);
}

function renderPlayer(ctrl) {
  return renderAntagonist(ctrl, ctrl.data.player);
}

function renderOpponent(ctrl) {
  return renderAntagonist(ctrl, ctrl.data.opponent);
}

function renderBoard(ctrl) {
  var vw = utils.getViewportDims().vw;
  return m('section#board.grey.merida', {
    style: {
      height: vw + 'px'
    }
  }, [
    chessground.view(ctrl.chessground), renderPromotion(ctrl)
  ]);
}

module.exports = {
  renderBoard: renderBoard,
  renderPlayer: renderPlayer,
  renderOpponent: renderOpponent
};

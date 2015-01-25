var utils = require('../../../utils');

function renderBackwardButton(ctrl) {
  return m('button.game_action[data-icon=I]', {
    config: utils.ontouchend(function() {
      if (ctrl.ply > 0) ctrl.jump(ctrl.ply - 1);
    }),
    class: utils.classSet({
      disabled: !(ctrl.ply > 0)
    })
  });
}

function renderForwardButton(ctrl, nbMoves) {
  return m('button.game_action[data-icon=H]', {
    config: utils.ontouchend(function() {
      if (ctrl.ply < ctrl.situations.length - 1) ctrl.jump(ctrl.ply + 1);
    }),
    class: utils.classSet({
      disabled: !(ctrl.ply < ctrl.situations.length - 1)
    })
  });
}

module.exports.renderButtons = function(ctrl) {
  return [
    renderBackwardButton(ctrl),
    renderForwardButton(ctrl)
  ];
};

var utils = require('../../../utils');
var helper = require('../../helper');

function renderBackwardButton(ctrl) {
  return m('button.game_action[data-icon=I]', {
    config: helper.ontouchend(function() {
      if (ctrl.ply > 1) ctrl.jump(ctrl.ply - 2);
    }),
    className: helper.classSet({
      disabled: !(ctrl.ply > 1)
    })
  });
}

function renderForwardButton(ctrl, nbMoves) {
  return m('button.game_action[data-icon=H]', {
    config: helper.ontouchend(function() {
      if (ctrl.ply < ctrl.situations.length - 2) ctrl.jump(ctrl.ply + 2);
    }),
    className: helper.classSet({
      disabled: !(ctrl.ply < ctrl.situations.length - 2)
    })
  });
}

module.exports.renderButtons = function(ctrl) {
  return [
    renderBackwardButton(ctrl),
    renderForwardButton(ctrl)
  ];
};

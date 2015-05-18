var helper = require('../../helper');

function renderBackwardButton(ctrl) {
  return m('button.game_action[data-icon=I]', {
    config: helper.ontouch(() => {
      if (ctrl.ply > 1) ctrl.jump(ctrl.ply - 2);
    }, () => ctrl.jump(0)),
    className: helper.classSet({
      disabled: !(ctrl.ply > 1)
    })
  });
}

function renderForwardButton(ctrl) {
  return m('button.game_action[data-icon=H]', {
    config: helper.ontouch(() => {
      if (ctrl.ply < ctrl.situations.length - 2) ctrl.jump(ctrl.ply + 2);
    }, () => ctrl.jump(ctrl.situations.length - 2)),
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

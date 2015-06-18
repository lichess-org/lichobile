/** @jsx m */
import helper from '../helper';
import { renderMaterial } from '../round/view/roundView';

export function renderAntagonist(ctrl, playerName, material, position) {
  const {vh, vw} = helper.viewportDim();
  // must do this here because of the lack of `calc` support
  // 50 refers to either header height of game actions bar height
  const style = helper.isLandscape() ? {} : { height: ((vh - vw) / 2 - 50) + 'px' };
  const key = helper.isLandscape() ? position + '-landscape' : position + '-portrait';

  return m('section.antagonist', {
    className: position, key, style
  }, [
    m('div.infos', [
      m('h2', playerName),
      m('div'),
      renderMaterial(material)
    ])
  ]);
}

export function renderGameActionsBar(ctrl, actionsViewF) {
  var vdom = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      config: helper.ontouch(ctrl.actions.open)
    }),
    m('button.game_action.empty[data-icon=c]'),
    renderBackwardButton(ctrl.replay),
    renderForwardButton(ctrl.replay),
    actionsViewF(ctrl.actions)
  ];
  return m('section#game_actions', vdom);
}

function renderBackwardButton(ctrl) {
  return m('button.game_action[data-icon=I]', {
    config: helper.ontouch(ctrl.backward, () => ctrl.jump(0)),
    className: helper.classSet({
      disabled: !(ctrl.ply > 0)
    })
  });
}

function renderForwardButton(ctrl) {
  return m('button.game_action[data-icon=H]', {
    config: helper.ontouch(ctrl.forward, () => ctrl.jump(ctrl.situations.length - 1)),
    className: helper.classSet({
      disabled: !(ctrl.ply < ctrl.situations.length - 1)
    })
  });
}

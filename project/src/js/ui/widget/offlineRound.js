/** @jsx m */
import helper from '../helper';
import i18n from '../../i18n';
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

export function renderEndedGameStatus(ctrl) {
  let sit = ctrl.root.replay.situation();
  let result, status;
  if (sit && sit.finished) {
    if (sit.checkmate) {
      result = sit.turnColor === 'white' ? '0-1' : '1-0';
      status = i18n('checkmate') + '. ' + i18n(sit.color === 'white' ? 'blackIsVictorious' : 'whiteIsVictorious') + '.';
    } else if (sit.stalemate || sit.draw || sit.threefold) {
      result = '½-½';
      if (sit.stalemate) status = i18n('stalemate');
      else status = i18n('draw');
    }
    return (
      <div className="result">
        {result}
        <br />
        <br />
        <div className="status">{status}</div>
      </div>
    );
  }
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

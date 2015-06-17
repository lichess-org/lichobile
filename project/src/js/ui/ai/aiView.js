/** @jsx m */
import chessground from 'chessground';
import layout from '../layout';
import widgets from '../widget/common';
import { view as renderPromotion } from './promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard, renderMaterial } from '../round/view/roundView';
import replayView from './replay/replayView';
import actions from './actions';

function renderAntagonist(ctrl, player, material, position) {
  const {vh, vw} = helper.viewportDim();
  // must do this here because of the lack of `calc` support
  // 50 refers to either header height of game actions bar height
  const style = helper.isLandscape() ? {} : { height: ((vh - vw) / 2 - 50) + 'px' };
  const key = helper.isLandscape() ? position + '-landscape' : position + '-portrait';

  return m('section.antagonist', {
    className: position, key, style
  }, [
    m('div.infos', [
      m('h2', player.color === ctrl.data.player.color ?
        '' :
        ctrl.getOpponent().name),
      m('div'),
      renderMaterial(material)
    ])
  ]);
}

function renderGameActionsBar(ctrl) {
  let vdom = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      config: helper.ontouch(ctrl.actions.open)
    }),
    m('button.game_action.empty[data-icon=c]'),
    replayView.renderButtons(ctrl.replay),
    actions.view(ctrl.actions),
    renderPromotion(ctrl)
  ];
  return m('section#game_actions', vdom);
}

module.exports = function(ctrl) {

  var material = chessground.board.getMaterialDiff(ctrl.chessground.data);

  function header() {
    return [
      m('nav', [
        widgets.menuButton(),
        m('h1.playing', i18n('playOfflineComputer')),
        widgets.headerBtns()
      ])
    ];
  }

  function content() {
    if (helper.isPortrait())
      return (
        <div className="content round">
          {renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent')}
          {renderBoard(ctrl, renderPromotion)}
          {renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player')}
          {renderGameActionsBar(ctrl)}
        </div>
      );
    else
      return (
        <div className="content round">
          {renderBoard(ctrl, renderPromotion)}
          <section key="table" className="table">
            {renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent')}
            {renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player')}
          </section>
        </div>
      );
  }

  return layout.board(header, content, null);
};

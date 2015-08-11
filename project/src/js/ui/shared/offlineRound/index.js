import helper from '../../helper';
import * as utils from '../../../utils';
import i18n from '../../../i18n';
import { renderMaterial } from '../../round/view/roundView';
import m from 'mithril';

export function renderAntagonist(ctrl, playerName, material, position) {
  const {vh, vw} = helper.viewportDim();
  const headerHeight = vh > 480 ? 50 : 40;
  const contentHeight = vh - headerHeight;
  // must do this here because of the lack of `calc` support
  // 45 refers to game actions bar height
  const style = helper.isLandscape() ? {} : { height: ((contentHeight - vw - 45) / 2) + 'px' };
  const key = helper.isLandscape() ? position + '-landscape' : position + '-portrait';

  return m('section.antagonist', {
    className: position, key, style
  }, [
    m('div.antagonistInfos offline', [
      m('h2', playerName),
      m('div.ratingAndMaterial', renderMaterial(material))
    ])
  ]);
}

export function renderGameActionsBar(ctrl) {
  var vdom = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      config: helper.ontouch(ctrl.actions.open)
    }),
    m('button.game_action.empty[data-icon=c]'),
    renderBackwardButton(ctrl.replay),
    renderForwardButton(ctrl.replay)
  ];
  return m('section#game_actions', vdom);
}

export function renderGameActionsBarTablet(ctrl) {
  const d = ctrl.data;
  return (
    <section id="game_actions">
      <button className="game_action" data-icon="U"
        config={helper.ontouch(utils.f(ctrl.initAs, utils.oppositeColor(d.player.color)), () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom'))}
      />
      <button className="fa fa-share-alt game_action"
        config={helper.ontouch(ctrl.actions.sharePGN, () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom'))}
      />
      {renderBackwardButton(ctrl.replay)}
      {renderForwardButton(ctrl.replay)}
    </section>
  );
}

export function renderEndedGameStatus(ctrl) {
  let sit = ctrl.root.replay.situation();
  let result, status;
  if (sit && sit.finished) {
    if (sit.checkmate) {
      result = sit.turnColor === 'white' ? '0-1' : '1-0';
      status = i18n('checkmate') + '. ' + i18n(sit.turnColor === 'white' ? 'blackIsVictorious' : 'whiteIsVictorious') + '.';
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
        <div className="resultStatus">{status}</div>
      </div>
    );
  }

  return null;
}

export function renderReplayTable(ctrl) {
  const curPly = ctrl.ply;
  const shouldDisplay = helper.isLandscape();
  const hash = curPly + ctrl.situationsHash(ctrl.situations) + shouldDisplay;

  if (ctrl.hash === hash) return {subtree: 'retain'};
  ctrl.hash = hash;

  if (!shouldDisplay) return null;

  return (
    <div key="replay-table" className="replay">
      <div className="gameMovesList native_scroller"
        config={(el, isUpdate) => {
          autoScroll(el);
          if (!isUpdate) setTimeout(autoScroll.bind(undefined, el), 100);
        }}
      >
        {renderTable(ctrl, curPly)}
      </div>
    </div>
  );
}

function renderBackwardButton(ctrl) {
  return m('button.game_action[data-icon=I]', {
    config: helper.ontouch(ctrl.backward, () => ctrl.jump(ctrl.firstPly())),
    className: helper.classSet({
      disabled: !(ctrl.ply > ctrl.firstPly())
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

function renderTd(step, curPly) {
  return step ? (
    <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}>
      {step.san}
    </td>
  ) : null;
}

function renderTable(ctrl, curPly) {
  const steps = ctrl.situations;
  const pairs = [];
  for (let i = 1; i < steps.length; i += 2) pairs.push([steps[i], steps[i + 1]]);
  return (
    <table className="moves">
      <tbody>
        {pairs.map(function(pair, i) {
          return (
            <tr>
              <td className="replayMoveIndex">{ (i + 1) + '.' }</td>
              {renderTd(pair[0], curPly)}
              {renderTd(pair[1], curPly)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function autoScroll(movelist) {
  if (!movelist) return;
  var plyEl = movelist.querySelector('.current') || movelist.querySelector('tr:first-child');
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
}

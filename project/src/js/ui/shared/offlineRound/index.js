import helper from '../../helper';
import statusApi from '../../../lichess/status';
import * as utils from '../../../utils';
import i18n from '../../../i18n';
import { renderMaterial } from '../../round/view/roundView';
import m from 'mithril';

export function renderAntagonist(ctrl, content, material, position, isPortrait) {
  const key = isPortrait ? position + '-portrait' : position + '-landscape';

  return (
    <section className={'playTable ' + position} key={key}>
      <div className="antagonistInfos offline">
        <div>{content}</div>
        <div className="ratingAndMaterial">{renderMaterial(material)}</div>
      </div>
    </section>
  );
}

export function renderGameActionsBar(ctrl, type) {
  return (
    <section className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h"
        config={helper.ontouch(ctrl.actions.open)}
      />
      <button className="action_bar_button" data-icon="U"
        config={helper.ontouch(ctrl.startNewGame, () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom'))}
      />
      <button className="action_bar_button fa fa-eye"
        config={helper.ontouch(() => m.route(`/analyse/offline/${type}/${ctrl.data.player.color}`))}
      />
      <button className="fa fa-share-alt action_bar_button"
        config={helper.ontouch(ctrl.actions.sharePGN, () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom'))}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  );
}

export function renderGameActionsBarTablet(ctrl, type) {
  const d = ctrl.data;
  return (
    <section className="actions_bar">
      <button className="action_bar_button" data-icon="U"
        config={helper.ontouch(ctrl.startNewGame, () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom'))}
      />
      <button className="action_bar_button fa fa-eye"
        config={helper.ontouch(() => m.route(`/analyse/offline/${type}/${ctrl.data.player.color}`))}
      />
      <button className="fa fa-share-alt action_bar_button"
        config={helper.ontouch(ctrl.actions.sharePGN, () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom'))}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  );
}

export function gameResult(replayCtrl) {
  let sit = replayCtrl.situation();
  if (sit && sit.finished)
    return sit.turnColor === 'white' ? '0-1' : '1-0';
  else if (sit.stalemate || sit.draw || sit.threefold)
    return '½-½';
  else
    return '?';
}

export function setResult(ctrl) {
  const sit = ctrl.replay.situation();
  ctrl.data.game.status.id = statusApi.offlineSituationToStatus(sit);
  if (!sit.draw) {
    ctrl.data.game.winner = utils.oppositeColor(sit.turnColor);
  }
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
        <em className="resultStatus">{status}</em>
      </div>
    );
  }
}

export function renderSharePGNButton(ctrl) {
  return (
    <button className="fa fa-share-alt" config={helper.ontouch(ctrl.sharePGN)}>
      {i18n('sharePGN')}
    </button>
  );
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
  return m('button.action_bar_button.fa.fa-step-backward', {
    config: helper.ontouch(ctrl.backward, () => ctrl.jump(ctrl.firstPly())),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply > ctrl.firstPly())
    })
  });
}

function renderForwardButton(ctrl) {
  return m('button.action_bar_button.fa.fa-step-forward', {
    config: helper.ontouch(ctrl.forward, () => ctrl.jump(ctrl.replay.situations.length - 1)),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply < ctrl.replay.situations.length - 1)
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

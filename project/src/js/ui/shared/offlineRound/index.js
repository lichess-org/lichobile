import helper from '../../helper';
import * as utils from '../../../utils';
import i18n from '../../../i18n';
import gameApi from '../../../lichess/game';
import gameStatusApi from '../../../lichess/status';
import { renderMaterial } from '../../round/view/roundView';
import m from 'mithril';

export function renderAntagonist(ctrl, content, material, position, isPortrait, isVWS) {
  const key = isPortrait ? position + '-portrait' : position + '-landscape';

  const antagonistColor = ctrl.data[position].color;

  return (
    <section className={'playTable ' + position} key={key}>
      <div key="infos" className="antagonistInfos offline">
        <div>{content}</div>
        <div className="ratingAndMaterial">
          {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
          { ctrl.data.game.variant.key === 'threeCheck' ?
            <div className="checkCount">&nbsp;{getChecksCount(ctrl, antagonistColor)}</div> : null
          }
        </div>
      </div>
      { !isVWS && position === 'opponent' && ctrl.vm && ctrl.vm.engineSearching ?
        <div key="spinner" className="engineSpinner">
          <div className="fa fa-spinner fa-pulse" />
        </div> :
        null
      }
    </section>
  );
}

function getChecksCount(ctrl, color) {
  const sit = ctrl.replay.situation();
  return sit.checkCount[utils.oppositeColor(color)];
}

export function renderGameActionsBar(ctrl, type) {
  return (
    <section key="actionsBar" className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h"
        config={helper.ontouch(ctrl.actions.open)}
      />
      <button className="action_bar_button" data-icon="U"
        config={helper.ontouch(
          ctrl.newGameMenu.open,
          () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom')
        )}
      />
      <button className="action_bar_button fa fa-eye"
        config={helper.ontouch(
          () => m.route(`/analyse/offline/${type}/${ctrl.data.player.color}`),
          () => window.plugins.toast.show(i18n('analysis'), 'short', 'bottom')
        )}
      />
      <button className="fa fa-share-alt action_bar_button"
        config={helper.ontouch(
          ctrl.actions.sharePGN,
          () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom')
        )}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  );
}

export function renderGameActionsBarTablet(ctrl, type) {
  return (
    <section className="actions_bar">
      <button className="action_bar_button" data-icon="U"
        config={helper.ontouch(ctrl.newGameMenu.open, () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom'))}
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

export function setResult(ctrl, status, winner) {
  const sit = ctrl.replay.situation();
  if (status) {
    ctrl.data.game.status = status;
  }
  ctrl.data.game.winner = winner || sit.winner;
}

export function renderEndedGameStatus(ctrl) {
  const sit = ctrl.replay.situation();
  if (gameStatusApi.finished(ctrl.data)) {
    const result = gameApi.result(ctrl.data);
    const winner = sit.winner;
    const status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key) +
      (winner ? '. ' + i18n(winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
    return (
      <div key="result" className="result">
        {result}
        <br />
        <em className="resultStatus">{status}</em>
      </div>
    );
  }

  return null;
}

export function renderClaimDrawButton(ctrl) {
  return gameApi.playable(ctrl.data) ? m('div.claimDraw', {
    key: 'claimDraw'
  }, [
    m('button[data-icon=2].draw-yes', {
      config: helper.ontouch(() => ctrl.replay.claimDraw())
    }, i18n('threefoldRepetition'))
  ]) : null;
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
  if (step && step.pgnMoves.length) {
    const san = step.pgnMoves[step.pgnMoves.length - 1];
    return (
      <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}>
        {san}
      </td>
    );
  }
  return null;
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

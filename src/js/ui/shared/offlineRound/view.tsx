import * as h from 'mithril/hyperscript';
import router from '../../../router';
import * as utils from '../../../utils';
import i18n from '../../../i18n';
import * as gameApi from '../../../lichess/game';
import gameStatusApi from '../../../lichess/status';
import { GameSituation } from '../../../chess'
import { renderMaterial } from '../../shared/round/view/roundView';
import * as helper from '../../helper';
import CrazyPocket from '../../shared/round/crazy/CrazyPocket';
import { OfflineRoundInterface, Position, Material } from '../round';
import settings from '../../../settings';
import Replay from './Replay';

let pieceNotation: boolean;

function getChecksCount(ctrl: OfflineRoundInterface, color: Color) {
  const sit = ctrl.replay.situation();
  if (sit.checkCount)
    return utils.oppositeColor(color) === 'white' ?
      sit.checkCount.white : sit.checkCount.black;
  else
    return 0
}

type OfflineGameType = 'ai' | 'otb';

export function renderAntagonist(ctrl: OfflineRoundInterface, content: Mithril.Children, material: Material, position: Position, isPortrait: boolean, otbFlip?: boolean, customPieceTheme?: string) {
  const sit = ctrl.replay.situation();
  const isCrazy = !!sit.crazyhouse;
  const key = isPortrait ? position + '-portrait' : position + '-landscape';
  const antagonist = position === 'player' ? ctrl.data.player : ctrl.data.opponent;
  const antagonistColor = antagonist.color;

  const className = [
    'playTable',
    position,
    isCrazy ? 'crazy' : '',
    otbFlip !== undefined ? otbFlip ? 'mode_flip' : 'mode_facing' : '',
    ctrl.chessground.data.turnColor === 'white' ? 'turn_white' : 'turn_black'
  ].join(' ');

  return (
    <section className={className} key={key}>
      <div key="infos" className={'antagonistInfos offline' + (isCrazy ? ' crazy' : '')}>
        <div className="antagonistUser">
          {content}
        </div>
        { !isCrazy ? <div className="ratingAndMaterial">
          {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
          { ctrl.data.game.variant.key === 'threeCheck' ?
            <div className="checkCount">&nbsp;+{getChecksCount(ctrl, antagonistColor)}</div> : null
          }
        </div> : null
        }
      </div>
      {sit.crazyhouse ? h(CrazyPocket, {
        ctrl,
        crazyData: sit.crazyhouse,
        color: antagonistColor,
        position,
        customPieceTheme
      }) : null}
    </section>
  )
}


export function renderGameActionsBar(ctrl: OfflineRoundInterface, type: OfflineGameType) {
  return (
    <section key="actionsBar" className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h"
        oncreate={helper.ontap(ctrl.actions.open)}
      />
      <button className="action_bar_button" data-icon="U"
        oncreate={helper.ontap(
          ctrl.newGameMenu.open,
          () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom')
        )}
      />
      <button data-icon="A" className="action_bar_button"
        oncreate={helper.ontap(
          () => router.set(`/analyse/offline/${type}/${ctrl.data.player.color}`),
          () => window.plugins.toast.show(i18n('analysis'), 'short', 'bottom')
        )}
      />
      <button className="fa fa-share-alt action_bar_button"
        oncreate={helper.ontap(
          ctrl.actions.sharePGN,
          () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom')
        )}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  );
}

export function renderGameActionsBarTablet(ctrl: OfflineRoundInterface, type: OfflineGameType) {
  return (
    <section className="actions_bar">
      <button className="action_bar_button" data-icon="U"
        oncreate={helper.ontap(ctrl.newGameMenu.open, () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom'))}
      />
      <button data-icon="A" className="action_bar_button"
        oncreate={helper.ontap(() => router.set(`/analyse/offline/${type}/${ctrl.data.player.color}`))}
      />
      <button className="fa fa-share-alt action_bar_button"
        oncreate={helper.ontap(ctrl.actions.sharePGN, () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom'))}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  );
}

export function renderEndedGameStatus(ctrl: OfflineRoundInterface) {
  if (!ctrl.replay) return null;

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

export function renderClaimDrawButton(ctrl: OfflineRoundInterface) {
  return gameApi.playable(ctrl.data) ? h('div.claimDraw', {
    key: 'claimDraw'
  }, [
    h('button[data-icon=2].draw-yes', {
      oncreate: helper.ontap(() => ctrl.replay.claimDraw())
    }, i18n('threefoldRepetition'))
  ]) : null;
}


export function renderReplayTable(ctrl: Replay) {
  const curPly = ctrl.ply;
  const shouldDisplay = !helper.isPortrait();

  if (!shouldDisplay) return null;

  return (
    <div key="replay-table" className="replay">
      <div className="gameMovesList native_scroller"
        oncreate={(vnode: Mithril.DOMNode) => { autoScroll(vnode.dom as HTMLElement); }}
        onupdate={(vnode: Mithril.DOMNode) => setTimeout(autoScroll.bind(undefined, vnode.dom), 100)}
      >
        {renderTable(ctrl, curPly)}
      </div>
    </div>
  );
}

function renderBackwardButton(ctrl: OfflineRoundInterface) {
  return h('button.action_bar_button.fa.fa-step-backward', {
    oncreate: helper.ontap(ctrl.jumpPrev, ctrl.jumpFirst),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply > ctrl.firstPly())
    })
  });
}

function renderForwardButton(ctrl: OfflineRoundInterface) {
  return h('button.action_bar_button.fa.fa-step-forward', {
    oncreate: helper.ontap(ctrl.jumpNext, ctrl.jumpLast),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply < ctrl.lastPly())
    })
  });
}

function renderTd(sit: GameSituation, curPly: number) {
  if (sit && sit.pgnMoves.length) {
    const san = sit.pgnMoves[sit.pgnMoves.length - 1];
    return (
      <td className={'replayMove' + (sit.ply === curPly ? ' current' : '')}>
        {san}
      </td>
    );
  }
  return null;
}

function renderTable(ctrl: Replay, curPly: number) {
  const steps = ctrl.situations;
  const pairs: Array<[GameSituation, GameSituation]> = [];
  for (let i = 1; i < steps.length; i += 2) pairs.push([steps[i], steps[i + 1]]);
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation;
  return (
    <table className={'moves' + (pieceNotation ? ' displayPieces' : '')}>
      <tbody>
        {pairs.map((pair, i) => {
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

function autoScroll(movelist: HTMLElement) {
  if (!movelist) return;
  const plyEl = (movelist.querySelector('.current') || movelist.querySelector('tr:first-child')) as HTMLElement
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
}

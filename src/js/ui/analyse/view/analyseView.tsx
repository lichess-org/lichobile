import * as m from 'mithril';
import { hasNetwork, playerName, oppositeColor, noNull } from '../../../utils';
import i18n from '../../../i18n';
import * as gameApi from '../../../lichess/game';
import gameStatusApi from '../../../lichess/status';
import continuePopup from '../../shared/continuePopup';
import { view as renderPromotion } from '../../shared/offlineRound/promotion';
import Board, { Attrs as BoardAttrs, Shape } from '../../shared/Board';
import * as helper from '../../helper';
import { notesView } from '../../shared/round/notes';
import { formatClockTime } from '../../shared/round/clock/clockView';
import importPgnPopup from '../importPgnPopup';
import control from '../control';
import menu from '../menu';
import analyseSettings from '../analyseSettings';
import { renderEval, isSynthetic } from '../util';
import CrazyPocket from '../../shared/round/crazy/CrazyPocket';
import explorerView from '../explorer/explorerView';
import evalSummary from '../evalSummaryPopup';
import treePath from '../path';
import { renderTree } from './treeView';
import settings from '../../../settings';

import { AnalyseCtrlInterface } from '../interfaces';

let pieceNotation: boolean;

export function overlay(ctrl: AnalyseCtrlInterface) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu),
    analyseSettings.view(ctrl.settings),
    ctrl.notes ? notesView(ctrl.notes) : null,
    ctrl.evalSummary ? evalSummary.view(ctrl.evalSummary) : null,
    continuePopup.view(ctrl.continuePopup),
    importPgnPopup.view(ctrl.importPgnPopup)
  ];
}

export function renderContent(ctrl: AnalyseCtrlInterface, isPortrait: boolean, bounds: ClientRect) {
  const ceval = ctrl.vm.step && ctrl.vm.step.ceval;
  const rEval = ctrl.vm.step && ctrl.vm.step.rEval;
  let nextBest: string | null;
  let curBestShape: Shape, pastBestShape: Shape;
  if (!ctrl.explorer.enabled() && ctrl.ceval.enabled() && ctrl.vm.showBestMove) {
    nextBest = ctrl.nextStepBest();
    curBestShape = nextBest ? {
      brush: 'paleBlue',
      orig: (nextBest.slice(0, 2) as Pos),
      dest: (nextBest.slice(2, 4) as Pos)
    } : ceval && ceval.best ? {
      brush: 'paleBlue',
      orig: (ceval.best.slice(0, 2) as Pos),
      dest: (ceval.best.slice(2, 4) as Pos)
    } : null;
  }
  if (ctrl.vm.showComments) {
    pastBestShape = rEval && rEval.best ? {
      brush: 'paleGreen',
      orig: (rEval.best.slice(0, 2) as Pos),
      dest: (rEval.best.slice(2, 4) as Pos)
    } : null;
  }

  const nextStep = ctrl.explorer.enabled() && ctrl.analyse.getStepAtPly(ctrl.vm.step.ply + 1);
  const nextMove = nextStep && nextStep.uci ? nextStep.uci.includes('@') ? {
    brush: 'palePurple',
    orig: (nextStep.uci.slice(2, 4) as Pos)
  } : {
    brush: 'palePurple',
    orig: (nextStep.uci.slice(0, 2) as Pos),
    dest: (nextStep.uci.slice(2, 4) as Pos)
  } : null;

  const shapes = nextMove ? [nextMove] : [pastBestShape, curBestShape].filter(noNull);

  const board = m<BoardAttrs>(Board, {
    data: ctrl.data,
    chessgroundCtrl: ctrl.chessground,
    bounds,
    isPortrait,
    shapes,
    wrapperClasses: 'analyse'
  });

  return [
    board,
    <div className="analyseTableWrapper">
      {ctrl.explorer.enabled() ?
        explorerView(ctrl) :
        renderAnalyseTable(ctrl, isPortrait)
      }
      {renderActionsBar(ctrl)}
    </div>
  ];
}

function renderAnalyseTable(ctrl: AnalyseCtrlInterface, isPortrait: boolean) {
  const className = [
    isSynthetic(ctrl.data) ? 'synthetic' : '',
    'analyseTable'
  ].join(' ');

  return (
    <div className={className} key="analyse">
      <div className="analyse scrollerWrapper">
        {renderReplay(ctrl)}
      </div>
      {renderInfos(ctrl, isPortrait)}
    </div>
  );
}

function renderInfos(ctrl: AnalyseCtrlInterface, isPortrait: boolean) {
  const cevalEnabled = ctrl.ceval.enabled();
  const isCrazy = !!ctrl.vm.step.crazy;

  return (
    <div id="analyseInfos" className="analyseInfos scrollerWrapper">
      { (!isCrazy || !isPortrait) && cevalEnabled ?
        renderEvalBox(ctrl) : null
      }
      { !isSynthetic(ctrl.data) ?
        <div className="native_scroller">
          {renderOpponents(ctrl, isPortrait)}
        </div> : null
      }
    </div>
  );
}

function getChecksCount(ctrl: AnalyseCtrlInterface, color: Color) {
  const step = ctrl.vm.step;
  return step.checkCount[oppositeColor(color)];
}

function renderEvalBox(ctrl: AnalyseCtrlInterface) {
  const ceval = ctrl.currentAnyEval();
  const step = ctrl.vm.step;
  let pearl: any, percent: number;

  if (ceval && ceval.cp && ctrl.nextStepBest()) {
    pearl = renderEval(ceval.cp);
    percent = ctrl.ceval.enabled() ? 100 : 0;
  }
  else if (ceval && ceval.cp) {
    pearl = renderEval(ceval.cp);
    percent = ctrl.ceval.enabled() ? ctrl.ceval.percentComplete() : 0;
  }
  else if (ceval && ceval.mate) {
    pearl = '#' + ceval.mate;
    percent = ctrl.ceval.enabled() ? 100 : 0;
  }
  else if (ctrl.ceval.enabled() && ctrl.gameOver()) {
    pearl = '-';
    percent = 0;
  }
  else if (ctrl.ceval.enabled()) {
    pearl = <div className="spinner fa fa-hourglass-half"></div>;
    percent = 0;
  }
  else {
    pearl = '-';
    percent = 0;
  }

  return (
    <div className="cevalBox">
      <pearl>
        { pearl }
        { step.ceval && step.ceval.bestSan ?
        <div className="bestMove">
          best {step.ceval.bestSan}
        </div> : null
        }
      </pearl>
      <div className="cevalBar">
        <span style={{ width: percent + '%' }}></span>
      </div>
      { step.ceval ?
      <div className="engine_info">
        <p>Depth {step.ceval.depth}/{step.ceval.maxDepth}</p>
        <p>{Math.round(step.ceval.nps / 1000)} kn/s</p>
      </div> : null
      }
    </div>
  );
}

function renderOpponents(ctrl: AnalyseCtrlInterface, isPortrait: boolean) {
  if (isSynthetic(ctrl.data)) return null;

  const player = ctrl.data.player;
  const opponent = ctrl.data.opponent;
  if (!player || !opponent) return null;

  const isCrazy = !!ctrl.vm.step.crazy;

  const gameMoment = window.moment(ctrl.data.game.createdAt);

  // TODO get that from server
  if (opponent.ai) {
    opponent.engineName = isCrazy ? 'Sunsetter' : 'Stockfish';
  }

  return (
    <div className="analyseOpponentsWrapper">
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + player.color} />
          {playerName(player, true)}
          {helper.renderRatingDiff(player)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.vm.step.checkCount ?
            ' +' + getChecksCount(ctrl, player.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[player.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy ? m(CrazyPocket, {
          ctrl,
          crazyData: ctrl.vm.step.crazy,
          color: player.color,
          position: 'top'
        }) : null}
      </div>
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + opponent.color} />
          {playerName(opponent, true)}
          {helper.renderRatingDiff(opponent)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.vm.step.checkCount ?
            ' +' + getChecksCount(ctrl, opponent.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[opponent.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy ? m(CrazyPocket, {
          ctrl,
          crazyData: ctrl.vm.step.crazy,
          color: opponent.color,
          position: 'bottom'
        }) : null}
      </div>
      <div className="gameInfos">
        {gameMoment.format('L') + ' ' + gameMoment.format('LT')}
        { ctrl.data.game.source === 'import' ?
          <div>Imported by {ctrl.data.game.importedBy}</div> : null
        }
      </div>
      {(!isCrazy || !isPortrait) && gameStatusApi.finished(ctrl.data) ? renderStatus(ctrl) : null}
    </div>
  );
}

function renderStatus(ctrl: AnalyseCtrlInterface) {
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
  return (
    <div key="gameStatus" className="status">
      {gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key)}

      {winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : null}
    </div>
  );
}

function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement);
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move');
}

function onReplayTap(ctrl: AnalyseCtrlInterface, e: Event) {
  const el = getMoveEl(e);
  if (el && (el.dataset as any).path) {
    ctrl.jump(treePath.read((el.dataset as any).path));
  }
}

function renderReplay(ctrl: AnalyseCtrlInterface) {

  let result: string;
  if (ctrl.data.game.status.id >= 30) switch (ctrl.data.game.winner) {
    case 'white':
      result = '1-0';
      break;
    case 'black':
      result = '0-1';
      break;
    default:
      result = '½-½';
  }
  const tree = renderTree(ctrl, ctrl.analyse.tree);
  if (result) {
    tree.push(<div key="gameResult" className="result">{result}</div>);
    tree.push(renderStatus(ctrl));
  }
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation;
  const replayClass = 'analyseReplay native_scroller' + (pieceNotation ? ' displayPieces' : '');
  return (
    <div id="replay" className={replayClass}
      oncreate={helper.ontap(e => onReplayTap(ctrl, e), null, null, false, getMoveEl)}
    >
      {tree}
    </div>
  );
}

function buttons(ctrl: AnalyseCtrlInterface) {
  return [
    ['first', 'fast-backward', control.first ],
    ['prev', 'backward', control.prev],
    ['next', 'forward', control.next],
    ['last', 'fast-forward', control.last]
  ].map((b: [string, string, (ctrl: AnalyseCtrlInterface) => boolean]) => {
    const className = [
      'action_bar_button',
      'fa',
      'fa-' + b[1]
    ].join(' ');

    const action = b[0] === 'prev' || b[0] === 'next' ?
      helper.ontap(() => b[2](ctrl), null, () => b[2](ctrl)) :
      helper.ontap(() => b[2](ctrl));

    return (
      <button className={className} key={b[1]} oncreate={action} />
    );
  });
}

function renderActionsBar(ctrl: AnalyseCtrlInterface) {

  const explorerBtnClass = [
    'action_bar_button',
    'fa',
    'fa-book',
    ctrl.explorer.enabled() ? 'highlight' : ''
  ].join(' ');

  return (
    <section className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h" key="analyseMenu"
        oncreate={helper.ontap(ctrl.menu.open)}
      />
      {ctrl.ceval.allowed() ?
        <button className="action_bar_button fa fa-gear" key="analyseSettings"
          oncreate={helper.ontap(ctrl.settings.open)}
        /> : null
      }
      {hasNetwork() ?
        <button className={explorerBtnClass} key="explorer"
          oncreate={helper.ontap(
            ctrl.explorer.toggle,
            () => window.plugins.toast.show('Opening explorer & endgame tablebase', 'short', 'bottom')
          )}
        /> : null
      }
      <button className="action_bar_button" data-icon="B" key="flipBoard"
        oncreate={helper.ontap(
          ctrl.flip,
          () => window.plugins.toast.show(i18n('flipBoard'), 'short', 'bottom')
        )}
      />
      {buttons(ctrl)}
    </section>
  );
}

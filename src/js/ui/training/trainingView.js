import layout from '../layout';
import router from '../../router';
import { emptyFen } from '../../utils/fen';
import i18n from '../../i18n';
import { header, connectingHeader, viewOnlyBoardContent } from '../shared/common';
import Board from '../shared/Board';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import * as helper from '../helper';
import menu, { renderUserInfos, renderSigninBox } from './menu';
import * as h from 'mithril/hyperscript';

export default function view(vnode) {
  const ctrl = vnode.state;

  return layout.board(
    !ctrl.data || ctrl.vm.loading ?
      connectingHeader :
      header.bind(undefined, i18n('training')),
    renderContent.bind(undefined, ctrl),
    () => [
      renderPromotion(ctrl),
      menu.view(ctrl.menu)
    ]
  );

}

function renderContent(ctrl) {
  if (!ctrl.data) return viewOnlyBoardContent(emptyFen);

  const isPortrait = helper.isPortrait();
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'game');
  const key = isPortrait ? 'o-portrait' : 'o-landscape';

  const board = h(Board, {
    data: ctrl.data,
    bounds,
    chessgroundCtrl: ctrl.chessground
  });

  if (isPortrait) {
    return h.fragment({ key }, [
      ctrl.data.mode === 'view' ? renderProblemDetails(ctrl) : renderExplanation(ctrl),
      board,
      ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayerTable(ctrl),
      renderActionsBar(ctrl)
    ]);
  } else {
    return h.fragment({ key }, [
      board,
      <section className="table">
        <section className="trainingTable">
          {ctrl.data.mode === 'view' ? renderProblemDetails(ctrl) : renderExplanation(ctrl)}
          <div className="trainingUserInfos landscape">
            { ctrl.data.user ? renderUserInfos(ctrl) : renderSigninBox()}
          </div>
          {ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayerTable(ctrl)}
        </section>
        {renderActionsBar(ctrl)}
      </section>
    ]);
  }
}

function renderExplanation(ctrl) {
  return (
    <section className="trainingSection">
      <p className="findit">
        {i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')}
      </p>
    </section>
  );
}

function renderProblemDetails(ctrl) {

  const viewGame = ctrl.data.puzzle.gameId ? helper.ontap(
    () => router.set(`/game/${ctrl.data.puzzle.gameId}/${ctrl.data.puzzle.color}`),
    () => window.plugins.toast.show(i18n('fromGameLink', ctrl.data.puzzle.gameId), 'short', 'bottom')
  ) : () => {};
  return (
    <section className="trainingSection">
      <h3 className="puzzle withIcon button" data-icon="-" oncreate={viewGame}>
        {i18n('puzzleId', ctrl.data.puzzle.id)}
      </h3>
      <div>
        <p>{i18n('ratingX', ctrl.data.puzzle.rating)}</p>
        <p>{i18n('playedXTimes', ctrl.data.puzzle.attempts)}</p>
      </div>
    </section>
  );
}

function renderPlayerTable(ctrl) {
  return (
    <section className="trainingSection">
      <div className="yourTurn">
        {i18n(ctrl.chessground.data.turnColor === ctrl.data.puzzle.color ? 'yourTurn' : 'waiting')}
      </div>
      {renderCommentary(ctrl)}
      {renderResult(ctrl)}
    </section>
  );
}

function renderViewTable(ctrl) {
  return (
    <section className="trainingSection">
      <div />
      {renderResult(ctrl)}
    </section>
  );
}

function renderActionsBar(ctrl) {
  const vdom = [
    h('button.action_bar_button.training_action.fa.fa-ellipsis-h', {
      key: 'puzzleMenu',
      oncreate: helper.ontap(ctrl.menu.open)
    })
  ];
  return h('section#training_actions.actions_bar', vdom.concat(
    ctrl.data.mode === 'view' ?
      renderViewControls(ctrl) :
      h('button.action_bar_button.training_action[data-icon=b]', {
        key: 'giveUpPuzzle',
        oncreate: helper.ontap(ctrl.giveUp, () => window.plugins.toast.show(i18n('giveUp'), 'short', 'bottom'))
      })
  ).filter(el => el !== null));
}

function renderViewControls(ctrl) {
  const history = ctrl.data.replay.history;
  const step = ctrl.data.replay.step;
  return [
    h('button.action_bar_button.training_action[data-icon=G]', {
      key: 'continueTraining',
      oncreate: helper.ontap(ctrl.newPuzzle.bind(ctrl, true), () => window.plugins.toast.show(i18n('continueTraining'), 'short', 'bottom'))
    }),
    h('button.action_bar_button.training_action[data-icon=P]', {
      key: 'retryPuzzle',
      oncreate: helper.ontap(ctrl.retry, () => window.plugins.toast.show(i18n('retryThisPuzzle'), 'short', 'bottom'))
    }),
    h('button.action_bar_button.training_action[data-icon=A]', {
      key: 'analysePuzzle',
      oncreate: helper.ontap(ctrl.goToAnalysis, () => window.plugins.toast.show(i18n('analysis'), 'short', 'bottom'))
    }),
    h('button.action_bar_button.training_action.fa.fa-share-alt', {
      key: 'sharePuzzle',
      oncreate: helper.ontap(ctrl.share, () => window.plugins.toast.show('Share this puzzle', 'short', 'bottom'))
    }),
    h('button.action_bar_button.training_action.fa.fa-backward', {
      oncreate: helper.ontap(ctrl.jumpPrev, null, ctrl.jumpPrev),
      key: 'historyPrev',
      className: helper.classSet({
        disabled: !(step !== step - 1 && step - 1 >= 0 && step - 1 < history.length)
      })
    }),
    h('button.action_bar_button.training_action.fa.fa-forward', {
      oncreate: helper.ontap(ctrl.jumpNext, null, ctrl.jumpNext),
      key: 'historyNext',
      className: helper.classSet({
        disabled: !(step !== step + 1 && step + 1 >= 0 && step + 1 < history.length)
      })
    })
  ];
}

function renderCommentary(ctrl) {
  switch (ctrl.data.comment) {
    case 'retry':
      return h('div.puzzleComment.retry', [
        h('h3.puzzleState', h('strong', i18n('goodMove'))),
        h('span', i18n('butYouCanDoBetter'))
      ]);
    case 'great':
      return h('div.puzzleComment.great', [
        h('h3.puzzleState.withIcon[data-icon=E]', h('strong', i18n('bestMove'))),
        h('span', i18n('keepGoing'))
      ]);
    case 'fail':
      return h('div.puzzleComment.fail', [
        h('h3.puzzleState.withIcon[data-icon=k]', h('strong', i18n('puzzleFailed'))),
        ctrl.data.mode === 'try' ? h('span', i18n('butYouCanKeepTrying')) : null
      ]);
    default:
      return ctrl.data.comment;
  }
}

function renderRatingDiff(diff) {
  return h('strong.puzzleRatingDiff', diff > 0 ? '+' + diff : diff);
}

function renderWin(ctrl, attempt) {
  return h('div.puzzleComment.win', [
    h('h3.puzzleState.withIcon[data-icon=E]', [
      h('strong', i18n('victory')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ])
  ]);
}

function renderLoss(ctrl, attempt) {
  return h('div.puzzleComment.loss',
    h('h3.puzzleState.withIcon[data-icon=k]', [
      h('strong', i18n('puzzleFailed')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ])
  );
}

function renderResult(ctrl) {
  switch (ctrl.data.win) {
    case true:
      return renderWin(ctrl, null);
    case false:
      return renderLoss(ctrl, null);
    default:
      switch (ctrl.data.attempt && ctrl.data.attempt.win) {
        case true:
          return renderWin(ctrl, ctrl.data.attempt);
        case false:
          return renderLoss(ctrl, ctrl.data.attempt);
      }
  }
  return null;
}


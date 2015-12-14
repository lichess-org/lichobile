import layout from '../layout';
import i18n from '../../i18n';
import { header, connectingHeader, viewOnlyBoardContent } from '../shared/common';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import { renderBoard } from '../round/view/roundView';
import menu, { renderUserInfos, renderSigninBox } from './menu';
import m from 'mithril';

export default function view(ctrl) {
  return layout.board(
    !ctrl.data || ctrl.vm.loading ?
      connectingHeader.bind(undefined, i18n('training')) :
      header.bind(undefined, i18n('training')),
    renderContent.bind(undefined, ctrl),
    () => [
      renderPromotion(ctrl),
      menu.view(ctrl.menu)
    ]
  );

}

function renderContent(ctrl) {
  if (!ctrl.data) return viewOnlyBoardContent();

  if (helper.isPortrait())
    return [
      ctrl.data.mode === 'view' ? renderProblemDetails(ctrl) : renderExplanation(ctrl),
      renderBoard(ctrl),
      ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayerTable(ctrl),
      renderActionsBar(ctrl)
    ];
  else
    return [
      renderBoard(ctrl),
      <section key="table" className="table">
        <section className="trainingTable">
          {ctrl.data.mode === 'view' ? renderProblemDetails(ctrl) : renderExplanation(ctrl)}
          <div className="trainingUserInfos landscape">
            { ctrl.data.user ? renderUserInfos(ctrl) : renderSigninBox()}
          </div>
          {ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayerTable(ctrl)}
        </section>
        {renderActionsBar(ctrl)}
      </section>
    ];
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

  const viewGame = ctrl.data.puzzle.gameId ? helper.ontouch(
    () => m.route(`/game/${ctrl.data.puzzle.gameId}/${ctrl.data.puzzle.color}`),
    () => window.plugins.toast.show(i18n('fromGameLink', ctrl.data.puzzle.gameId), 'short', 'bottom')
  ) : () => {};
  return (
    <section className="trainingSection">
      <h3 className="puzzle withIcon button" data-icon="-" config={viewGame}>
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
    m('button.action_bar_button.training_action.fa.fa-ellipsis-h', {
      key: 'puzzleMenu',
      config: helper.ontouch(ctrl.menu.open)
    })
  ];
  return m('section.#training_actions.actions_bar', vdom.concat(
    ctrl.data.mode === 'view' ?
      renderViewControls(ctrl) :
      m('button.action_bar_button.training_action[data-icon=b]', {
        key: 'giveUpPuzzle',
        config: helper.ontouch(ctrl.giveUp, () => window.plugins.toast.show(i18n('giveUp'), 'short', 'bottom'))
      })
  ).filter(el => el !== null));
}

function renderViewControls(ctrl) {
  var history = ctrl.data.replay.history;
  var step = ctrl.data.replay.step;
  return [
    m('button.action_bar_button.training_action[data-icon=G]', {
      key: 'continueTraining',
      config: helper.ontouch(ctrl.newPuzzle.bind(ctrl, true), () => window.plugins.toast.show(i18n('continueTraining'), 'short', 'bottom'))
    }),
    m('button.action_bar_button.training_action[data-icon=P]', {
      key: 'retryPuzzle',
      config: helper.ontouch(ctrl.retry, () => window.plugins.toast.show(i18n('retryThisPuzzle'), 'short', 'bottom'))
    }),
    m('button.action_bar_button.training_action.fa.fa-share-alt', {
      key: 'sharePuzzle',
      config: helper.ontouch(ctrl.share, () => window.plugins.toast.show('Share this puzzle', 'short', 'bottom'))
    }),
    m('button.action_bar_button.training_action[data-icon=I]', {
      config: helper.ontouch(ctrl.jumpPrev, ctrl.jumpFirst),
      key: 'historyPrev',
      className: helper.classSet({
        disabled: !(step !== step - 1 && step - 1 >= 0 && step - 1 < history.length)
      })
    }),
    m('button.action_bar_button.training_action[data-icon=H]', {
      config: helper.ontouch(ctrl.jumpNext, ctrl.jumpLast),
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
      return m('div.puzzleComment.retry', [
        m('h3.puzzleState', m('strong', i18n('goodMove'))),
        m('span', i18n('butYouCanDoBetter'))
      ]);
    case 'great':
      return m('div.puzzleComment.great', [
        m('h3.puzzleState.withIcon[data-icon=E]', m('strong', i18n('bestMove'))),
        m('span', i18n('keepGoing'))
      ]);
    case 'fail':
      return m('div.puzzleComment.fail', [
        m('h3.puzzleState.withIcon[data-icon=k]', m('strong', i18n('puzzleFailed'))),
        ctrl.data.mode === 'try' ? m('span', i18n('butYouCanKeepTrying')) : null
      ]);
    default:
      return ctrl.data.comment;
  }
}

function renderRatingDiff(diff) {
  return m('strong.puzzleRatingDiff', diff > 0 ? '+' + diff : diff);
}

function renderWin(ctrl, attempt) {
  return m('div.puzzleComment.win', [
    m('h3.puzzleState.withIcon[data-icon=E]', [
      m('strong', i18n('victory')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ]),
    attempt ? m('span.nbSeconds', i18n('puzzleSolvedInXSeconds', attempt.seconds)) : null
  ]);
}

function renderLoss(ctrl, attempt) {
  return m('div.puzzleComment.loss',
    m('h3.puzzleState.withIcon[data-icon=k]', [
      m('strong', i18n('puzzleFailed')),
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
}


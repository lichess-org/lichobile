import layout from '../layout';
import { header } from '../shared/common';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import ViewOnlyBoard from '../shared/ViewOnlyBoard';
import m from 'mithril';

export default function view(ctrl) {
  return layout.board(
    header.bind(undefined, i18n('training')),
    renderContent.bind(undefined, ctrl),
    () => [renderPromotion(ctrl)]
  );

}

function renderContent(ctrl) {
  const board = ctrl.data ?
    renderBoard(ctrl) :
    m.component(ViewOnlyBoard, { fen: '' });

  if (helper.isPortrait())
    return (
      <div className = "content round">
        {board}
      </div>
    );
  else
    return (
      <div className="content round">
        {board}
        <section key="table" className="table">
        </section>
      </div>
    );
}

function renderCommentary(ctrl) {
  switch (ctrl.data.comment) {
    case 'retry':
      return m('div.comment.retry', [
        m('h3', m('strong', i18n('goodMove'))),
        m('span', i18n('butYouCanDoBetter'))
      ]);
    case 'great':
      return m('div.comment.great', [
        m('h3.text[data-icon=E]', m('strong', i18n('bestMove'))),
        m('span', i18n('keepGoing'))
      ]);
    case 'fail':
      return m('div.comment.fail', [
        m('h3.text[data-icon=k]', m('strong', i18n('puzzleFailed'))),
        ctrl.data.mode === 'try' ? m('span', i18n('butYouCanKeepTrying')) : null
      ]);
    default:
      return ctrl.data.comment;
  }
}

function renderRatingDiff(diff) {
  return m('strong.rating', diff > 0 ? '+' + diff : diff);
}

function renderWin(ctrl, attempt) {
  return m('div.comment.win', [
    m('h3.text[data-icon=E]', [
      m('strong', i18n('victory')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ]),
    attempt ? m('span', i18n('puzzleSolvedInXSeconds', attempt.seconds)) : null
  ]);
}

function renderLoss(ctrl, attempt) {
  return m('div.comment.loss',
    m('h3.text[data-icon=k]', [
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

function renderPlayTable(ctrl) {
  return m('div.table_wrap',
    m('div.table',
      m('div.table_inner', [
        m('div.current_player',
          m('div.player.' + ctrl.chessground.data.turnColor, [
            m('div.no-square', m('div.cg-piece.king.' + ctrl.chessground.data.turnColor)),
            m('p', i18n(ctrl.chessground.data.turnColor === ctrl.data.puzzle.color ? 'yourTurn' : 'waiting'))
          ])
        ),
        m('p.findit', i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')),
        m('div.control',
          m('a.button.giveup', {
            config: function(el) {
              setTimeout(function() {
                el.classList.add('revealed');
              }, 1000);
            },
            onclick: function() {
              console.log('I give up!');
            }
          }, i18n('giveUp'))
        )
      ])
    )
  );
}

function renderViewTable(ctrl) {
  return [
    m('div.continue_wrap', [
      ctrl.data.win === null ? m('button.continue.button.text[data-icon=G]', {
      }, i18n('continueTraining')) : m('a.continue.button.text[data-icon=G]', {
      }, i18n('continueTraining')), !(ctrl.data.win === null ? ctrl.data.attempt.win : ctrl.data.win) ? m('a.retry.text[data-icon=P]', {
      }, i18n('retryThisPuzzle')) : null
    ])
  ];
}

function renderViewControls(ctrl, fen) {
  var history = ctrl.data.replay.history;
  var step = ctrl.data.replay.step;
  return m('div.game_control', [
    ctrl.data.puzzle.gameId ? m('a.button.hint--bottom', {
      'data-hint': i18n('fromGameLink', ctrl.data.puzzle.gameId),
      href: ctrl.router.Round.watcher(ctrl.data.puzzle.gameId, ctrl.data.puzzle.color).url + '#' + ctrl.data.puzzle.initialPly
    }, m('span[data-icon=v]')) : null,
    m('a.button.hint--bottom', {
      'data-hint': i18n('boardEditor'),
      href: ctrl.router.Editor.load(fen).url
    }, m('span[data-icon=m]')),
    m('div#GameButtons.hint--bottom', {
      'data-hint': 'Review puzzle solution'
    }, [
      ['first', 'W', 0],
      ['prev', 'Y', step - 1],
      ['next', 'X', step + 1],
      ['last', 'V', history.length - 1]
    ].map(function(b) {
      var enabled = step !== b[2] && b[2] >= 0 && b[2] < history.length;
      return m('a.button.' + b[0] + (enabled ? '' : '.disabled'), {
        'data-icon': b[1],
        onclick: enabled ? ctrl.jump.bind(ctrl, b[2]) : null
      });
    }))
  ]);
}

function renderFooter(ctrl) {
  if (ctrl.data.mode !== 'view') return null;
  var fen = ctrl.data.replay.history[ctrl.data.replay.step].fen;
  return m('div', [
    renderViewControls(ctrl, fen)
  ]);
}

function renderHistory(ctrl) {
  return m('div.history', {
    // config: function(el, isUpdate, context) {
    //   var hash = ctrl.data.user.history.join('');
    //   if (hash == context.hash) return;
    //   context.hash = hash;
    //   $.ajax({
    //     url: '/training/history',
    //     cache: false,
    //     success: function(html) {
    //       el.innerHTML = html;
    //     }
    //   });
    // }
  });
}

import m from 'mithril';
import i18n from '../../i18n';
import treePath from './path';
import pgnExport from './pgnExport';
import cevalView from './ceval/cevalView';
import gameApi from '../../lichess/game';
import control from './control';
import { empty, defined, renderEval, isSynthetic } from './util';
import gameStatusApi from '../../lichess/status';
import helper from '../helper';
import layout from '../layout';
import { view as renderPromotion } from './promotion';
import { header } from '../shared/common';
import { renderBoard } from '../round/view/roundView';
import { partialf } from '../../utils';

export default function analyseView(ctrl) {

  function content() {
    return [
      m('div', {
        className: helper.classSet({
          top: true,
          ceval_displayed: ctrl.ceval.allowed(),
          gauge_displayed: ctrl.showEvalGauge()
        })
      }, [
        m('div.lichess_game', {
          config: function(el, isUpdate) {
            if (isUpdate) return;
          }
        }, [
          renderBoard(ctrl.data.game.variant.key, ctrl.chessground, helper.isPortrait()),
          m('div.lichess_ground', [
            [
              cevalView.renderCeval(ctrl),
              m('div.replay', renderAnalyse(ctrl))
            ],
            buttons(ctrl)
          ])
        ])
      ]),
      m('div.underboard', [
        m('div.center', inputs(ctrl)),
        m('div.right')
      ]),
      isSynthetic(ctrl.data) ? null : m('div.analeft', [
        gameApi.playable(ctrl.data) ? m('div.back_to_game',
          m('button', {
            className: 'button text',
            config: helper.ontouch(() => {
              m.route('/game' + ctrl.data.game.url.round);
            }),
            'data-icon': 'i'
          }, ctrl.trans('backToGame'))
        ) : null
      ])
    ];
  }

  return layout.board(
    header.bind(undefined, i18n('analyse')),
    content
  );
}

function renderEvalTag(e) {
  return {
    tag: 'eval',
    children: [e]
  };
}

const emptyMove = m('move.empty', '...');

function renderMove(ctrl, move, path) {
  if (!move) return emptyMove;
  var pathStr = treePath.write(path);
  var evaluation = path[1] ? {} : (move.oEval || move.ceval || {});
  var attrs = path[1] ? {
    'data-path': pathStr
  } : {};
  var classes = pathStr === ctrl.vm.pathStr ? ['active'] : [];
  if (pathStr === ctrl.vm.initialPathStr) classes.push('current');
  if (classes.length) attrs.class = classes.join(' ');
  return {
    tag: 'move',
    attrs: attrs,
    children: [
      defined(evaluation.cp) ? renderEvalTag(renderEval(evaluation.cp)) : (
        defined(evaluation.mate) ? renderEvalTag('#' + evaluation.mate) : null
      ),
      move.san[0] === 'P' ? move.san.slice(1) : move.san
    ]
  };
}

function plyToTurn(ply) {
  return Math.floor((ply - 1) / 2) + 1;
}

function renderVariation(ctrl, variation, path, klass) {
  var showMenu = ctrl.vm.variationMenu && ctrl.vm.variationMenu === treePath.write(path.slice(0, 1));
  return m('div', {
    className: klass + ' ' + helper.classSet({
      variation: true,
      menu: showMenu
    })
  }, [
    m('span', {
      className: 'menu',
      'data-icon': showMenu ? 'L' : '',
      config: helper.ontouch(partialf(ctrl.toggleVariationMenu, path))
    }),
    showMenu ? (function() {
      var promotable = isSynthetic(ctrl.data) ||
        !ctrl.analyse.getStepAtPly(path[0].ply).fixed;
      return [
        m('a', {
          className: 'delete text',
          'data-icon': 'q',
          config: helper.ontouch(partialf(ctrl.deleteVariation, path))
        }, 'Delete variation'),
        promotable ? m('a', {
          className: 'promote text',
          'data-icon': 'E',
          config: helper.ontouch(partialf(ctrl.promoteVariation, path))
        }, 'Promote to main line') : null
      ];
    })() :
    renderVariationContent(ctrl, variation, path)
  ]);
}

function renderVariationNested(ctrl, variation, path) {
  return m('span.variation', [
    '(',
    renderVariationContent(ctrl, variation, path),
    ')'
  ]);
}

function renderVariationContent(ctrl, variation, path) {
  var turns = [];
  if (variation[0].ply % 2 === 0) {
    variation = variation.slice(0);
    var move = variation.shift();
    turns.push({
      turn: plyToTurn(move.ply),
      black: move
    });
  }
  var visiting = treePath.contains(path, ctrl.vm.path);
  var maxPlies = Math.min(visiting ? 999 : (path[2] ? 2 : 4), variation.length);
  for (var i = 0; i < maxPlies; i += 2) turns.push({
    turn: plyToTurn(variation[i].ply),
    white: variation[i],
    black: variation[i + 1]
  });
  return turns.map(function(turn) {
    return renderVariationTurn(ctrl, turn, path);
  });
}

function renderVariationMeta(ctrl, move, path) {
  if (!move || empty(move.variations)) return null;
  return move.variations.map(function(variation, i) {
    return renderVariationNested(ctrl, variation, treePath.withVariation(path, i + 1));
  });
}

function renderVariationTurn(ctrl, turn, path) {
  var wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  var wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  var wMeta = renderVariationMeta(ctrl, turn.white, wPath);
  var bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  var bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
  var bMeta = renderVariationMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) return [
      renderIndex(turn.turn + '.'),
      wMove,
      wMeta,
      bMove ? [
        bMove,
        bMeta
      ] : null
    ];
    return [renderIndex(turn.turn + '.'), wMove, (bMove ? [' ', bMove, bMeta] : '')];
  }
  return [renderIndex(turn.turn + '...'), bMove, bMeta];
}

function renderOpening(ctrl, opening) {
  return m('div.comment.opening', opening.code + ': ' + opening.name);
}

function renderMeta(ctrl, move, path) {
  if (!ctrl.vm.comments) return null;
  var opening = ctrl.data.game.opening;
  opening = (move && opening && opening.size === move.ply) ? renderOpening(ctrl, opening) : null;
  if (!move || (!opening && empty(move.comments) && empty(move.variations))) return null;
  var children = [];
  if (opening) children.push(opening);
  var colorClass = move.ply % 2 === 0 ? 'black ' : 'white ';
  var commentClass;
  if (!empty(move.comments)) move.comments.forEach(function(comment) {
    if (comment.indexOf('Inaccuracy.') === 0) commentClass = 'inaccuracy';
    else if (comment.indexOf('Mistake.') === 0) commentClass = 'mistake';
    else if (comment.indexOf('Blunder.') === 0) commentClass = 'blunder';
    children.push(m('div', {
      className: 'comment ' + colorClass + commentClass
    }, comment));
  });
  if (!empty(move.variations)) move.variations.forEach(function(variation, i) {
    if (empty(variation)) return null;
    children.push(renderVariation(
      ctrl,
      variation,
      treePath.withVariation(path, i + 1),
      i === 0 ? colorClass + commentClass : null
    ));
  });
  return m('div', {
    className: 'meta'
  }, children);
}

function renderIndex(txt) {
  return {
    tag: 'index',
    children: [txt]
  };
}

function renderTurnEl(children) {
  return {
    tag: 'turn',
    children: children
  };
}

function renderTurn(ctrl, turn, path) {
  var index = renderIndex(turn.turn);
  var wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  var wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  var wMeta = renderMeta(ctrl, turn.white, wPath);
  var bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  var bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
  var bMeta = renderMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) return [
      renderTurnEl([index, wMove, emptyMove]),
      wMeta,
      bMove ? [
        renderTurnEl([index, emptyMove, bMove]),
        bMeta
      ] : null
    ];
    return [
      renderTurnEl([index, wMove, bMove]),
      bMeta
    ];
  }
  return [
    renderTurnEl([index, emptyMove, bMove]),
    bMeta
  ];
}

function renderTree(ctrl, tree) {
  var turns = [];
  var initPly = ctrl.analyse.firstPly();
  if (initPly % 2 === 0)
    for (var i = 1, nb = tree.length; i < nb; i += 2) turns.push({
      turn: Math.floor((initPly + i) / 2) + 1,
      white: tree[i],
      black: tree[i + 1]
    });
  else {
    turns.push({
      turn: Math.floor(initPly / 2) + 1,
      white: null,
      black: tree[1]
    });
    for (var j = 2, jnb = tree.length; j < jnb; j += 2) turns.push({
      turn: Math.floor((initPly + j) / 2) + 1,
      white: tree[j],
      black: tree[j + 1]
    });
  }

  var path = treePath.default();
  var tags = [];
  for (var k = 0, len = turns.length; k < len; k++)
    tags.push(renderTurn(ctrl, turns[k], path));

  return tags;
}

function renderAnalyse(ctrl) {
  var result;
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
  var tree = renderTree(ctrl, ctrl.analyse.tree);
  if (result) {
    tree.push(m('div.result', result));
    var winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
    tree.push(m('div.status', [
      gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key),
      winner ? ', ' + ctrl.trans(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') : null
    ]));
  }
  return m('div.analyse', { }, tree);
}

function inputs(ctrl) {
  if (!ctrl.data.userAnalysis) return null;
  return m('div.copyables', [
    m('label.name', 'FEN'),
    m('input.copyable[readonly][spellCheck=false]', {
      value: ctrl.vm.step.fen
    }),
    m('div.pgn', [
      m('label.name', 'PGN'),
      m('textarea.copyable[readonly][spellCheck=false]', {
        value: pgnExport.renderStepsTxt(ctrl.analyse.getSteps(ctrl.vm.path))
      })
    ])
  ]);
}

function buttons(ctrl) {
  return [
    m('div.game_control', [
      m('div.jumps.hint--bottom', [
        ['first', 'W', control.first ],
        ['prev', 'Y', control.prev],
        ['next', 'X', control.next],
        ['last', 'V', control.last]
      ].map(function(b) {
        return {
          tag: 'a',
          attrs: {
            className: 'button ' + b[0] + ' ' + helper.classSet({
              disabled: ctrl.broken,
              glowed: ctrl.vm.late && b[0] === 'last'
            }),
            'data-icon': b[1],
            config: helper.ontouch(partialf(b[2], ctrl))
          }
        };
      }))
    ])
  ];
}


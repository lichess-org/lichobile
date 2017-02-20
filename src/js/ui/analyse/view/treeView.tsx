import * as Vnode from 'mithril/render/vnode';
import * as helper from '../../helper';
import treePath from '../path';
import { empty, renderEval } from '../util';

import { AnalyseCtrlInterface, AnalysisStep, AnalysisTree, Glyph, Path } from '../interfaces';

interface Turn {
  turn: number
  white?: AnalysisStep
  black?: AnalysisStep
}

export function renderTree(ctrl: AnalyseCtrlInterface, tree: AnalysisTree) {
  let turns: Mithril.Children = [];
  const initPly = ctrl.analyse.firstPly();
  const path = treePath.default()

  if (initPly % 2 === 0) {
    for (let i = 1, nb = tree.length; i < nb; i += 2) turns = turns.concat(
      renderTurn(
        ctrl,
        {
          turn: Math.floor((initPly + i) / 2) + 1,
          white: tree[i],
          black: tree[i + 1]
        },
        path
      )
    )
  }
  else {
    turns = turns.concat(renderTurn(ctrl, {
      turn: Math.floor(initPly / 2) + 1,
      white: null,
      black: tree[1]
    }, path))
    for (let j = 2, jnb = tree.length; j < jnb; j += 2) turns = turns.concat(
      renderTurn(
        ctrl,
        {
          turn: Math.floor((initPly + j) / 2) + 1,
          white: tree[j],
          black: tree[j + 1]
        },
        path
      )
    )
  }

  return turns
}

function renderIndex(txt: string) {
  return Vnode('index', undefined, undefined, undefined, txt, undefined)
}

function renderEvalTag(e: string) {
  return Vnode('eval', undefined, undefined, undefined, e, undefined)
}

function renderGlyph(glyph: Glyph) {
  return Vnode('glyph', undefined, undefined, undefined, glyph.symbol, undefined)
}

const threeDotsMove = Vnode('move', undefined, undefined, undefined, '...', undefined)
const emptyMove = Vnode('move', undefined, undefined, undefined, '', undefined)

function renderMove(currentPath: string, move: AnalysisStep, path: Path, pathStr: string) {
  if (!move) return threeDotsMove;
  const evaluation = path[1] ? null : (move.rEval || move.ceval);
  const judgment = move.rEval && move.rEval.judgment;
  const className = [
    pathStr === currentPath ? 'current' : ''
  ].join(' ');

  return (
    <move data-path={pathStr} className={className}>
      {move.san[0] === 'P' ? move.san.slice(1) : move.san}
      {judgment && judgment.glyph ? renderGlyph(judgment.glyph) : null}
      {evaluation && evaluation.cp ? renderEvalTag(renderEval(evaluation.cp)) : (
        evaluation && evaluation.mate ? renderEvalTag('#' + evaluation.mate) : null
      )}
    </move>
  )
}

function plyToTurn(ply: number) {
  return Math.floor((ply - 1) / 2) + 1;
}

function renderVariation(ctrl: AnalyseCtrlInterface, variation: AnalysisTree, path: Path) {
  const visiting = treePath.contains(path, ctrl.vm.path);
  return (
    <lines>
      <span className="menuIcon fa fa-ellipsis-v" oncreate={helper.ontapY(() => ctrl.toggleVariationMenu(path))}></span>
      <line className={visiting ? ' visiting' : ''}>
        {renderVariationContent(ctrl, variation, path)}
      </line>
    </lines>
  );
}

function renderVariationNested(ctrl: AnalyseCtrlInterface, variation: AnalysisTree, path: Path): Mithril.DOMNode {
  return (
    <span className="nested">
      (
      {renderVariationContent(ctrl, variation, path)}
      )
    </span>
  );
}

function renderVariationContent(ctrl: AnalyseCtrlInterface, variation: AnalysisTree, path: Path) {
  const turns: Turn[] = [];
  if (variation[0].ply % 2 === 0) {
    variation = variation.slice(0);
    const move = variation.shift();
    turns.push({
      turn: plyToTurn(move.ply),
      black: move
    });
  }
  const visiting = treePath.contains(path, ctrl.vm.path);
  const maxPlies = Math.min(visiting ? 999 : (path[2] ? 2 : 4), variation.length);
  for (let i = 0; i < maxPlies; i += 2) turns.push({
    turn: plyToTurn(variation[i].ply),
    white: variation[i],
    black: variation[i + 1]
  });
  return turns.map(turn => renderVariationTurn(ctrl, turn, path));
}

function renderVariationMeta(ctrl: AnalyseCtrlInterface, move: AnalysisStep, path: Path) {
  if (!move || empty(move.variations)) return null;
  return move.variations.map((variation: AnalysisTree, i: number) => {
    return renderVariationNested(ctrl, variation, treePath.withVariation(path, i + 1));
  });
}

function renderVariationTurn(ctrl: AnalyseCtrlInterface, turn: Turn, path: Path) {
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const wMove = wPath ? renderMove(ctrl.vm.pathStr, turn.white, wPath, treePath.write(wPath)) : null;
  const wMeta = renderVariationMeta(ctrl, turn.white, wPath);
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const bMove = bPath ? renderMove(ctrl.vm.pathStr, turn.black, bPath, treePath.write(bPath)) : null;
  const bMeta = renderVariationMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) return [
        renderIndex(turn.turn + '.'),
        wMove,
        wMeta,
        bMove ? bMove : null,
        bMove ? bMeta : null
    ];
    return [
        renderIndex(turn.turn + '.'),
        wMove,
        bMeta ? ' ' : null,
        bMove ? bMove : null,
        bMove ? bMeta : null
    ];
  }
  return [
      renderIndex(turn.turn + '...'),
      bMove,
      bMeta
  ];
}

function renderMeta(ctrl: AnalyseCtrlInterface, step: AnalysisStep, path: Path) {
  const judgment = step && step.rEval && step.rEval.judgment;

  if (!step || (empty(step.variations) && (empty(judgment) || !ctrl.vm.showComments)))
    return null

  const children: Mithril.Children = [];
  const colorClass = step.ply % 2 === 0 ? 'black ' : 'white ';
  if (ctrl.vm.showComments && !empty(judgment)) {
    children.push(renderComment(judgment.comment, colorClass, judgment.name));
  }
  if (!empty(step.variations)) {
    for (let i = 0, len = step.variations.length; i < len; i++) {
      const variation = step.variations[i];
      if (empty(variation)) return null;
      children.push(renderVariation(
        ctrl,
        variation,
        treePath.withVariation(path, i + 1)
      ));
    }
  }
  const key = 'meta:' + treePath.write(path) +
    (ctrl.vm.showComments && judgment ? judgment.name : '')
  return (
    <interrupt key={key}>{children}</interrupt>
  );
}

function truncateComment(text: string) {
  if (text.length <= 140) return text;
  return text.slice(0, 125) + ' [...]';
}

function renderComment(comment: string, colorClass: string, commentClass: string) {
  return <div className={'comment ' + colorClass + commentClass}>{truncateComment(comment)}</div>
}

function renderTurnEl(turn: Turn, pathStr: string, wPath?: Path, bPath?: Path) {
  let key = 'turn:' + turn.turn
  let wMove: Mithril.DOMNode, bMove: Mithril.DOMNode
  if (wPath !== undefined) {
    const wPathStr = wPath && treePath.write(wPath)
    key += ':' + wPathStr + (turn.white && turn.white.san)
    wMove = wPath ? renderMove(pathStr, turn.white, wPath, wPathStr) : emptyMove
  } else {
    key += ':empty'
    wMove = threeDotsMove
  }
  if (bPath !== undefined) {
    const bPathStr = bPath && treePath.write(bPath)
    key += ':' + bPathStr + (turn.black && turn.black.san)
    bMove = bPath ? renderMove(pathStr, turn.black, bPath, bPathStr) : emptyMove
  } else {
    key += ':empty'
    bMove = threeDotsMove
  }
  return Vnode(
    'turn',
    key,
    undefined,
    [renderIndex(String(turn.turn)), wMove, bMove],
    undefined,
    undefined
  )
}

function renderTurn(ctrl: AnalyseCtrlInterface, turn: Turn, path: Path): Mithril.Children {
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const wMeta = renderMeta(ctrl, turn.white, wPath);
  const bMeta = renderMeta(ctrl, turn.black, bPath);
  if (wPath) {
    if (wMeta) {
      const temp = [ renderTurnEl(turn, ctrl.vm.pathStr, wPath), wMeta ]
      if (bPath) {
        if (bMeta) {
          return temp.concat([ renderTurnEl(turn, ctrl.vm.pathStr, undefined, bPath), bMeta ])
        } else {
          return temp.concat([ renderTurnEl(turn, ctrl.vm.pathStr, undefined, bPath) ])
        }
      } else {
        return temp
      }
    } else if (bMeta) {
      return [ renderTurnEl(turn, ctrl.vm.pathStr, wPath, bPath), bMeta]
    } else {
      return [renderTurnEl(turn, ctrl.vm.pathStr, wPath, bPath)]
    }
  }
  else if (bMeta) {
    return [renderTurnEl(turn, ctrl.vm.pathStr, undefined, bPath), bMeta]
  } else {
    return [renderTurnEl(turn, ctrl.vm.pathStr, undefined, bPath)]
  }
}

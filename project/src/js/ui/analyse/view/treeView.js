import m from 'mithril';
import helper from '../../helper';
import treePath from '../path';
import { empty, defined, renderEval, isSynthetic } from '../util';

export function renderTree(ctrl, tree) {
  const turns = [];
  const initPly = ctrl.analyse.firstPly();
  if (initPly % 2 === 0) {
    for (var i = 1, nb = tree.length; i < nb; i += 2) turns.push({
      turn: Math.floor((initPly + i) / 2) + 1,
      white: tree[i],
      black: tree[i + 1]
    });
  }
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

  const path = treePath.default();
  var tags = [];
  for (var k = 0, len = turns.length; k < len; k++) {
    tags = tags.concat(renderTurn(ctrl, turns[k], path));
  }

  return tags;
}

function renderEvalTag(e) {
  return {
    tag: 'eval',
    children: e
  };
}

function renderGlyph(glyph) {
  return <glyph>{glyph.symbol}</glyph>;
}

const emptyMove = <move className="emptyMove">...</move>;

function renderMove(ctrl, move, path) {
  if (!move) return emptyMove;
  const pathStr = treePath.write(path);
  const evaluation = path[1] ? {} : (move.rEval || move.ceval || {});
  const judgment = move.rEval && move.rEval.judgment;
  const className = [
    pathStr === ctrl.vm.pathStr ? 'current' : ''
  ].join(' ');

  const jump = helper.ontouchY(() => ctrl.jump(treePath.read(pathStr)));

  return (
    <move className={className} config={jump}>
      {move.san[0] === 'P' ? move.san.slice(1) : move.san}
      {defined(evaluation.cp) ? renderEvalTag(renderEval(evaluation.cp)) : (
        defined(evaluation.mate) ? renderEvalTag('#' + evaluation.mate) : null
      )}
      {judgment && judgment.glyph ? renderGlyph(judgment.glyph) : null}
    </move>
  );
}

function plyToTurn(ply) {
  return Math.floor((ply - 1) / 2) + 1;
}

function renderVariationMenu(ctrl, path) {
  const showing = ctrl.vm.variationMenu && ctrl.vm.variationMenu === treePath.write(path.slice(0, 1));

  if (!showing) return null;

  const promotable = isSynthetic(ctrl.data) ||
    !ctrl.analyse.getStepAtPly(path[0].ply).fixed;

  const content = m('div.variationMenu', [
    m('button', {
      className: 'withIcon',
      'data-icon': 'q',
      config: helper.ontouch(ctrl.deleteVariation.bind(undefined, path))
    }, 'Delete variation'),
    promotable ? m('button', {
      className: 'withIcon',
      'data-icon': 'E',
      config: helper.ontouch(ctrl.promoteVariation.bind(undefined, path))
    }, 'Promote to main line') : null
  ]);

  return (
    <div className="overlay_popup_wrapper variationMenuPopup">
      <div className="popup_overlay_close"
        config={helper.ontouch(helper.fadesOut(ctrl.toggleVariationMenu, '.overlay_popup_wrapper'))} />
      <div className="overlay_popup">
        {content}
      </div>
    </div>
  );
}

function renderVariation(ctrl, variation, path, klass) {
  const visiting = treePath.contains(path, ctrl.vm.path);
  return (
    <div className="variationWrapper">
      <span className="menuIcon fa fa-ellipsis-v" config={helper.ontouchY(ctrl.toggleVariationMenu.bind(undefined, path))}></span>
      <div className={klass + ' variation' + (visiting ? ' visiting' : '')}>
        {renderVariationContent(ctrl, variation, path)}
        {renderVariationMenu(ctrl, path)}
      </div>
    </div>
  );
}

function renderVariationNested(ctrl, variation, path) {
  return (
    <span className="variation nested">
      (
      {renderVariationContent(ctrl, variation, path)}
      )
    </span>
  );
}

function renderVariationContent(ctrl, variation, path) {
  const turns = [];
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
  for (var i = 0; i < maxPlies; i += 2) turns.push({
    turn: plyToTurn(variation[i].ply),
    white: variation[i],
    black: variation[i + 1]
  });
  return turns.map(turn => renderVariationTurn(ctrl, turn, path));
}

function renderVariationMeta(ctrl, move, path) {
  if (!move || empty(move.variations)) return null;
  return move.variations.map(function(variation, i) {
    return renderVariationNested(ctrl, variation, treePath.withVariation(path, i + 1));
  });
}

function renderVariationTurn(ctrl, turn, path) {
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  const wMeta = renderVariationMeta(ctrl, turn.white, wPath);
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
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

function renderCommentOpening(opening) {
  return (
    <div className="comment opening">
      {truncateComment(opening.eco + ' ' + opening.name)}
    </div>
  );
}

function renderMeta(ctrl, step, path) {
  const judgment = step && step.rEval && step.rEval.judgment;
  const opening = ctrl.data.game.opening;
  const moveOpening = (step && opening && opening.ply === step.ply) ? renderCommentOpening(opening) : null;

  if (!step || (!moveOpening && empty(step.variations) && (empty(judgment) || !ctrl.vm.showComments))) return null;

  const children = [];
  if (moveOpening) {
    children.push(moveOpening);
  }
  const colorClass = step.ply % 2 === 0 ? 'black ' : 'white ';
  if (ctrl.vm.showComments && !empty(judgment)) {
    children.push(renderComment(judgment.comment, colorClass, judgment.name));
  }
  if (!empty(step.variations)) {
    for (var i = 0, len = step.variations.length; i < len; i++) {
      const variation = step.variations[i];
      if (empty(variation)) return null;
      children.push(renderVariation(
        ctrl,
        variation,
        treePath.withVariation(path, i + 1),
        i === 0 ? colorClass : null
      ));
    }
  }
  return (
    <div key={step.ply + ':meta'} className="meta">{children}</div>
  );
}

function truncateComment(text) {
  if (text.length <= 140) return text;
  return text.slice(0, 125) + ' [...]';
}

function renderComment(comment, colorClass, commentClass) {
  return comment && (
    <div className={'comment ' + colorClass + commentClass}>
      {truncateComment(comment)}
    </div>
  );
}

function turnKey(turn, meta) {
  const key = turn.turn.toString() + ':' + (meta ? meta : '');
  return key;
}

function renderIndex(txt) {
  return {
    tag: 'index',
    children: [txt]
  };
}

function renderTurnEl(children, key) {
  return {
    tag: 'turn',
    attrs: { key },
    children: children
  };
}

function renderTurn(ctrl, turn, path) {
  const index = renderIndex(turn.turn);
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  const wMeta = renderMeta(ctrl, turn.white, wPath);
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
  const bMeta = renderMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) {
      let temp = [
        renderTurnEl([index, wMove, emptyMove], turnKey(turn, 'emptyBlack')),
        wMeta
      ];
      if (bMove) {
        if (bMeta) {
          temp = temp.concat([
            renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAfterWhiteMetaAndBlackMeta')),
            bMeta
          ]);
        } else {
          temp.push(
            renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAfterWhiteMeta'))
          );
        }
      }
      return temp;
    } else if (bMeta) {
      return [
        renderTurnEl([index, wMove, bMove], turnKey(turn, 'andBlackMeta')),
        bMeta
      ];
    } else {
      return renderTurnEl([index, wMove, bMove], turnKey(turn));
    }
  }
  else if (bMeta) {
    return [
      renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAndBlackMeta')),
      bMeta
    ];
  } else {
    return renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhite'));
  }
}


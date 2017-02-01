import drag from './drag';
import util from './util';
import * as Vnode from 'mithril/render/vnode';

export default function renderBoard(ctrl) {
  return Vnode(
    'div',
    undefined,
    {
      className: [
        'cg-board',
        ctrl.data.viewOnly ? 'view-only' : 'manipulable'
      ].join(' '),
      oncreate: function(vnode) {
        ctrl.data.element = vnode.dom;
        ctrl.data.render = function() {
          diffBoard(ctrl);
        };
        ctrl.data.renderRAF = function() {
          ctrl.data.batchRAF(ctrl.data.render);
        };

        if (!ctrl.data.bounds) {
          ctrl.data.bounds = vnode.dom.getBoundingClientRect();
        }

        if (!ctrl.data.viewOnly) {
          ctrl.data.render();
          bindEvents(ctrl, vnode.dom);
        }

        if (ctrl.data.coordinates) {
          makeCoords(ctrl.data.element.parentNode, !!ctrl.data.symmetricCoordinates);
          if (ctrl.data.symmetricCoordinates) {
            makeSymmCoords(ctrl.data.element.parentNode);
          }
        }
      }
    },
    ctrl.data.viewOnly ? renderContent(ctrl) : [],
    undefined,
    undefined
  );
}

function diffBoard(ctrl) {
  const d = ctrl.data;
  const asWhite = d.orientation === 'white';
  const orientationChange = d.prevOrientation && d.prevOrientation !== d.orientation;
  d.prevOrientation = d.orientation;
  const bounds = d.bounds;
  const elements = ctrl.data.element.childNodes;
  const pieces = ctrl.data.pieces;
  const anims = ctrl.data.animation.current.anims;
  const capturedPieces = ctrl.data.animation.current.capturedPieces;
  const squares = computeSquareClassesMap(ctrl);
  const samePieces = new Set();
  const sameSquares = new Set();
  const movedPieces = new Map();
  const movedSquares = new Map();
  const piecesKeys = Object.keys(pieces);
  let el, squareClassAtKey, pieceAtKey, pieceId, anim, captured, translate;
  let mvdset, mvd;

  // walk over all board dom elements, apply animations and flag moved pieces
  for (let i = 0, len = elements.length; i < len; i++) {
    el = elements[i];
    let k = el.cgKey;
    pieceAtKey = pieces[k];
    squareClassAtKey = squares.get(k);
    pieceId = el.cgRole + el.cgColor;
    anim = anims && anims[k];
    captured = capturedPieces && capturedPieces[k];
    if (el.tagName === 'PIECE') {
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && d.draggable.current.orig !== k) {
        el.classList.remove('dragging');
        el.classList.remove('magnified');
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds);
        el.style.transform = util.translate(translate);
        el.cgDragging = false;
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same color
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && el.cgColor === pieceAtKey.color) {
          translate = util.posToTranslate(util.key2pos(k), asWhite, bounds);
          translate[0] += anim[1][0];
          translate[1] += anim[1][1];
          el.style.transform = util.translate(translate);
        } else if (el.cgAnimating) {
          translate = util.posToTranslate(util.key2pos(k), asWhite, bounds);
          el.style.transform = util.translate(translate);
          el.cgAnimating = false;
        }
        // same piece: flag as same
        if (!orientationChange && el.cgColor === pieceAtKey.color && el.cgRole === pieceAtKey.role) {
          samePieces.add(k);
        }
        // different piece: flag as moved unless it is a captured piece
        else {
          if (captured && captured.role === el.cgRole && captured.color === el.cgColor) {
            el.classList.add('captured');
          } else {
            movedPieces.set(pieceId, (movedPieces.get(pieceId) || []).concat(el));
          }
        }
      }
      // no piece: flag as moved
      else {
        movedPieces.set(pieceId, (movedPieces.get(pieceId) || []).concat(el));
      }
    }
    else if (el.tagName === 'SQUARE') {
      if (!orientationChange && squareClassAtKey === el.className) {
        sameSquares.add(k);
      }
      else {
        movedSquares.set(
          el.className,
          (movedSquares.get(el.className) || []).concat(el)
        );
      }
    }
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j = 0, jlen = piecesKeys.length; j < jlen; j++) {
    let k = piecesKeys[j];
    let p = pieces[k];
    pieceId = p.role + p.color;
    anim = anims && anims[k];
    if (!samePieces.has(k)) {
      mvdset = movedPieces.get(pieceId);
      mvd = mvdset && mvdset.pop();
      // a same piece was moved
      if (mvd) {
        // apply dom changes
        mvd.cgKey = k;
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds);
        if (anim) {
          mvd.cgAnimating = true;
          translate[0] += anim[1][0];
          translate[1] += anim[1][1];
        }
        mvd.style.transform = util.translate(translate);
      }
      // no piece in moved obj: insert the new piece
      else {
        ctrl.data.element.appendChild(
          renderPieceDom(p, k, renderPiece(d, k, {
            asWhite: asWhite,
            bounds: bounds
          }), !!anim)
        );
      }
    }
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  squares.forEach((v, k) => {
    if (!sameSquares.has(k)) {
      mvdset = movedSquares.get(v);
      mvd = mvdset && mvdset.pop();
      if (mvd) {
        mvd.cgKey = k;
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds);
        mvd.style.transform = util.translate(translate);
      }
      else {
        ctrl.data.element.appendChild(
          renderSquareDom(k, renderSquare(k, v, {
            asWhite: asWhite,
            bounds: bounds
          }))
        );
      }
    }
  });

  // remove any dom el that remains in the moved sets
  const rmEl = e => d.element.removeChild(e);
  movedPieces.forEach(els => els.forEach(rmEl));
  movedSquares.forEach(els => els.forEach(rmEl));
}

function renderPieceDom(piece, key, vdom, isAnimating) {
  const p = document.createElement('piece');
  p.className = vdom.attrs.className;
  p.cgRole = piece.role;
  p.cgColor = piece.color;
  p.cgKey = key;
  if (isAnimating) p.cgAnimating = true;
  p.style.transform = vdom.attrs.style.transform;
  return p;
}

function renderSquareDom(key, vdom) {
  var s = document.createElement('square');
  s.className = vdom.attrs.className;
  s.cgKey = key;
  s.style.transform = vdom.attrs.style.transform;
  return s;
}

function pieceClass(p) {
  return p.role + ' ' + p.color;
}

function renderPiece(d, key, ctx) {
  var animation;
  if (d.animation.current.anims) {
    animation = d.animation.current.anims[key];
  }
  var p = d.pieces[key];
  var draggable = d.draggable.current;
  var dragging = draggable.orig === key && draggable.started;
  var attrs = {
    style: {},
    className: pieceClass(p)
  };
  var translate = util.posToTranslate(util.key2pos(key), ctx.asWhite, ctx.bounds);
  if (dragging) {
    translate[0] += draggable.pos[0] + draggable.dec[0];
    translate[1] += draggable.pos[1] + draggable.dec[1];
    attrs.className += ' dragging';
    if (d.draggable.magnified) {
      attrs.className += ' magnified';
    }
  } else if (animation) {
    translate[0] += animation[1][0];
    translate[1] += animation[1][1];
  }
  attrs.style.transform = util.translate(translate);
  return Vnode(
    'piece',
    'p' + key,
    attrs,
    undefined,
    undefined,
    undefined
  );
}

function addSquare(squares, key, klass) {
  squares.set(key, (squares.get(key) || '') + ' ' + klass);
}

function computeSquareClassesMap(ctrl) {
  const d = ctrl.data;
  const squares = new Map();
  if (d.lastMove && d.highlight.lastMove) d.lastMove.forEach((k) => {
    if (k) addSquare(squares, k, 'last-move');
  });
  if (d.check && d.highlight.check) addSquare(squares, d.check, 'check');
  if (d.selected) {
    addSquare(squares, d.selected, 'selected');
    const dests = d.movable.dests[d.selected];
    if (dests) dests.forEach((k) => {
      if (d.movable.showDests) addSquare(squares, k, 'move-dest' + (d.pieces[k] ? ' occupied' : ''));
    });
    const pDests = d.premovable.dests;
    if (pDests) pDests.forEach((k) => {
      if (d.movable.showDests) addSquare(squares, k, 'premove-dest' + (d.pieces[k] ? ' occupied' : ''));
    });
  }
  const premove = d.premovable.current;
  if (premove) premove.forEach((k) => {
    addSquare(squares, k, 'current-premove');
  });
  else if (d.predroppable.current.key)
    addSquare(squares, d.predroppable.current.key, 'current-premove');

  if (ctrl.vm.exploding) ctrl.vm.exploding.keys.forEach((k) => {
    addSquare(squares, k, 'exploding' + ctrl.vm.exploding.stage);
  });
  return squares;
}

function renderSquares(ctrl, ctx) {
  var squares = computeSquareClassesMap(ctrl);

  var dom = [];
  squares.forEach((v, k) => {
    dom.push(renderSquare(k, v, ctx));
  });

  return dom;
}

function renderSquare(key, classes, ctx) {
  var attrs = {
    className: classes,
    style: {}
  };
  attrs.style.transform = util.translate(util.posToTranslate(util.key2pos(key), ctx.asWhite, ctx.bounds));
  return Vnode(
    'square',
    's' + key,
    attrs,
    undefined,
    undefined,
    undefined
  );
}

function renderContent(ctrl) {
  var d = ctrl.data;
  if (!d.bounds) return null;
  var ctx = {
    asWhite: d.orientation === 'white',
    bounds: d.bounds
  };
  var children = renderSquares(ctrl, ctx);
  if (d.animation.current.capturedPieces) {
    Object.keys(d.animation.current.capturedPieces).forEach(function(k) {
      children.push(renderCaptured(d.animation.current.capturedPieces[k], ctx));
    });
  }

  var keys = ctx.asWhite ? util.allKeys : util.invKeys;
  for (var i = 0; i < 64; i++) {
    if (d.pieces[keys[i]]) children.push(renderPiece(d, keys[i], ctx));
  }

  return children;
}

function renderCaptured(cfg, ctx) {
  var attrs = {
    className: 'fading ' + pieceClass(cfg.piece),
    style: {}
  };
  attrs.style.transform = util.translate(util.posToTranslate(cfg.piece.pos, ctx.asWhite, ctx.bounds));
  return Vnode(
    'piece',
    'f' + cfg.piece.key,
    attrs,
    undefined,
    undefined,
    undefined
  );
}

function bindEvents(ctrl, el) {
  var onstart = drag.start.bind(undefined, ctrl.data);
  var onmove = drag.move.bind(undefined, ctrl.data);
  var onend = drag.end.bind(undefined, ctrl.data);
  var oncancel = drag.cancel.bind(undefined, ctrl.data);
  el.addEventListener('touchstart', onstart);
  el.addEventListener('touchmove', onmove);
  el.addEventListener('touchend', onend);
  el.addEventListener('touchcancel', oncancel);
}

function renderCoords(elems, klass) {
  const el = document.createElement('li-coords');
  el.className = klass;
  elems.forEach(function(content, i) {
    const f = document.createElement('li-coord');
    f.className = i % 2 === 0 ? 'coord-odd' : 'coord-even';
    f.textContent = content;
    el.appendChild(f);
  });
  return el;
}

function makeCoords(el, withSymm) {
  const coords = document.createDocumentFragment();
  coords.appendChild(renderCoords(util.ranks, 'ranks'));
  coords.appendChild(renderCoords(util.files, 'files' + (withSymm ? ' withSymm' : '')));
  el.appendChild(coords);
}

function makeSymmCoords(el) {
  const coords = document.createDocumentFragment();
  coords.appendChild(renderCoords(util.invRanks, 'ranks symm'));
  coords.appendChild(renderCoords(util.invFiles, 'files symm'));
  el.appendChild(coords);
}

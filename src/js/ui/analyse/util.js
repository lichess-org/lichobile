import { piotr2key } from './piotr';
import { isObject } from 'lodash/lang';

export function defined(v) {
  return v !== undefined;
}

export function readDests(lines) {
  if (!defined(lines)) return null;
  if (isObject(lines)) return lines;
  const dests = {};
  if (lines) lines.split(' ').forEach(function(line) {
    dests[piotr2key[line[0]]] = line.split('').slice(1).map(function(c) {
      return piotr2key[c];
    });
  });
  return dests;
}

export function readCheckCount(fen) {
  const counts = fen.substr(fen.length - 4);
  return {
    white: parseInt(counts[3], 10),
    black: parseInt(counts[1], 10)
  };
}

export function empty(a) {
  return !a || a.length === 0;
}

export function renderEval(e) {
  e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99);
  return (e > 0 ? '+' : '') + e;
}

export function isSynthetic(data) {
  return data.game.id === 'synthetic';
}

export function autoScroll(movelist) {
  if (!movelist) return;
  requestAnimationFrame(function() {
    const plyEl = movelist.querySelector('.current') || movelist.querySelector('turn:first-child');
    if (plyEl) {
      movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
    } else {
      movelist.scrollTop = 0
    }
  });
}

import { piotr2key } from './piotr';

const UNDEF = 'undefined';

export function defined(v) {
  return typeof v !== UNDEF;
}

export function readDests(lines) {
  if (!defined(lines)) return null;
  var dests = {};
  if (lines) lines.split(' ').forEach(function(line) {
    dests[piotr2key[line[0]]] = line.split('').slice(1).map(function(c) {
      return piotr2key[c];
    });
  });
  return dests;
}

export function readDrops(line) {
  if (typeof line === 'undefined' || line === null) return null;
  return line.match(/.{2}/g) || [];
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

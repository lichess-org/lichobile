import { mapValues } from 'lodash/object';
import * as m from 'mithril';

export function castlesAt(v) {
  return mapValues({
    K: v,
    Q: v,
    k: v,
    q: v
  }, m.prop);
}

export function fenMetadatas(data) {
  var castlesStr = '';
  Object.keys(data.castles).forEach(function(piece) {
    if (data.castles[piece]()) castlesStr += piece;
  });
  return data.color() + ' ' + (castlesStr.length ? castlesStr : '-') + ' ' + data.enpassant() + ' ' + data.halfmove() + ' ' + data.moves();
}

export function computeFen(data, getBaseFen) {
  return getBaseFen() + ' ' + fenMetadatas(data);
}

export function readFen(fen) {
  const parts = fen.split(' ');
  return {
    color: m.prop(parts[1]),
    castles: {
      K: m.prop(parts[2].includes('K')),
      Q: m.prop(parts[2].includes('Q')),
      k: m.prop(parts[2].includes('k')),
      q: m.prop(parts[2].includes('q'))
    },
    enpassant: m.prop(parts[3]),
    halfmove: m.prop(parts[4]),
    moves: m.prop(parts[5])
  };
}

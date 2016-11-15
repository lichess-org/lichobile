import { mapValues } from 'lodash/object';
import * as m from 'mithril';
import * as stream from 'mithril/stream';

export function castlesAt(v) {
  return mapValues({
    K: v,
    Q: v,
    k: v,
    q: v
  }, stream);
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
    color: stream(parts[1]),
    castles: {
      K: stream(parts[2].includes('K')),
      Q: stream(parts[2].includes('Q')),
      k: stream(parts[2].includes('k')),
      q: stream(parts[2].includes('q'))
    },
    enpassant: stream(parts[3]),
    halfmove: stream(parts[4]),
    moves: stream(parts[5])
  };
}

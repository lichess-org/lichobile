export function uciToMove(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(0, 2), <Pos>uci.substr(2, 2)];
}

export function uciToDropPos(uci: string): Pos {
  return <Pos>uci.substr(2, 2);
}

const uciRoleMap = {
  P: 'pawn',
  B: 'bishop',
  N: 'knight',
  R: 'rook',
  Q: 'queen'
}

export function uciToDropRole(uci: string): Role {
  return uciRoleMap[uci.substr(0, 1)];
}

export function uciTolastDrop(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(2, 2), <Pos>uci.substr(2, 2)];
}

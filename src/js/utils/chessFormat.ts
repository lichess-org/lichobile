const uciRoleMap = {
  P: 'pawn',
  B: 'bishop',
  N: 'knight',
  R: 'rook',
  Q: 'queen',
  p: 'pawn',
  b: 'bishop',
  n: 'knight',
  r: 'rook',
  q: 'queen',
}

export function uciToMove(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(0, 2), <Pos>uci.substr(2, 2)];
}

export function uciToMoveOrDrop(uci: string): [Pos, Pos] {
  if (uci[1] === '@') return [<Pos>uci.substr(2, 2), <Pos>uci.substr(2, 2)];
  return [<Pos>uci.substr(0, 2), <Pos>uci.substr(2, 2)];
}

export function uciToProm(uci: string): Role | undefined {
  const p = uci.substr(4, 1);
  return uciRoleMap[p];
}

export function uciToDropPos(uci: string): Pos {
  return <Pos>uci.substr(2, 2);
}

export function uciToDropRole(uci: string): Role {
  return uciRoleMap[uci.substr(0, 1)];
}

export function uciTolastDrop(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(2, 2), <Pos>uci.substr(2, 2)];
}


export function uciToMove(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(0, 2), <Pos>uci.substr(2, 2)];
}

export function uciToDrop(uci: string): Pos {
  return <Pos>uci.substr(2, 2);
}

export function uciTolastDrop(uci: string): [Pos, Pos] {
  return [<Pos>uci.substr(2, 2), <Pos>uci.substr(2, 2)];
}

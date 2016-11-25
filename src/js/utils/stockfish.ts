interface XNavigator extends Navigator {
  hardwareConcurrency: number
}

export function setOption(name: string, value: string | number | boolean) {
  return Stockfish.cmd(`setoption name ${name} value ${value}`);
}

export function setThreads() {
  const cores = (<XNavigator>navigator).hardwareConcurrency || 1;
  return setOption('Threads', cores > 2 ? cores - 1 : 1);
}

export function setVariant(variant: VariantKey) {

  const uci960p =
    setOption('UCI_Chess960', ['fromPosition', 'chess960'].includes(variant))

  if (['standard', 'fromPosition', 'chess960'].includes(variant))
    return Promise.all([uci960p, setOption('UCI_Variant', 'chess')]);
  else if (variant === 'antichess')
    return setOption('UCI_Variant', 'giveaway');
  else
    return setOption('UCI_Variant', variant.toLowerCase());
}

export function convertFenForStockfish(fen: string) {
  // convert three check fens
  // lichess: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 +0+0
  // stockfish: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 3+3 0 1
  let m = fen.match(/^(.+) (w|b) (.+) (.+) (\d+) (\d+) \+(\d+)\+(\d+)$/);
  if (m) {
    const w = parseInt(m[7], 10);
    const b = parseInt(m[8], 10);
    const checks = (3 - w) + '+' + (3 - b);
    return [m[1], m[2], m[3], m[4], checks, m[5], m[6]].join(' ');
  }

  // convert crazyhouse fens
  // lichess: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/ w KQkq - 0 1
  // stockfish: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1
  m = fen.match(/^((?:\w+\/){7}\w+)\/([PNBRQKpnbrqk]*) (.*)$/);
  if (m) return m[1] + '[' + m[2] + '] ' + m[3];

  return fen;
}

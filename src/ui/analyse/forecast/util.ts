import { chunk } from "lodash-es";
import { ForecastStep } from "~/lichess/interfaces/forecast";

type Move = {
  index: number;
  white: San | null;
  black: San | null;
};

export function groupMoves(nodes: ForecastStep[]): Move[] {
  const moves: Move[] = [];
  if (nodes[0].ply % 2 === 0) {
    // black is the first move
    moves.push({
      index: Math.floor((nodes[0].ply + 1) / 2),
      black: nodes[0].san,
      white: null,
    });
    nodes = nodes.slice(1);
  }

  chunk(nodes, 2).forEach(([white, black]) => {
    moves.push({
      index: (white.ply + 1) / 2,
      white: white.san,
      black: black?.san,
    });
  });

  return moves;
}

function renderMoveTxt(move: Move): string {
  let txt = `${move.index}.`
  if (!move.white) {
    txt += ".."
  } else {
    txt += ` ${move.white}`
  }

  if (move.black) {
    txt += ` ${move.black}`
  }

  return txt
}

export function renderForecastTxt(nodes: ForecastStep[]): string {
  return groupMoves(nodes).map(renderMoveTxt).join(' ')
}

import { chunk, concat } from "lodash-es";
import h from "mithril/hyperscript";
import i18n from "~/i18n";
import { ForecastStep } from "~/lichess/interfaces/forecast";
import AnalyseCtrl from "../AnalyseCtrl";

type MaybeVNode = Mithril.Child | null;
type Move = {
  index: number;
  white: San | null;
  black: San | null;
};

function groupMoves(nodes: ForecastStep[]): Move[] {
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

function renderNodesHtml(nodes: ForecastStep[]): MaybeVNode[] {
  if (!nodes[0]) return [];
  if (!nodes[0].san) nodes = nodes.slice(1);
  if (!nodes[0]) return [];

  return groupMoves(nodes).map(({ black, white, index }) => {
    return h("move", [
      h("index", index + (white ? "." : "...")),
      white ? h("san", white) : null,
      black ? h("san", black) : null,
    ]);
  });
}

export default function renderForecasts(ctrl: AnalyseCtrl) {
  if (ctrl.forecast == undefined) return null;

  return h("div.forecasts-wrapper.native_scroller", [
    h(
      "div.forecasts-list",
      ctrl.forecast.lines.map((nodes) => {
        return h("div.forecast", [h("sans", renderNodesHtml(nodes))]);
      })
    ),
    h("div.info", i18n("playVariationToCreateConditionalPremoves")),
  ]);
}

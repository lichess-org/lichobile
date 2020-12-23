import h from "mithril/hyperscript";
import i18n from "~/i18n";
import { ForecastStep } from "~/lichess/interfaces/forecast";
import { ontap } from "~/ui/helper";
import AnalyseCtrl from "../AnalyseCtrl";
import ForecastCtrl from "./ForecastCtrl";
import { groupMoves } from "./util";

type MaybeVNode = Mithril.Child | null;

function makeCandidateNodes(
  ctrl: AnalyseCtrl,
  fctrl: ForecastCtrl
): ForecastStep[] {
  const afterPly = ctrl.tree.getCurrentNodesAfterPly(
    ctrl.nodeList,
    ctrl.mainline,
    ctrl.data.game.turns
  );
  return fctrl.truncate(
    afterPly.map((node) => ({
      ply: node.ply,
      fen: node.fen,
      uci: node.uci!,
      san: node.san!,
      check: node.check,
    }))
  );
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
  if (!ctrl.forecast) return null;

  const candidateNodes = makeCandidateNodes(ctrl, ctrl.forecast);
  const isCandidate = ctrl.forecast.isCandidate(candidateNodes);

  return h("div.forecasts-wrapper.native_scroller", [
    h(
      "div.forecasts-list",
      ctrl.forecast.lines.map((nodes, i) => {
        return h(
          "div.forecast",
          {
            oncreate: ontap(
              () => {},
              () => {
                ctrl.forecast!.contextIndex = i;
              }
            ),
          },
          [h("sans", renderNodesHtml(nodes))]
        );
      })
    ),
    h(
      "div.info",
      {
        class: isCandidate ? "add-forecast" : "",
      },
      isCandidate
        ? h(
            "div.add-forecast",
            {
              oncreate: ontap(() => {
                ctrl.forecast?.add(candidateNodes);
              }),
            },
            [
              h("span.fa.fa-plus-circle"),
              h("sans", renderNodesHtml(candidateNodes)),
            ]
          )
        : i18n("playVariationToCreateConditionalPremoves")
    ),
  ]);
}

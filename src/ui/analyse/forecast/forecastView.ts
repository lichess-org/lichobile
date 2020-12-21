import h from "mithril/hyperscript";
import i18n from "~/i18n";
import { ForecastStep } from "~/lichess/interfaces/forecast";
import { ontap } from "~/ui/helper";
import AnalyseCtrl from "../AnalyseCtrl";
import { groupMoves } from "./util";

type MaybeVNode = Mithril.Child | null;

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
                ctrl.forecast!.contextIndex = i
              }
            ),
          },
          [h("sans", renderNodesHtml(nodes))]
        );
      })
    ),
    h("div.info", i18n("playVariationToCreateConditionalPremoves")),
  ]);
}

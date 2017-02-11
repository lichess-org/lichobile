import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as helper from '../helper';
import * as gameApi from '../../lichess/game';
import * as h from 'mithril/hyperscript';
import { MenuInterface, AnalyseCtrlInterface } from './interfaces';

export default {

  controller: function(root: AnalyseCtrlInterface) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return isOpen;
      },
      root
    };
  },

  view: function(ctrl: MenuInterface) {
    if (!ctrl.root.data.analysis) return null;

    return popupWidget(
      'eval_summary',
      null,
      () => renderEvalSummary(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

const advices = [
  ['inaccuracy', 'inaccuracies'],
  ['mistake', 'mistakes'],
  ['blunder', 'blunders']
];

function renderPlayer(data: GameData, color: Color) {
  const p = gameApi.getPlayer(data, color);
  if (p.name) return [p.name];
  if (p.ai) return ['Stockfish level ' + p.ai]
  if (p.user) return [p.user.username, helper.renderRatingDiff(p)];
  return ['Anonymous'];
}


function renderEvalSummary(ctrl: AnalyseCtrlInterface) {
  const d = ctrl.data;

  return h('div.evalSummary', ['white', 'black'].map((color: Color) => {
    return h('table', [
      h('thead', h('tr', [
        h('th', h('span.light.color-icon.' + color)),
        h('td', renderPlayer(d, color))
      ])),
      h('tbody', [
        advices.map(a => {
          const nb = d.analysis.summary[color][a[0]];
          return h('tr', [
            h('th', nb),
            h('td', i18n(a[1]))
          ]);
        }),
        h('tr', [
          h('th', d.analysis.summary[color].acpl),
          h('td', i18n('averageCentipawnLoss'))
        ])
      ])
    ]);
  }));
}



import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import gameApi from '../../lichess/game';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
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

  view: function(ctrl) {
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

function renderPlayer(data, color) {
  const p = gameApi.getPlayer(data, color);
  if (p.name) return p.name;
  if (p.ai) return 'Stockfish level ' + p.ai;
  if (p.user) return [p.user.username, helper.renderRatingDiff(p)];
  return 'Anonymous';
}


function renderEvalSummary(ctrl) {
  const d = ctrl.data;

  return m('div.evalSummary', ['white', 'black'].map(color => {
    return m('table', [
      m('thead', m('tr', [
        m('th', m('span.light.color-icon.' + color)),
        m('td', renderPlayer(d, color))
      ])),
      m('tbody', [
        advices.map(a => {
          const nb = d.analysis.summary[color][a[0]];
          return m('tr', [
            m('th', nb),
            m('td', i18n(a[1]))
          ]);
        }),
        m('tr', [
          m('th', d.analysis.summary[color].acpl),
          m('td', i18n('averageCentipawnLoss'))
        ])
      ])
    ]);
  }));
}



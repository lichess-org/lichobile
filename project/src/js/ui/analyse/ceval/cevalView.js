import m from 'mithril';

import { defined, renderEval } from '../util';
import { classSet } from '../../../utils';

var gaugeLast = 0;
var squareSpin = m('span.square-spin');
var gaugeTicks = [];
for (var i = 1; i < 10; i++) gaugeTicks.push(m(i === 5 ? 'tick.zero' : 'tick', {
  style: {
    height: (i * 10) + '%'
  }
}));

module.exports = {
  renderGauge: function(ctrl) {
    if (ctrl.ongoing || !ctrl.showEvalGauge()) return null;
    var data = ctrl.currentAnyEval();
    var ceval, has = defined(data);
    if (has) {
      if (defined(data.cp))
        ceval = Math.min(Math.max(data.cp / 100, -5), 5);
      else
        ceval = data.mate > 0 ? 5 : -5;
      gaugeLast = ceval;
    } else ceval = gaugeLast;

    var height = 100 - (ceval + 5) * 10;

    return m('div', {
      class: classSet({
        eval_gauge: true,
        empty: ceval === null,
        reverse: ctrl.data.orientation === 'black'
      })
    }, [
      m('div', {
        class: 'black',
        style: {
          height: height + '%'
        }
      }),
      gaugeTicks
    ]);
  },
  renderCeval: function(ctrl) {
    if (!ctrl.ceval.allowed()) return null;

    const enabled = ctrl.ceval.enabled();
    const ceval = ctrl.currentAnyEval() || {};
    let pearl = squareSpin;

    if (defined(ceval.cp)) pearl = renderEval(ceval.cp);
    else if (defined(ceval.mate)) pearl = '#' + ceval.mate;
    else if (ctrl.vm.step.dests === '') pearl = '-';

    return m('div.ceval_box',
      m('div.switch', [
        m('input', {
          id: 'analyse-toggle-ceval',
          className: 'cmn-toggle cmn-toggle-round',
          type: 'checkbox',
          checked: enabled,
          onchange: ctrl.toggleCeval
        }),
        m('label', {
          'for': 'analyse-toggle-ceval'
        })
      ]),
      enabled ? m('pearl', pearl) : m('help',
        'Local computer evaluation',
        m('br'),
        'for variation analysis'
      )
    );
  }
};

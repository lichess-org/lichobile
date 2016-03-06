import m from 'mithril';
import { isEmpty } from 'lodash/lang';
import { defined, renderEval } from '../util';

const squareSpin = m('span.square-spin');

export default {
  renderCevalSwitch(ctrl) {
    if (!ctrl.ceval.allowed()) return null;
    const enabled = ctrl.ceval.enabled();

    return m('div.switch', [
      m('input', {
        className: 'cmn-toggle cmn-toggle-round',
        type: 'checkbox',
        checked: enabled,
        onchange: ctrl.toggleCeval
      }),
      m('label', {
        'for': 'analyse-toggle-ceval'
      })
    ]);
  },

  renderCeval(ctrl) {
    if (!ctrl.ceval.allowed()) return null;

    const enabled = ctrl.ceval.enabled();
    const ceval = ctrl.currentAnyEval() || {};
    let pearl = squareSpin, percent;

    if (defined(ceval.cp)) {
      pearl = <pearl>{renderEval(ceval.cp)}</pearl>;
      percent = ctrl.ceval.percentComplete();
    }
    else if (defined(ceval.mate)) {
      pearl = <pearl>{'#' + ceval.mate}</pearl>;
      percent = 100;
    }
    else if (isEmpty(ctrl.vm.step.dests)) {
      pearl = <pearl>-</pearl>;
      percent = 0;
    }
    else {
      pearl = <div className="spinner fa fa-spinner fa-pulse"></div>;
      percent = 0;
    }

    return (
      <div className="cevalBox">
        {enabled ? pearl : null }
        {enabled ?
          <div className="cevalBar">
            <span style={{ width: percent + '%' }}></span>
          </div> : null
        }
      </div>
    );
  }
};

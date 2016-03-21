import m from 'mithril';
import isEmpty from 'lodash/isEmpty';
import { defined, renderEval } from '../util';

const squareSpin = m('span.square-spin');

export default {
  renderCeval(ctrl) {
    if (!ctrl.ceval.enabled()) return null;

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
        { pearl }
        { ctrl.vm.showBestMove && ceval.bestSan ?
          <div className="bestMove">
            <small>best</small>
            <br/>
            { ceval.bestSan }
          </div> : null
        }
        <div className="cevalBar">
          <span style={{ width: percent + '%' }}></span>
        </div>
      </div>
    );
  }
};

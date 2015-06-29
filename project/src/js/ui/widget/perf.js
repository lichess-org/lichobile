import { gameIcon } from '../../utils';
import { provisionalDeviation } from '../../lichess/perfs';
import helper from '../helper';

module.exports = function(key, name, perf) {
  return m('div.perf', {
    'data-icon': gameIcon(key)
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
};


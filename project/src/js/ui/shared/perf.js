import { gameIcon } from '../../utils';
import { provisionalDeviation } from '../../lichess/perfs';
import helper from '../helper';
import m from 'mithril';

module.exports = function(key, name, perf, user) {
  return m('div.perf', {
    'data-icon': gameIcon(key),
    config : helper.ontouchY(goToVariantPerf(user, name.toLowerCase()))
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

function goToVariantPerf (user, name) {
  return (() => m.route(`/@/${user.id}/${name}/perf`));
}

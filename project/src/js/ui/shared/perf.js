import { gameIcon } from '../../utils';
import router from '../../router';
import { provisionalDeviation } from '../../lichess/perfs';
import helper from '../helper';
import * as m from 'mithril';

export default function(key, name, perf, user) {
  var options = { className: 'profilePerf', 'data-icon': gameIcon(key)};
  if (variantPerfAvailable(key, perf)) {
    options.className += ' nav';
    options.oncreate = helper.ontapY(() => router.set(`/@/${user.id}/${key}/perf`));
  }

  return m('div', options, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
}

function variantPerfAvailable (key, perf) {
  return (key !== 'puzzle' && perf.games > 0);
}

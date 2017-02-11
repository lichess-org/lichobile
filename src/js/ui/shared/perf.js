import { gameIcon } from '../../utils';
import router from '../../router';
import { provisionalDeviation } from '../../lichess/perfs';
import * as helper from '../helper';
import * as h from 'mithril/hyperscript';

export default function(key, name, perf, user) {
  var options = { className: 'profilePerf', 'data-icon': gameIcon(key)};
  if (variantPerfAvailable(key, perf)) {
    options.className += ' nav';
    options.oncreate = helper.ontapY(() => router.set(`/@/${user.id}/${key}/perf`));
  }

  return h('div', options, [
    h('span.name', name),
    h('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      h('span.nb', '/ ' + perf.games)
    ])
  ]);
}

function variantPerfAvailable (key, perf) {
  return (key !== 'puzzle' && perf.games > 0);
}

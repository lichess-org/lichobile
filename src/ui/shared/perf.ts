import * as h from 'mithril/hyperscript'
import { gameIcon } from '../../utils'
import router from '../../router'
import { provisionalDeviation } from '../../lichess/perfs'
import * as helper from '../helper'
import { UserFullProfile, Perf } from '../../lichess/interfaces/user'

export default function renderPerf(key: PerfKey, name: string, perf: Perf, user: UserFullProfile) {

  const avail = variantPerfAvailable(key, perf)

  return h('div', {
    className: 'profilePerf' + (avail ? ' nav' : ''),
    'data-icon': gameIcon(key),
    oncreate: helper.ontapY(() => {
      if (avail) router.set(`/@/${user.id}/${key}/perf`)
    })
  }, [
    h('span.name', name),
    h('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      h('span.nb', '/ ' + perf.games)
    ])
  ])
}

function variantPerfAvailable(key: PerfKey, perf: Perf) {
  return (key !== 'puzzle' && perf.games > 0)
}

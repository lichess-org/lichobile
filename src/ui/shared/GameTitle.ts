import * as h from 'mithril/hyperscript'
import * as utils from '../../utils'
import i18n from '../../i18n'
import { GameData } from '../../lichess/interfaces/game'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import * as gameApi from '../../lichess/game'
import getVariant from '../../lichess/variant'

interface Attrs {
  data: GameData | AnalyseData,
  withPlayers?: boolean
}

export default {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.data !== oldattrs.data || attrs.withPlayers !== oldattrs.withPlayers
  },

  view({ attrs }) {
    const { data, withPlayers } = attrs
    const mode = data.game.offline ? i18n('offline') :
    data.game.rated ? i18n('rated') : i18n('casual')
    const variant = getVariant(data.game.variant.key)
    const name = variant ? (variant.tinyName || variant.shortName || variant.name) : '?'
    const icon = data.game.source === 'import' ? '/' :
    utils.gameIcon(data.game.perf || data.game.variant.key)
    const time = gameApi.time(data)
    const text = data.game.source === 'import' ?
    `Import • ${name}` :
    `${time} • ${name} • ${mode}`

    return [
      h('h1', [
        h('span.withIcon', { 'data-icon': icon }),
        h('span', text)
      ]),
      withPlayers ? h('h2.header-subTitle', [
        h('span', utils.playerName(data.player, true, true, 12)),
        h('span.swords' , { 'data-icon': 'U' }),
        h('span', utils.playerName(data.opponent, true, true, 12))
      ]) : null
    ]
  }

} as Mithril.Component<Attrs, {}>

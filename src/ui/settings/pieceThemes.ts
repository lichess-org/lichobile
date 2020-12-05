import h from 'mithril/hyperscript'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import settings from '../../settings'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('pieceSet')))

    function onTap(e: Event) {
      const el = helper.getLI(e)
      const key = el && el.dataset.key
      if (key) {
        settings.general.theme.piece(key)
      }
    }

    function renderBody() {
      const currentTheme = settings.general.theme.piece()
      return [
        h('div.native_scroller.page.settings_list', {
          oncreate: helper.ontapY(onTap, undefined, helper.getLI)
        }, [
          h('ul', settings.general.theme.availablePieceThemes.map(t => {
            const [key, label] = t
            const selected = currentTheme === key
            return h('li.list_item.piece_theme', {
              className: key + (selected ? ' selected' : ''),
              'data-key': key,
            }, [i18n(label || key), selected ? h('span.fa.fa-check') : null])
          }))
        ])
      ]
    }

    return layout.free(header, renderBody())
  }
}

import h from 'mithril/hyperscript'
import { dropShadowHeader, backButton } from '../shared/common'
import redraw from '../../utils/redraw'
import * as helper from '../helper'
import layout from '../layout'
import i18n, { loadLanguage, allLocales, allKeys } from '../../i18n'
import settings from '../../settings'
import { setServerLang } from '../../xhr'

interface State {
  locale?: string | null
}

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.locale = settings.general.locale()
  },

  view() {
    const header = dropShadowHeader(null, backButton(i18n('language')))
    const currentLang = this.locale

    function renderLocale(l: string) {
      const name = allLocales[l]
      const selected = l === currentLang
      return (
        <li className={'list_item' + (selected ? ' selected' : '')} data-locale={l}>
          {name}
          {selected ?
            <span className="fa fa-check" /> : null
          }
        </li>
      )
    }

    const onTap = (e: Event) => {
      const el = helper.getLI(e)
      const locale = el && el.dataset.locale
      if (locale) {
        setServerLang(locale)
        loadLanguage(locale).then(() => {
          this.locale = locale
          redraw()
        })
      }
    }

    const renderBody = () => {
      return (
        <ul
          className="native_scroller page settings_list"
          oncreate={helper.ontapY(onTap, undefined, helper.getLI)}
        >
          {allKeys.map(l => renderLocale(l))}
        </ul>
      )
    }

    return layout.free(header, renderBody())
  }
} as Mithril.Component<Record<string, never>, State>

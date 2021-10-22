import h from 'mithril/hyperscript'
import { dropShadowHeader, backButton } from '../shared/common'
import redraw from '../../utils/redraw'
import * as helper from '../helper'
import layout from '../layout'
import i18n, { getCurrentLocale, loadLanguage, allLocales, allKeys, getDefaultLocaleForLang } from '../../i18n'
import { setServerLang } from '../../xhr'

interface State {
  browserLangs: Set<string>
}

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.browserLangs = navigator.languages.reduce((langSet, l) => {
      if (allLocales[l] !== undefined) return new Set([...langSet, l])
      else {
        const localeForLang = getDefaultLocaleForLang(l)
        if (localeForLang) return new Set([...langSet, localeForLang])
      }
      return langSet
    }, new Set<string>())
  },

  view() {
    const header = dropShadowHeader(null, backButton(i18n('language')))
    const currentLang = getCurrentLocale()
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
        loadLanguage(locale).then(redraw)
      }
    }

    const renderBody = () => {
      return (
        <ul
          className="native_scroller page settings_list"
          oncreate={helper.ontapY(onTap, undefined, helper.getLI)}
        >
          {[...this.browserLangs].concat(allKeys).map(l => renderLocale(l))}
        </ul>
      )
    }

    return layout.free(header, renderBody())
  }
} as Mithril.Component<Record<string, never>, State>

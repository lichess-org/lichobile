import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import { dropShadowHeader, backButton } from '../shared/common'
import redraw from '../../utils/redraw'
import { getLanguageNativeName } from '../../utils/langs'
import spinner from '../../spinner'
import * as helper from '../helper'
import layout from '../layout'
import i18n, { loadLanguage, getAvailableLocales, getIsoCodeFromLocale } from '../../i18n'
import settings from '../../settings'
import { setServerLang } from '../../xhr'

interface State {
  langs?: ReadonlyArray<string>
}

export const LangPrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    getAvailableLocales().then(data => {
      this.langs = data
      redraw()
    })
  },

  view() {
    const ctrl = this
    const header = dropShadowHeader(null, backButton(i18n('language')))
    const currentLang = settings.general.lang()

    function renderLang(l: string) {
      const name = getLanguageNativeName(getIsoCodeFromLocale(l))
      const selected = l === currentLang
      return (
        <li className={'list_item' + (selected ? ' selected' : '')} data-lang={l}>
          {name}
          {selected ?
            <span className="fa fa-check" /> : null
          }
        </li>
      )
    }

    function onTap(e: Event) {
      const el = helper.getLI(e)
      const lang = el && el.dataset.lang
      if (lang) {
        setServerLang(lang)
        loadLanguage(lang).then(redraw)
      }
    }

    function renderBody() {
      return ctrl.langs ?
        <ul
          className="native_scroller page settings_list"
          oncreate={helper.ontapY(onTap, undefined, helper.getLI)}
        >
          {ctrl.langs.map(l => renderLang(l))}
        </ul> :
        <div
          className="loader_container"
          oncreate={helper.ontapY(onTap, undefined, helper.getLI)}
        >
          {spinner.getVdom('monochrome')}
        </div>
    }

    return layout.free(header, renderBody())
  }
}

export default LangPrefScreen

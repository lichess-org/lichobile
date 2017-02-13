import { dropShadowHeader, backButton } from '../shared/common';
import redraw from '../../utils/redraw';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import * as helper from '../helper';
import * as h from 'mithril/hyperscript';
import { loadImage, handleError } from '../../bgtheme'

interface State {
  loading: boolean
}

const ThemePrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.loading = false
  },

  view() {
    const header = () => dropShadowHeader(null, backButton(i18n('theming')))
    return layout.free(header, () => renderBody(this));
  }
}

export default ThemePrefScreen

function renderBody(ctrl: State) {
  const list = settings.general.theme.availableBackgroundThemes
  return [
    h('div#bgThemes.native_scroller.page.settings_list.radio_list', {
      className: ctrl.loading ? 'loading' : ''
    }, [
      h('ul', list.map((t) => {
        return h('li.list_item', [
          formWidgets.renderRadio(
            t.name,
            'bg_theme',
            t.key,
            settings.general.theme.background() === t.key,
            e => {
              const val = (e.target as HTMLInputElement).value
              const prevTheme = settings.general.theme.background()
              settings.general.theme.background(val)
              if (val === 'dark' || val === 'light') {
                layout.onBackgroundChange(val);
                redraw();
              } else {
                ctrl.loading = true
                loadImage(val + '.' + t.ext)
                .then(() => {
                  layout.onBackgroundChange(val);
                  ctrl.loading = false
                  redraw()
                })
                .catch((err) => {
                  settings.general.theme.background(prevTheme)
                  ctrl.loading = false
                  redraw()
                  handleError(err)
                })
                redraw()
              }
            },
            ctrl.loading
          )
        ]);
      }))
    ])
  ];
}

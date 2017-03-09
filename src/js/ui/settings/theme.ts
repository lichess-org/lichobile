import { dropShadowHeader, backButton } from '../shared/common'
import redraw from '../../utils/redraw'
import formWidgets from '../shared/form'
import layout from '../layout'
import i18n from '../../i18n'
import settings from '../../settings'
import * as helper from '../helper'
import * as h from 'mithril/hyperscript'
import { loadImage, handleError } from '../../bgtheme'

interface Progress {
  loaded: number
  total: number
}

interface State {
  loading: boolean
  progress: Progress | null
  onProgress: (e: ProgressEvent) => void
  stopLoading: () => void
}

let timeoutId: number

const ThemePrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.loading = false
    this.progress = null
    this.onProgress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        this.progress = e
        redraw()
      }
    }
    this.stopLoading = () => {
      if (this.progress) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          this.loading = false
          this.progress = null
          redraw()
        }, 1500)
      } else {
        this.loading = false
        this.progress = null
        redraw()
      }
    }
  },

  view() {
    const header = () => dropShadowHeader(null, backButton(i18n('theming')))
    return layout.free(header, () => renderBody(this))
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
        const selected = settings.general.theme.background() === t.key
        return h('li.list_item', [
          formWidgets.renderRadio(
            t.name,
            'bg_theme',
            t.key,
            selected,
            e => {
              const val = (e.target as HTMLInputElement).value
              const prevTheme = settings.general.theme.background()
              settings.general.theme.background(val)
              if (val === 'dark' || val === 'light') {
                layout.onBackgroundChange(val)
                redraw()
              } else {
                ctrl.loading = true
                loadImage(val + '.' + t.ext, ctrl.onProgress)
                .then(() => {
                  layout.onBackgroundChange(val)
                  ctrl.stopLoading()
                })
                .catch((err) => {
                  settings.general.theme.background(prevTheme)
                  ctrl.stopLoading()
                  handleError(err)
                })
                redraw()
              }
            },
            ctrl.loading
          ),
          selected && ctrl.progress ? h('div.theme-progressBarContainer', [
            h('div.theme-progressBar', { style: { transform: `translateX(-${100 - progressPercent(ctrl.progress)}%)` }}),
            h('div.theme-progressInner', progressAmount(ctrl.progress))
          ]) : null
        ])
      }))
    ])
  ]
}

function progressAmount(p: Progress) {
  const loaded = (p.loaded / 1000).toFixed(2)
  const total = (p.total / 1000).toFixed(2)
  return `${loaded}k/${total}k`
}

function progressPercent(p: Progress) {
  return (p.loaded / p.total) * 100
}

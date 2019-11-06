import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'

import redraw from '../../../utils/redraw'
import { StoredProp as AsyncStoredProp } from '../../../asyncStorage'

interface Attrs {
  label: Mithril.Children
  name: string
  prop: AsyncStoredProp<boolean>
  callback?: (v: boolean) => void
  disabled?: boolean
}

interface State {
  value?: boolean
}

export default {
  oninit({ attrs }) {
    attrs.prop().then(v => {
      this.value = v
      redraw()
    })
  },

  view({ attrs }) {
    const disabled = this.value === undefined || attrs.disabled
    return h('div.check_container', {
      className: disabled ? 'disabled' : ''
    }, [
      h('label', {
        'for': attrs.name
      }, attrs.label),
      h('input[type=checkbox]', {
        id: attrs.name,
        name: attrs.name,
        disabled,
        checked: this.value,
        onchange: () => {
          this.value = !this.value
          attrs.prop(this.value).then(() => {
            if (attrs.callback) {
              attrs.callback(Boolean(this.value))
            }
          })
          redraw()
        }
      })
    ])
  },
} as Mithril.Component<Attrs, State>

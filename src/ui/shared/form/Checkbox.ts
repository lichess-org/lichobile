import h from 'mithril/hyperscript'

import redraw from '../../../utils/redraw'
import { Prop } from '../../../settings'

interface Attrs {
  label: Mithril.Children
  name: string
  prop: Prop<boolean>
  callback?: (v: boolean) => void
  disabled?: boolean
}

interface State {
  value: boolean
}

export default {
  oninit({ attrs }) {
    this.value = attrs.prop()
  },

  view({ attrs }) {
    return h('div.check_container', {
      className: attrs.disabled ? 'disabled' : ''
    }, [
      h('label', {
        'for': attrs.name
      }, attrs.label),
      h('input[type=checkbox]', {
        id: attrs.name,
        name: attrs.name,
        disabled: attrs.disabled,
        checked: this.value,
        onchange: () => {
          this.value = !this.value
          attrs.prop(this.value)
          if (attrs.callback) {
            attrs.callback(this.value)
          }
          redraw()
        }
      })
    ])
  },
} as Mithril.Component<Attrs, State>

import * as h from 'mithril/hyperscript'
import { formatTimeInSecs } from '../../utils'

interface Attrs {
  seconds: number
}

interface State {
  clockTime: number
  seconds: number
  el?: HTMLElement
  clockOnCreate(vnode: Mithril.DOMNode): void
  clockOnUpdate(vnode: Mithril.DOMNode): void
  tick(): void
  clockTimeoutId: number
}

export default {
  oninit({ attrs }) {
    this.seconds = attrs.seconds
    this.tick = () => {
      const now = performance.now()
      const elapsed = Math.round((now - this.clockTime) / 1000)
      this.clockTime = now
      const remaining = this.seconds - elapsed
      if (this.el) {
        this.el.textContent = formatTimeInSecs(remaining > 0 ? remaining : 0)
      }
      if (remaining <= 0) {
        clearTimeout(this.clockTimeoutId)
      } else {
        this.seconds = remaining
        this.clockTimeoutId = setTimeout(this.tick, 1000)
      }
    }
  },

  oncreate({ attrs, dom }) {
    this.el = dom as HTMLElement
    this.seconds = attrs.seconds
    dom.textContent = formatTimeInSecs(this.seconds)
    this.clockTime = performance.now()
    this.clockTimeoutId = setTimeout(this.tick, 1000)
  },

  onupdate({ dom }: Mithril.DOMNode) {
    this.el = dom as HTMLElement
  },

  onremove() {
    clearTimeout(this.clockTimeoutId)
  },

  view() {
    return h('strong.countdown-timer', formatTimeInSecs(this.seconds))
  }
} as Mithril.Component<Attrs, State>

import * as h from 'mithril/hyperscript'
import { formatTimeInSecs } from '../../utils'
import sound from '../../sound'

interface Attrs {
  seconds: number
  emergTime?: number
  textWrap?: (t: string) => string
}

interface State {
  clockTime: number
  seconds: number
  el?: HTMLElement
  rang: boolean
  clockOnCreate(vnode: Mithril.DOMNode): void
  clockOnUpdate(vnode: Mithril.DOMNode): void
  tick(): void
  clockTimeoutId: number
}

export default {
  oninit({ attrs }) {
    this.rang = false
    this.seconds = attrs.seconds
    this.tick = () => {
      const now = performance.now()
      const elapsed = Math.round((now - this.clockTime) / 1000)
      this.clockTime = now
      const diff = this.seconds - elapsed
      const remaining = diff > 0 ? diff : 0
      if (this.el) {
        const t = formatTimeInSecs(remaining)
        if (attrs.textWrap) this.el.innerHTML = attrs.textWrap(t)
        else this.el.textContent = t
      }
      if (attrs.emergTime !== undefined && !this.rang && remaining < attrs.emergTime) {
        if (this.el) this.el.classList.add('emerg')
        sound.lowtime()
        this.rang = true
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
    const t = formatTimeInSecs(this.seconds)
    if (attrs.textWrap) dom.innerHTML = attrs.textWrap(t)
    else dom.textContent = t
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
    return h('div.countdown-timer')
  }
} as Mithril.Component<Attrs, State>

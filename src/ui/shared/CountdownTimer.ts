import h from 'mithril/hyperscript'
import { formatTimeInSecs } from '../../utils'
import sound from '../../sound'

interface Attrs {
  seconds: number
  emergTime?: number
  textWrap?: (sec: Seconds, t: string) => string
  showOnlySecs?: boolean
}

interface State {
  clockTime: number
  seconds: number
  el?: HTMLElement
  rang: boolean
  clockOnCreate(vnode: Mithril.VnodeDOM<any, any>): void
  clockOnUpdate(vnode: Mithril.VnodeDOM<any, any>): void
  render(sec: Seconds): void
  tick(): void
  clockTimeoutId: number
}

export default {
  oninit({ attrs }) {
    this.rang = false
    this.seconds = attrs.seconds
    this.render = (sec: Seconds) => {
      if (this.el) {
        const t = formatTimeInSecs(sec, attrs.showOnlySecs ? 'secs_only' : undefined)
        if (attrs.textWrap) this.el.innerHTML = attrs.textWrap(sec, t)
        else this.el.textContent = t
      }
    }
    this.tick = () => {
      const now = performance.now()
      const elapsed = Math.round((now - this.clockTime) / 1000)
      this.clockTime = now
      const diff = this.seconds - elapsed
      const remaining = diff > 0 ? diff : 0
      this.render(remaining)
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
    this.render(this.seconds)
    this.clockTime = performance.now()
    this.clockTimeoutId = setTimeout(this.tick, 1000)
  },

  onupdate({ dom }: Mithril.VnodeDOM<any, any>) {
    this.el = dom as HTMLElement
  },

  onremove() {
    clearTimeout(this.clockTimeoutId)
  },

  view() {
    return h('div.countdown-timer')
  }
} as Mithril.Component<Attrs, State>

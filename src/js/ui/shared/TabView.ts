import * as h from 'mithril/hyperscript'
import * as Hammer from 'hammerjs'
import { viewportDim, findParentBySelector } from '../helper'


type TabsContent<T> = Array<T>
type Renderer<T> = (c: T) => Mithril.Children

interface Attrs<T> {
  selectedIndex: number
  content: TabsContent<T>
  renderer: Renderer<T>
  onTabChange: (i: number) => void
}

interface State {
  mc: HammerManager
}

export default {
  oncreate({ attrs, dom }) {
    const nbTabs = attrs.content.length

    this.mc = new Hammer.Manager(dom, {
      inputClass: Hammer.TouchInput
    })
    this.mc.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 10,
      velocity: 0.4
    }))

    this.mc.on('swiperight swipeleft', (e: HammerInput) => {
      const tab = findParentBySelector(e.target, '.tab-content')
      const ds = tab.dataset as DOMStringMap
      const index = Number(ds.index)
      if (index !== undefined) {
        if (e.direction === Hammer.DIRECTION_LEFT && index < nbTabs - 1) {
          attrs.onTabChange(index + 1)
        }
        else if (e.direction === Hammer.DIRECTION_RIGHT && index > 0) {
          attrs.onTabChange(index - 1)
        }
      }
    })
  },

  onremove() {
    this.mc.destroy()
  },

  view({ attrs }) {
    const curIndex = attrs.selectedIndex
    const vw = viewportDim().vw
    const shift = -(curIndex * vw)

    const style = {
      transform: `translateX(${shift}px)`
    }

    return h('div.tabs-view', {
      style
    }, attrs.content.map((_: any, index: number) =>
      h('div.tab-content', {
        'data-index': index
      }, h(Tab, { index, ...attrs }))
    ))
  }
} as Mithril.Component<Attrs<any>, State>


// --

interface TabAttrs<T> extends Attrs<T> {
  index: number
}
const Tab: Mithril.Component<TabAttrs<any>, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.content[attrs.index] !== oldattrs.content[oldattrs.index]
  },

  view({ attrs }) {
    return attrs.renderer(attrs.content[attrs.index])
  }
}

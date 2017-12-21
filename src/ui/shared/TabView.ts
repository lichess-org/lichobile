import * as h from 'mithril/hyperscript'
import { EDGE_SLIDE_THRESHOLD } from '../menu/OpenSlideHandler'
import * as Hammer from 'hammerjs'
import { viewportDim, findParentBySelector } from '../helper'


type TabsContent = Array<any>
type Renderer = (c: any, index: number) => Mithril.Children

interface Attrs {
  selectedIndex: number
  content: TabsContent
  renderer: Renderer
  onTabChange: (i: number) => void
  className?: string
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
      if (e.center.x - e.deltaX > EDGE_SLIDE_THRESHOLD) {
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
      }
    })
  },

  onremove() {
    this.mc.destroy()
  },

  view({ attrs }) {
    const curIndex = attrs.selectedIndex
    const vw = viewportDim().vw
    const width = attrs.content.length * 100
    const shift = -(curIndex * vw)

    const style = {
      width: `${width}vw`,
      transform: `translateX(${shift}px)`
    }

    return h('div.tabs-view', {
      style,
      className: attrs.className
    }, attrs.content.map((_: any, index: number) =>
      h('div.tab-content', {
        'data-index': index
      }, h(Tab, { index, ...attrs }))
    ))
  }
} as Mithril.Component<Attrs, State>


// --

interface TabAttrs extends Attrs {
  index: number
}
const Tab: Mithril.Component<TabAttrs, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.content[attrs.index] !== oldattrs.content[oldattrs.index]
  },

  view({ attrs }) {
    return attrs.renderer(attrs.content[attrs.index], attrs.index)
  }
}

import h from 'mithril/hyperscript'
import Gesture from '../../utils/Gesture'
import { viewportDim, findParentBySelector, elSlideIn } from '../helper'

interface Attrs {
  selectedIndex: number
  tabs: ReadonlyArray<{ id: string, f: () => Mithril.Children }>
  onTabChange: (i: number) => void
  className?: string
  boardView?: boolean
}

interface State {
  nbTabs: number
  gesture: Gesture
  prevIndex: number
}

export default {
  oninit({ attrs }) {
    this.nbTabs = attrs.tabs.length
    this.prevIndex = attrs.selectedIndex
  },

  oncreate({ attrs, dom }) {
    this.gesture = new Gesture(dom as HTMLElement, viewportDim())

    this.gesture.on('swiperight', (e: TouchEvent) => {
      const tab = findParentBySelector(e.target as HTMLElement, '.tab-content')
      if (tab) {
        const ds = tab.dataset as DOMStringMap
        const index = Number(ds.index)
        if (index !== undefined && index > 0) {
          attrs.onTabChange(index - 1)
        }
      }
    })

    this.gesture.on('swipeleft', (e: TouchEvent) => {
      const tab = findParentBySelector(e.target as HTMLElement, '.tab-content')
      if (tab) {
        const ds = tab.dataset as DOMStringMap
        const index = Number(ds.index)
        if (index !== undefined) {
          if (index < this.nbTabs - 1) {
            attrs.onTabChange(index + 1)
          }
        }
      }
    })
  },

  onupdate({ attrs, dom }) {
    this.nbTabs = attrs.tabs.length

    if (attrs.selectedIndex > this.prevIndex) {
      const el = dom.querySelector('.tab-content') || dom
      elSlideIn(el as HTMLElement, 'left')
    } else if (attrs.selectedIndex < this.prevIndex) {
      const el = dom.querySelector('.tab-content') || dom
      elSlideIn(el as HTMLElement, 'right')
    }

    this.prevIndex = attrs.selectedIndex
  },

  onremove() {
    this.gesture.destroy()
  },

  view({ attrs }) {
    const {
      tabs,
      selectedIndex,
    } = attrs
    const tab = tabs[selectedIndex]

    return h('div.tabs-view-wrapper', h('div.tab-content.box', {
      'data-index': selectedIndex,
      key: tab.id,
      className: attrs.className
    },  tab.f()))
  }
} as Mithril.Component<Attrs, State>

import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import * as Hammer from 'hammerjs'
import { EDGE_SLIDE_THRESHOLD } from './sideMenu'
import { viewportDim, findParentBySelector, headerHeight, isPortrait, is43Aspect } from '../helper'

interface Attrs {
  selectedIndex: number
  contentRenderers: ReadonlyArray<() => Mithril.Children>
  onTabChange: (i: number) => void
  className?: string
  boardView?: boolean
  withWrapper?: boolean
}

interface State {
  nbTabs: number
  mc: HammerManager
}

export default {
  oninit({ attrs }) {
    this.nbTabs = attrs.contentRenderers.length
  },

  oncreate({ attrs, dom }) {
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
        if (tab) {
          const ds = tab.dataset as DOMStringMap
          const index = Number(ds.index)
          if (index !== undefined) {
            if (e.direction === Hammer.DIRECTION_LEFT && index < this.nbTabs - 1) {
              attrs.onTabChange(index + 1)
            }
            else if (e.direction === Hammer.DIRECTION_RIGHT && index > 0) {
              attrs.onTabChange(index - 1)
            }
          }
        }
      }
    })
  },

  onupdate({ attrs }) {
    this.nbTabs = attrs.contentRenderers.length
  },

  onremove() {
    this.mc.destroy()
  },

  view({ attrs }) {
    const {
      contentRenderers,
      selectedIndex,
      boardView = false,
      withWrapper = false
    } = attrs
    const vd = viewportDim()
    const curIndex = selectedIndex
    const tabWidth = isPortrait() || !boardView ?
      vd.vw :
        is43Aspect() ?
          vd.vw - (vd.vh * 0.88) + headerHeight :
          vd.vw - vd.vh + headerHeight

    const width = contentRenderers.length * tabWidth
    const shift = -(curIndex * tabWidth)

    const style = {
      width: `${width}px`,
      transform: `translateX(${shift}px)`
    }

    const view = h('div.tabs-view', {
      style,
      className: attrs.className
    }, contentRenderers.map((_: any, index: number) =>
      h('div.tab-content', {
        style: {
          width: `${tabWidth}px`,
        },
        'data-index': index,
        className: selectedIndex === index ? 'current' : '',
      },  selectedIndex === index ? contentRenderers[index]() : null)
    ))

    return withWrapper ? h('div.tabs-view-wrapper', view) : view
  }
} as Mithril.Component<Attrs, State>

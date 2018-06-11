import * as h from 'mithril/hyperscript'
import * as Hammer from 'hammerjs'
import { EDGE_SLIDE_THRESHOLD } from '../../shared/sideMenu'
import { viewportDim, findParentBySelector, headerHeight } from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'

/*
 * We cannot do simple object identity check currently on analysis data
 * (and maybe we don't want to do it)
 * hence the custom tab view, mostly copied from ../../shared/TabView
 */

interface Attrs {
  ctrl: AnalyseCtrl,
  selectedIndex: number
  contentRenderers: ReadonlyArray<(ctrl: AnalyseCtrl) => Mithril.BaseNode>
  onTabChange: (i: number) => void
  className?: string
  isPortrait: boolean
  is43Aspect: boolean
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
    const vd = viewportDim()
    const curIndex = attrs.selectedIndex
    const tabWidth = attrs.isPortrait ?
      vd.vw :
        attrs.is43Aspect ?
          vd.vw - (vd.vh * 0.88) + headerHeight :
          vd.vw - vd.vh + headerHeight

    const width = attrs.contentRenderers.length * tabWidth
    const shift = -(curIndex * tabWidth)

    const style = {
      width: `${width}px`,
      transform: `translateX(${shift}px)`
    }

    return h('div.tabs-view', {
      style,
      className: attrs.className
    }, attrs.contentRenderers.map((_: any, index: number) =>
      h('div.tab-content', {
        style: {
          width: `${tabWidth}px`,
        },
        'data-index': index,
        className: attrs.selectedIndex === index ? 'current' : '',
      },  attrs.selectedIndex === index ? attrs.contentRenderers[index](attrs.ctrl) : null)
    ))
  }
} as Mithril.Component<Attrs, State>

import * as RenderService from 'mithril/render'
import * as Vnode from 'mithril/render/vnode'

import { batchRequestAnimationFrame } from '../../utils/batchRAF'

import SideMenu from './menuView'

function redrawMenu() {
  const menuEl = document.getElementById('side_menu')
  if (menuEl) {
    RenderService.render(menuEl, Vnode(SideMenu))
  }
}

export default function() {
  batchRequestAnimationFrame(redrawMenu)
}

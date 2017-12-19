import * as h from 'mithril/hyperscript'
import * as Vnode from 'mithril/render/vnode'
import * as RenderService from 'mithril/render'
import { hasNetwork } from '../../utils'
import session from '../../session'
import signals from '../../signals'

import MenuCtrl from './MenuCtrl'
import { renderHeader, renderLinks, renderProfileActions, profileActionsToggle } from './menuView'

let menu: MenuCtrl

const SideMenu = {
  view() {
    const user = session.get()

    return h('div.native_scroller', [
      renderHeader(menu, user),
      hasNetwork() && user ? profileActionsToggle(menu) : null,
      user && menu.profileMenuOpen ? renderProfileActions(menu, user) : renderLinks(menu, user)
    ])
  }
} as Mithril.Component<{}, {}>


export function init() {
  const edgeAreaEl = document.getElementById('edge_menu_area')
  const backdropEl = document.getElementById('menu-close-overlay')
  const menuEl = document.getElementById('side_menu')

  if (edgeAreaEl && backdropEl && menuEl) {
    menu = new MenuCtrl(menuEl, edgeAreaEl, backdropEl)

    function redraw() {
      RenderService.render(menuEl!, Vnode(SideMenu))
    }

    signals.redrawMenu.add(redraw)
  }
}

export function toggle() {
  if (menu.isOpen) menu.close()
  else menu.open()
}

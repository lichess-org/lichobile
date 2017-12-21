import * as h from 'mithril/hyperscript'
import * as Vnode from 'mithril/render/vnode'
import * as RenderService from 'mithril/render'
import { hasNetwork } from '../../utils'
import session from '../../session'
import signals from '../../signals'

import MenuCtrl from './MenuCtrl'
import { renderHeader, renderLinks, renderProfileActions, profileActionsToggle } from './menuView'

let menu: MenuCtrl

interface MenuProps {
  ctrl: MenuCtrl
}

const SideMenu = {
  view({ attrs }) {
    const { ctrl } = attrs
    const user = session.get()

    return h('div.native_scroller', [
      renderHeader(ctrl, user),
      hasNetwork() && user ? profileActionsToggle(ctrl) : null,
      user && menu.profileMenuOpen ? renderProfileActions(ctrl, user) : renderLinks(ctrl, user)
    ])
  }
} as Mithril.Component<MenuProps, {}>

export function init() {
  const edgeAreaEl = document.getElementById('edge_menu_area')
  const backdropEl = document.getElementById('menu-close-overlay')
  const menuEl = document.getElementById('side_menu')

  if (edgeAreaEl && backdropEl && menuEl) {
    menu = new MenuCtrl(menuEl, edgeAreaEl, backdropEl)

    function redraw() {
      RenderService.render(menuEl!, Vnode(SideMenu, undefined, { ctrl: menu }))
    }

    signals.redrawMenu.add(redraw)
  }
}

export function toggle() {
  if (menu !== undefined) {
    if (menu.isOpen) menu.close()
      else menu.open()
  }
}

import * as Mithril from 'mithril'
import RenderService from 'mithril/render'
import popupWidget from './ui/shared/popup'

const PORTAL_ID = 'prompt_portal'

function hide() {
  const el = document.getElementById(PORTAL_ID)
  if (el) {
    document.body.removeChild(el)
  }
}

export default {
  show(content: Mithril.Children, header?: Mithril.Children) {
    const portal = document.createElement('div')
    portal.id = PORTAL_ID
    const popup = popupWidget(
      'system_prompt',
      header ? () => header : undefined,
      () => content,
      true
    )
    RenderService.render(portal, popup)
    hide()
    document.body.appendChild(portal)
  },

  hide
}

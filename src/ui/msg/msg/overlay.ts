import MsgCtrl from "../ctrl"
import popupWidget from '~/ui/shared/popup'
import h from "mithril/hyperscript"
import { ontapXY } from "~/ui/helper"
import redraw from "~/utils/redraw"
import i18n from "~/i18n"

export default function renderOverlay(ctrl?: MsgCtrl): Mithril.Children {
  if (!ctrl?.confirmDelete) return null

  return popupWidget(
    'go_or_cancel',
    () => `${i18n('delete')}?`,
    () => {
      return [
        action('L', i18n('cancel'), () => ctrl.confirmDelete = null ),
        action('q', i18n('delete'), () => ctrl.delete())
      ]
    },
    true,
    () => {
      ctrl.confirmDelete = null
      redraw()
    }
  )
}

function action(icon: string, text: string, handler: () => void, extraClass?: string): Mithril.Child {
  return h('button.withIcon.binary_choice', {
    className: extraClass,
    'data-icon': icon,
    oncreate: ontapXY(handler)
  }, text)
}

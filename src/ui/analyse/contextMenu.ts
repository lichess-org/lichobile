import h from 'mithril/hyperscript'
import redraw from '../../utils/redraw'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import { nodeFullName } from './util'
import AnalyseCtrl from './AnalyseCtrl'
import i18n from '~/i18n'

export function view(ctrl: AnalyseCtrl): Mithril.Child | null {

  if (!ctrl.contextMenu) return null

  const path = ctrl.contextMenu
  const node = ctrl.tree.nodeAtPath(path)
  const onMainline = ctrl.tree.pathIsMainline(path)

  return popupWidget(
    'analyse-cm',
    () => nodeFullName(node),
    () => {
      return [
        onMainline ? null : action('S', 'Promote variation', () => ctrl.promote(path, false)),
        onMainline ? null : action('E', 'Make main line', () => ctrl.promote(path, true)),
        action('q', i18n('deleteFromHere'), () => ctrl.deleteNode(path))
      ]
    },
    true,
    () => {
      ctrl.contextMenu = null
      redraw()
    }
  )
}

function action(icon: string, text: string, handler: () => void): Mithril.Child {
  return h('button.withIcon', {
    'data-icon': icon,
    oncreate: helper.ontapXY(handler)
  }, text)
}

import h from 'mithril/hyperscript'
import redraw from '~/utils/redraw'
import popupWidget from '~/ui/shared/popup'
import * as helper from '~/ui/helper'
import i18n from '~/i18n'
import ForecastCtrl from './ForecastCtrl'
import { renderForecastTxt } from './util'

export function view(ctrl?: ForecastCtrl): Mithril.Child | null {
  if (!ctrl) return null

  const contextIndex = ctrl.contextIndex;
  if (contextIndex == null) return null

  return popupWidget(
    'analyse-cm',
    () => renderForecastTxt(ctrl.lines[contextIndex]),
    () => {
      return [
        h('button.withIcon', {
          'data-icon': 'q',
          oncreate: helper.ontapXY(() => ctrl.removeIndex(contextIndex))
        }, i18n('delete'))
      ]
    },
    true,
    () => {
      ctrl.contextIndex = null
      redraw()
    }
  )
}

import i18n from '../../i18n'
import socket from '../../socket'
import * as helper from '../helper'
import { dropShadowHeader as headerWidget } from '../shared/common'
import layout from '../layout'
import SearchCtrl, { ISearchCtrl } from './SearchCtrl'

import { renderSearchForm } from './searchView'
import { SearchQuery } from './interfaces'

interface Attrs {
  [param: string]: string
}

interface State {
  ctrl: ISearchCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()
    this.ctrl = SearchCtrl(<Partial<SearchQuery>>attrs)
  },

  view() {
    return layout.free(
      headerWidget(i18n('advancedSearch')),
      renderSearchForm(this.ctrl)
    )
  }
} as Mithril.Component<Attrs, State>

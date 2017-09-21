import i18n from '../../i18n'
import socket from '../../socket'
import * as helper from '../helper'
import { header as headerWidget } from '../shared/common'
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

const SearchScreen: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()
    this.ctrl = SearchCtrl(<Partial<SearchQuery>>attrs)
  },

  view() {
    return layout.free(
      () => headerWidget(i18n('advancedSearch')),
      () => renderSearchForm(this.ctrl)
    )
  }
}

export default SearchScreen

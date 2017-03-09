import i18n from '../../i18n'
import * as helper from '../helper'
import { header as headerWidget } from '../shared/common'
import layout from '../layout'
import SearchCtrl, { ISearchCtrl } from './searchCtrl'

import { renderSearchForm } from './searchView'

interface State {
  ctrl: ISearchCtrl
}

const SearchScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewFadeIn,

  oninit() {
    helper.analyticsTrackView('Advanced search')

    this.ctrl = SearchCtrl()
  },

  view() {
    return layout.free(
      () => headerWidget(i18n('search')),
      () => renderSearchForm(this.ctrl)
    )
  }
}

export default SearchScreen

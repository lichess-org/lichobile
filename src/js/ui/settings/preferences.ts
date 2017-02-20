import * as utils from '../../utils';
import router from '../../router';
import { dropShadowHeader, backButton } from '../shared/common';
import * as helper from '../helper';
import layout from '../layout';
import i18n from '../../i18n';
import * as h from 'mithril/hyperscript';

function renderBody() {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item.nav', {
        oncreate: helper.ontapY(utils.f(router.set, '/settings/gameBehavior'))
      }, i18n('gameBehavior')),
      h('li.list_item.nav', {
        oncreate: helper.ontapY(utils.f(router.set, '/settings/privacy'))
      }, i18n('privacy')),
      h('li.list_item.nav', {
        oncreate: helper.ontapY(utils.f(router.set, '/settings/kidMode'))
      }, 'Kid mode')
    ])
  ];
}

const PreferencesScreen: Mithril.Component<{}, {}> = {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('preferences')))
    return layout.free(header, renderBody);
  }
}

export default PreferencesScreen

import * as utils from '../../utils';
import * as helper from '../helper';
import { dropShadowHeader, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import push from '../../push';
import i18n from '../../i18n';
import settings from '../../settings';
import sound from '../../sound';
import vibrate from '../../vibrate';
import * as h from 'mithril/hyperscript';

function renderBody() {
  const allowed = settings.general.notifications.allow();
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', {
        key: 'sound'
      }, formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound, sound.onSettingChange)),
      h('li.list_item', {
        key: 'vibrate'
      }, formWidgets.renderCheckbox(i18n('vibrateOnGameEvents'), 'vibrate', settings.general.vibrateOnGameEvents, vibrate.onSettingChange)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('notifications'), 'notifications', settings.general.notifications.allow, isOn => {
        if (isOn) push.register();
        else push.unregister();
      })),
      h('li.list_item', formWidgets.renderCheckbox(i18n('vibrationOnNotification'), 'vibrate', settings.general.notifications.vibrate, isOn => {
        window.plugins.OneSignal.enableVibrate(isOn);
      }, !allowed)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('soundOnNotification'), 'sound', settings.general.notifications.sound, isOn => {
        window.plugins.OneSignal.enableSound(isOn);
      }, !allowed))
    ])
  ];
}

export default {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('soundAndNotifications')))
    return layout.free(header, renderBody)
  }
}

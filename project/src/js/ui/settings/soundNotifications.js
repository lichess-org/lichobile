import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import push from '../../push';
import i18n from '../../i18n';
import settings from '../../settings';
import sound from '../../sound';
import vibrate from '../../vibrate';
import m from 'mithril';

function renderBody() {
  const allowed = settings.general.notifications.allow();
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', {
        key: 'sound'
      }, formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound, sound.onSettingChange)),
      m('li.list_item', {
        key: 'vibrate'
      }, formWidgets.renderCheckbox(i18n('vibrateOnGameEvents'), 'vibrate', settings.general.vibrateOnGameEvents, vibrate.onSettingChange)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('notifications'), 'notifications', settings.general.notifications.allow, isOn => {
        if (isOn) push.register();
        else push.unregister();
      })),
      m('li.list_item', formWidgets.renderCheckbox(i18n('vibrationOnNotification'), 'vibrate', settings.general.notifications.vibrate, push.register, !allowed)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('soundOnNotification'), 'sound', settings.general.notifications.sound, push.register, !allowed))
    ])
  ];
}

export default {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('soundAndNotifications'))
    );
    return layout.free(header, renderBody);
  }
};

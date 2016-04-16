import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import push from '../../push';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  const allowed = settings.general.notifications.allow();
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('allowNotifications'), 'notifications', settings.general.notifications.allow, isOn => {
        if (isOn) push.register();
        else push.unregister();
      })),
      m('li.list_item', formWidgets.renderCheckbox(i18n('enableVibrationOnNotification'), 'vibrate', settings.general.notifications.vibrate, null, !allowed)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('enableSoundOnNotification'), 'sound', settings.general.notifications.sound, null, !allowed))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('notifications'))
    );
    return layout.free(header, renderBody);
  }
};

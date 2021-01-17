import { Convo } from '../interfaces'
import MsgCtrl from '../ctrl';
import h from 'mithril/hyperscript';
import i18n from '~/i18n';
import { ontap } from '~/ui/helper';

export default function renderActions(ctrl: MsgCtrl, convo: Convo): Mithril.Children {
  if (convo.user.id == 'lichess') return [];

  return (
    h(`button.msg-app__convo__action.button.button-empty.bad`, {
      key: 'delete',
      'data-icon': 'q',
      title: i18n('delete'),
      oncreate: ontap(() => ctrl.confirmDelete = convo.user.id)
    })
  );
}

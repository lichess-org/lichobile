import h from 'mithril/hyperscript'
import { fromNow } from '~/i18n'
import { userStatus } from '~/ui/shared/common'
import MsgCtrl from '../MsgCtrl'
import { Contact, LastMsg } from '../interfaces'
import * as helper from '../../helper'

export default function renderContact(ctrl: MsgCtrl, contact: Contact, active?: string): Mithril.Vnode {
  const user = contact.user, msg = contact.lastMsg,
    isNew = !msg.read && msg.user != ctrl.data.me.id
  return h('div.msg-app__side__contact', {
    key: `${user.id}${active === user.id ? '-active' : ''}`,
    className: active === user.id ? 'active' : '',
    'data-userid': user.id,
  }, [
    h('div.msg-app__side__contact__user', [
      h('div.msg-app__side__contact__head', [
        userStatus({...user, username: user.name}),
        h('div.msg-app__side__contact__date', renderDate(msg))
      ]),
      h('div.msg-app__side__contact__body', [
        h('div.msg-app__side__contact__msg', {
          className: isNew ? 'msg-app__side__contact__msg--new' : '',
        }, msg.text),
        isNew ? h('i.msg-app__side__contact__new', {
          'data-icon': ''
        }) : null
      ])
    ])
  ])
}

export function getContact(e: Event) {
  return helper.closest(e, '.msg-app__side__contact')
}

export function onContactTap(e: Event, ctrl: MsgCtrl) {
  const el = getContact(e)
  const ds = el?.dataset as DOMStringMap
  if (ds.userid) {
    ctrl.openConvo(ds.userid)
  }
}

function renderDate(msg: LastMsg): Mithril.Vnode {
  return h('time.timeago', {
    key: msg.date.getTime(),
    title: msg.date.toLocaleString(),
    datetime: msg.date.getTime()
  }, fromNow(msg.date))
}

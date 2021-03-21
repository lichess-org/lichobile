import h from 'mithril/hyperscript'
import spinner from '~/spinner'
import * as helper from '../../helper'
import MsgCtrl from '../MsgCtrl'
import renderContact, { getContact, onContactTap } from './contact'
import renderConvo from './convo'
import * as search from './search'

export default function renderInbox(ctrl?: MsgCtrl): Mithril.Vnode {
  if (ctrl) {
    const activeId = ctrl.data.convo?.user.id
    return h('main.box.msg-app', {
      className: `pane-${ctrl.pane}`
    }, [
      h('div.msg-app__side', {
        key: 'side',
      }, [
        search.renderInput(ctrl),
        ctrl.search.result ?
          search.renderResults(ctrl, ctrl.search.result) :
          h('div.msg-app__contacts.msg-app__side__content.native_scroller', {
            oncreate: helper.ontapY(e => onContactTap(e, ctrl), undefined, getContact)
          },
            ctrl.data.contacts.map(t => renderContact(ctrl, t, activeId))
          )
      ]),
      ctrl.data.convo ? renderConvo(ctrl, ctrl.data.convo) : (
        ctrl.loading ?
          h('div.msg-app__convo', {
            key: 'convo-loading',
          }, [
            h('div.msg-app__convo__head'),
            spinner.getVdom(),
          ]) : h('div.msg-app__convo', { key: 'convo-empty' })
      )
    ])
  } else {
    return spinner.getVdom()
  }
}

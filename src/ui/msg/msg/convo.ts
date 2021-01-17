import h from "mithril/hyperscript";
import router from "~/router";
import { ontap } from "~/ui/helper";
import { userStatus } from "~/ui/shared/common";
import { backArrow } from "~/ui/shared/icons";
import MsgCtrl from "../ctrl";
import { Convo } from "../interfaces";
import renderActions from "./actions";
import renderInteract from "./interact";
import renderMsgs from "./msgs";

export default function renderConvo(ctrl: MsgCtrl, convo: Convo): Mithril.Vnode {
  const user = convo.user;
  return h('div.msg-app__convo', [
    h('div.msg-app__convo__head', [
      h('div.msg-app__convo__head__left', [
        h('button.msg-app__convo__head__back', {
          oncreate: ontap(() => { ctrl.showSide() })
        }, backArrow),
        h('div.user-link', {
          oncreate: ontap(() => router.set(`/@/${user.name}`)),
          class: user.online ? 'online' : 'offline'
        }, userStatus({...user, username: user.name}))
      ]),
      h('div.msg-app__convo__head__actions', renderActions(ctrl, convo))
    ]),
    renderMsgs(ctrl, convo),
    h('div.msg-app__convo__reply', [
      convo.relations.out === false || convo.relations.in === false ?
        h('div.msg-app__convo__reply__block.text', {
          'data-icon': 'k'
        }, 'This conversation is blocked.') : (
          convo.postable ?
            renderInteract(ctrl, user) :
            h('div.msg-app__convo__reply__block.text', {
              'data-icon': 'k'
            }, `${user.name} doesn't accept new messages.`)
        )
    ])
  ]);
}

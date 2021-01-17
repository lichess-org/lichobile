import { Plugins } from "@capacitor/core";
import throttle from "lodash-es/throttle";
import h from "mithril/hyperscript";
import MsgCtrl from "../ctrl";
import { User } from "../interfaces";

let prev = 0

export default function renderInteract(ctrl: MsgCtrl, user: User): Mithril.Vnode {
  const connected = ctrl.connected();
  return h('form.msg-app__convo__post', {
    onsubmit: (e: Event) => {
      e.preventDefault()
      const now = Date.now()
      if (now - 1000 < prev) return

      const form = e.target as HTMLFormElement
      const area = form[0] as HTMLTextAreaElement
      const body = area.value.trim()
      if (body.length > 8000) {
        Plugins.LiToast.show({ text: 'Message is too long', duration: 'short' })
      } else if (body.length > 0) {
        prev = now
        ctrl.post(body)
        area.value = ''
        area.focus()
      }
    }
  }, [
    renderTextarea(ctrl, user),
    h('button.msg-app__convo__post__submit.button.fa.fa-telegram', {
      class: connected ? 'connected' : '',
      type: 'submit',
      disabled: !connected
    })
  ]);
}

function renderTextarea(ctrl: MsgCtrl, user: User): Mithril.Vnode {
  return h('textarea.msg-app__convo__post__text', {
    rows: 1,
    oncreate: vnode => {
      const area = vnode.dom as HTMLTextAreaElement
      area.addEventListener('input', throttle(() => {
        ctrl.sendTyping(user.id);
      }, 500));
    }
  });
}

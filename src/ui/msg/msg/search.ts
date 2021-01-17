import throttle from "lodash-es/throttle";
import h from "mithril/hyperscript";
import i18n from "~/i18n";
import { ontap } from "~/ui/helper";
import { userStatus } from "~/ui/shared/common";
import MsgCtrl from "../ctrl";
import { SearchResult, User } from "../interfaces";
import renderContact from "./contact";

export function renderInput(ctrl: MsgCtrl): Mithril.Vnode {
  return h('div.msg-app__side__search', [
    ctrl.data.me.kid ? null : h('input', {
      placeholder: i18n('searchOrStartNewDiscussion'),
      oncreate: vnode => {
        const input = (vnode.dom as HTMLInputElement);
        input.addEventListener('input', throttle(() => ctrl.searchInput(input.value.trim()), 500));
      }
    })
  ]);
}

export function renderResults(ctrl: MsgCtrl, res: SearchResult): Mithril.Vnode {
  return h('div.msg-app__search.msg-app__side__content.native_scroller', [
    res.contacts[0] && h('section', [
      h('h2', i18n('discussions')),
      h('div.msg-app__search__contacts', res.contacts.map(t => renderContact(ctrl, t)))
    ]),
    res.friends[0] && h('section', [
      h('h2', i18n('friends')),
      h('div.msg-app__search__users', res.friends.map(u => renderUser(ctrl, u)))
    ]),
    res.users[0] && h('section', [
      h('h2', i18n('players')),
      h('div.msg-app__search__users', res.users.map(u => renderUser(ctrl, u)))
    ])
  ]);
}

function renderUser(ctrl: MsgCtrl, user: User): Mithril.Vnode {
  return h('div.msg-app__side__contact', {
    key: user.id,
    oncreate: ontap(() => ctrl.openConvo(user.id))
  }, [
    h('div.msg-app__side__contact__user', [
      h('div.msg-app__side__contact__head', [
        userStatus({...user, username: user.name})
      ])
    ])
  ]);
}

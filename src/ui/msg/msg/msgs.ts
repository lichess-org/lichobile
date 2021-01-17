import h from "mithril/hyperscript";
import i18n from "~/i18n";
import { ontap } from "~/ui/helper";
import { linkify } from "~/utils/html";
import MsgCtrl from "../ctrl";
import { Convo, Daily, Msg } from "../interfaces";
import { scroller } from "./scroller";

export default function renderMsgs(ctrl: MsgCtrl, convo: Convo): Mithril.Vnode {
  return h('div.msg-app__convo__msgs.native_scroller', {
    oncreate: (vnode) => {
      scroller.init(vnode.dom as HTMLElement)
      scroller.auto()
    },
    onupdate: () => scroller.auto(),
  }, [
    h('div.msg-app__convo__msgs__content', [
      ctrl.canGetMoreSince ? h('button.msg-app__convo__msgs__more.button.button-empty', {
        key: 'more',
        oncreate: ontap(() => {
          scroller.setMarker()
          ctrl.getMore()
        })
      }, 'Load more') : null,
      ...contentMsgs(ctrl, convo.msgs),
      ctrl.typing ? h('div.msg-app__convo__msgs__typing', `${convo.user.name} is typing...`) : null
    ])
  ]);
}

function contentMsgs(ctrl: MsgCtrl, msgs: Msg[]): Mithril.ChildArray {
  const dailies = groupMsgs(msgs);
  const nodes: Mithril.ChildArray = [];
  dailies.forEach(daily => nodes.push(...renderDaily(ctrl, daily)));
  return nodes;
}

function renderDaily(ctrl: MsgCtrl, daily: Daily): Mithril.ChildArray {
  return [
    h('day', renderDate(daily.date)),
    ...daily.msgs.map(group =>
      h('group', group.map(msg => renderMsg(ctrl, msg)))
    )
  ];
}

function renderMsg(ctrl: MsgCtrl, msg: Msg) {
  const tag = msg.user == ctrl.data.me.id ? 'mine' : 'their';
  return h(tag, [
    renderText(msg),
    h('em', `${pad2(msg.date.getHours())}:${pad2(msg.date.getMinutes())}`)
  ]);
}
const pad2 = (num: number): string => (num < 10 ? '0' : '') + num;

function groupMsgs(msgs: Msg[]): Daily[] {
  let prev: Msg = msgs[0];
  if (!prev) return [{ date: new Date(), msgs: [] }];
  const dailies: Daily[] = [{
    date: prev.date,
    msgs: [[prev]]
  }];
  msgs.slice(1).forEach(msg => {
    if (sameDay(msg.date, prev.date)) {
      if (msg.user == prev.user) dailies[0].msgs[0].unshift(msg);
      else dailies[0].msgs.unshift([msg]);
    } else dailies.unshift({
      date: msg.date,
      msgs: [[msg]]
    });
    prev = msg;
  });
  return dailies;
}

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

function renderDate(date: Date): string {
  if (sameDay(date, today)) return i18n('today').toUpperCase();
  if (sameDay(date, yesterday)) return i18n('yesterday').toUpperCase();
  return renderFullDate(date);
}

const renderFullDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const sameDay = (d: Date, e: Date) =>
  d.getDate() == e.getDate() && d.getMonth() == e.getMonth() && d.getFullYear() == e.getFullYear();

const renderText = (msg: Msg) =>
  h('t', h.trust(linkify(msg.text).replace(/\n/g, '<br>')))

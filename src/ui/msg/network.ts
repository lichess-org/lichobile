import MsgCtrl from './ctrl';
import { MsgData, Contact, User, Msg, Convo, SearchResult } from './interfaces';
import { fetchJSON } from '~/http';
import socket, { MessageHandlers, SocketIFace } from '~/socket';

const v5Opts = {headers: {'Accept': 'application/vnd.lichess.v5+json'}}

export async function loadConvo(userId: string): Promise<MsgData> {
  const d = await fetchJSON(`/inbox/${userId}`, v5Opts);
  return upgradeData(d);
}

export async function getMore(userId: string, before: Date): Promise<MsgData> {
  const d = await fetchJSON(`/inbox/${userId}?before=${before.getTime()}`, v5Opts);
  return upgradeData(d);
}

export async function loadContacts(): Promise<MsgData> {
  const d = await fetchJSON(`/inbox`, v5Opts);
  return upgradeData(d);
}

export async function search(q: string): Promise<SearchResult> {
  const res = await fetchJSON<SearchResult>(`/inbox/search?q=${q}`, v5Opts);
  return ({
    ...res,
    contacts: res.contacts.map(upgradeContact)
  });
}

export function block(u: string): Promise<any> {
  return fetchJSON(`/rel/block/${u}`, { ...v5Opts, method: 'POST' });
}

export function unblock(u: string): Promise<any> {
  return fetchJSON(`/rel/unblock/${u}`, { ...v5Opts, method: 'POST' });
}

export async function del(u: string): Promise<MsgData> {
  return fetchJSON(`/inbox/${u}/delete`, { ...v5Opts, method: 'POST' })
    .then(upgradeData);
}

export function unreadCount(): Promise<number> {
  return fetchJSON('/inbox/unread-count', {}, false)
}

export class MessageSocket {
  private socket: SocketIFace

  constructor(ctrl: MsgCtrl) {
    const handlers = socketMessageHandlers(ctrl)
    this.socket = socket.createChat(handlers)
  }

  post(dest: string, text: string): void {
    this.socket.send('msgSend', { dest, text })
  }
  
  setRead(dest: string): void {
    this.socket.send('msgRead', dest)
  }
  
  typing(dest: string): void {
    this.socket.send('msgType', dest)
  }
}

export function socketMessageHandlers(ctrl: MsgCtrl): MessageHandlers {
  return {
    msgNew: (msg: any) => {
      ctrl.receive({
        ...upgradeMsg(msg),
        read: false
      });
    },
    msgType: ctrl.receiveTyping,
    blockedBy: ctrl.changeBlockBy,
    unblockedBy: ctrl.changeBlockBy,
  }
}
// the upgrade functions convert incoming timestamps into JS dates
export function upgradeData(d: any): MsgData {
  return {
    ...d,
    convo: d.convo && upgradeConvo(d.convo),
    contacts: d.contacts.map(upgradeContact)
  };
}
function upgradeMsg(m: any): Msg {
  return {
    ...m,
    date: new Date(m.date)
  };
}
function upgradeUser(u: any): User {
  return {
    ...u,
    id: u.name.toLowerCase()
  };
}
function upgradeContact(c: any): Contact {
  return {
    ...c,
    user: upgradeUser(c.user),
    lastMsg: upgradeMsg(c.lastMsg)
  };
}
function upgradeConvo(c: any): Convo {
  return {
    ...c,
    user: upgradeUser(c.user),
    msgs: c.msgs.map(upgradeMsg)
  };
}

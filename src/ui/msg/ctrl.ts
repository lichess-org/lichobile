import { MsgData, Contact, Convo, Msg, LastMsg, Search, SearchResult, Typing, Pane } from './interfaces';
import throttle from 'lodash-es/throttle';
import redraw from '~/utils/redraw';
import * as network from './network';
import { hasNetwork } from '~/utils';
import router from '~/router';
import { scroller } from './msg/scroller';

export default class MsgCtrl {
  data: MsgData;
  search: Search = {
    input: ''
  };
  pane: Pane;
  loading = false;
  confirmDelete: string | null = null
  connected = (): boolean => true;
  msgsPerPage = 100;
  canGetMoreSince?: Date;
  typing?: Typing;
  socket: network.MessageSocket 

  constructor(data: MsgData) {
    this.data = data;
    this.pane = data.convo ? 'convo' : 'side';
    this.connected = hasNetwork
    this.socket = new network.MessageSocket(this);

    if (this.data.convo) this.onLoadConvo(this.data.convo);
    this.setRead()
  }

  openConvo = (userId: string): void => {
    if (this.data.convo?.user.id != userId) {
      this.data.convo = undefined;
      this.loading = true;
    }
    network.loadConvo(userId).then(data => {
      this.data = data;
      this.search.result = undefined;
      this.loading = false;
      if (data.convo) {
        router.replacePath(`/inbox/${data.convo.user.name}`)
        this.onLoadConvo(data.convo);
        redraw();
      }
      else this.showSide();
    });
    this.pane = 'convo';
    redraw();
  }

  showSide = (): void => {
    this.pane = 'side';
    router.replacePath('/inbox')
    redraw();
  }

  getMore = (): void => {
    if (this.data.convo && this.canGetMoreSince)
      network.getMore(this.data.convo.user.id, this.canGetMoreSince)
        .then(data => {
          if (!this.data.convo || !data.convo || data.convo.user.id != this.data.convo.user.id || !data.convo.msgs[0]) return;
          if (data.convo.msgs[0].date >= this.data.convo.msgs[this.data.convo.msgs.length - 1].date) return;
          this.data.convo.msgs = this.data.convo.msgs.concat(data.convo.msgs);
          this.onLoadMsgs(data.convo.msgs);
          redraw();
        });
    this.canGetMoreSince = undefined;
    redraw();
  }

  private onLoadConvo = (convo: Convo) => {
    this.onLoadMsgs(convo.msgs);
    if (this.typing) {
      clearTimeout(this.typing.timeout);
      this.typing = undefined;
    }
    setTimeout(this.setRead, 500);
  }
  private onLoadMsgs = (msgs: Msg[]) => {
    const oldFirstMsg = msgs[this.msgsPerPage - 1];
    this.canGetMoreSince = oldFirstMsg?.date;
  }

  post = (text: string): void => {
    if (this.data.convo) {
      this.socket.post(this.data.convo.user.id, text)
      const msg: LastMsg = {
        text,
        user: this.data.me.id,
        date: new Date(),
        read: true
      };
      this.data.convo.msgs.unshift(msg);
      const contact = this.currentContact();
      if (contact) {
        this.addMsg(msg, contact);
      } else {
        setTimeout(() => network.loadContacts().then(data => {
          this.data.contacts = data.contacts;
          redraw();
        }), 1000);
      }
      scroller.enable(true);
      redraw();
    }
  }

  receive = (msg: LastMsg): void => {
    const contact = this.findContact(msg.user);
    this.addMsg(msg, contact);
    if (contact) {
      let redrawn = false;
      if (msg.user == this.data.convo?.user.id) {
        this.data.convo.msgs.unshift(msg);
        redrawn = this.setRead()
        this.receiveTyping(msg.user, true);
      }
      if (!redrawn) redraw();
    } else {
      network.loadContacts().then(data => {
        this.data.contacts = data.contacts;
        redraw();
      });
    }
  }

  private addMsg = (msg: LastMsg, contact?: Contact) => {
    if (contact) {
      contact.lastMsg = msg;
      this.data.contacts = [contact].concat(this.data.contacts.filter(c => c.user.id != contact.user.id));
    }
  }

  private findContact = (userId: string): Contact | undefined =>
    this.data.contacts.find(c => c.user.id == userId);

  private currentContact = (): Contact | undefined =>
   this.data.convo && this.findContact(this.data.convo.user.id);

  searchInput = (q: string): void => {
    this.search.input = q;
    if (q[1]) {
      network.search(q).then((res: SearchResult) => {
        this.search.result = this.search.input[1] ? res : undefined;
        redraw();
      });
    } else {
      this.search.result = undefined;
      redraw();
    }
  }

  setRead = (): boolean => {
    const msg = this.currentContact()?.lastMsg;
    if (msg && msg.user != this.data.me.id) {
      if (msg.read) return false;
      msg.read = true;
      this.socket.setRead(msg.user);
      redraw();
      return true;
    }
    return false;
  }

  delete = (): void => {
    const userId = this.data.convo?.user.id;
    if (userId) network.del(userId).then(data => {
      this.data = data
      this.confirmDelete = null
      this.pane = 'side'
      redraw()
      router.replacePath('/inbox')
    });
  }

  block = (): void => {
    const userId = this.data.convo?.user.id;
    if (userId) network.block(userId).then(() => this.openConvo(userId));
  }

  unblock = (): void => {
    const userId = this.data.convo?.user.id;
    if (userId) network.unblock(userId).then(() => this.openConvo(userId));
  }

  changeBlockBy = (userId: string): void => {
    if (userId == this.data.convo?.user.id) this.openConvo(userId);
  }

  sendTyping = throttle((user: string) => {
    this.socket.typing(user)
  }, 3000);

  receiveTyping = (userId: string, cancel?: boolean): void => {
    if (this.typing) {
      clearTimeout(this.typing.timeout);
      this.typing = undefined;
    }
    if (cancel !== true && this.data.convo?.user.id == userId) {
      this.typing = {
        user: userId,
        timeout: setTimeout(() => {
          if (this.data.convo?.user.id == userId) this.typing = undefined;
          redraw();
        }, 3000)
      };
    }
    redraw();
  }

  onReconnect = (): void => {
    this.data.convo && this.openConvo(this.data.convo.user.id);
    redraw();
  }
}

import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { ComposeAttrs, InputTag, SendErrorResponse } from './../interfaces';
import router from '../../../router';
import { FetchError } from '../../../http';

export default function oninit(vnode: Mithril.Vnode<ComposeAttrs>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const id = m.prop<string>();
  const errors = m.prop<SendErrorResponse>();
  id(vnode.attrs.id);

  function send(form: Array<InputTag>) {
    const recipient = form[0].value;
    const subject = form[1].value;
    const body = form[2].value;
    xhr.newThread(recipient, subject, body)
    .then(data => {
      console.log(data);
      if(data.ok) {
        router.set('/inbox/' + data.id)
      }
      else {
        redraw();
      }
    })
    .catch(handleSendError);
  }

  function handleSendError (error: FetchError) {
    error.response.json().then((errorResponse: SendErrorResponse) => {
      if (errorResponse && (errorResponse.username || errorResponse.subject || errorResponse.text)) {
        errors(errorResponse);
        redraw();
      }
      else
        throw error;
    }).catch(handleXhrError);
  }

  vnode.state = {
    id,
    send,
    errors
  };
}

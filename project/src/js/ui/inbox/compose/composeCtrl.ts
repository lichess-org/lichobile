import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { ComposeAttrs, SendErrorResponse, ComposeResponse, ComposeState } from '../interfaces';
import router from '../../../router';
import { FetchError } from '../../../http';

export default function oninit(vnode: Mithril.Vnode<ComposeAttrs>): void {
  helper.analyticsTrackView('Compose');

  socket.createDefault();

  const id = m.prop<string>();
  const errors = m.prop<SendErrorResponse>();
  id(vnode.attrs.id);

  function send(form: HTMLFormElement) {
    const recipient = (form[0] as HTMLInputElement).value;
    const subject = (form[1] as HTMLInputElement).value;
    const body = (form[2] as HTMLTextAreaElement).value;
    xhr.newThread(recipient, subject, body)
    .then((data: ComposeResponse) => {
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

  vnode.state = <ComposeState> {
    id,
    errors,
    send
  };
}

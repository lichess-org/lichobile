import * as h from 'mithril/hyperscript';
import * as helper from '../../helper';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import { ComposeAttrs, SendErrorResponse, ComposeResponse, ComposeState } from '../interfaces';
import { composeBody } from './composeView';
import router from '../../../router';
import { FetchError } from '../../../http';
import * as stream from 'mithril/stream';

const ComposeScreen: Mithril.Component<ComposeAttrs, ComposeState> = {

  oninit(vnode) {
    helper.analyticsTrackView('Compose');

    socket.createDefault();

    const id = stream<string>(vnode.attrs.userId);
    const errors = stream<SendErrorResponse>();

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

    window.addEventListener('native.keyboardhide', helper.onKeyboardHide);
    window.addEventListener('native.keyboardshow', helper.onKeyboardShow);

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
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.removeEventListener('native.keyboardshow', helper.onKeyboardShow);
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide);
  },

  view(vnode) {
    const headerCtrl = () => headerWidget(null,
      backButton(i18n('composeMessage'))
    );
    const bodyCtrl = () => composeBody(vnode.state);
    return layout.free(headerCtrl, bodyCtrl, undefined, undefined);
  }
}

export default ComposeScreen

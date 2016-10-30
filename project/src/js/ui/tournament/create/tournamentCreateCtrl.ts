import redraw from '../../../utils/redraw';
import router from '../../../router';
import * as xhr from '../tournamentXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import socket from '../../../socket';
import {CreateErrorResponse, TournamentCreateResponse} from '../interfaces';
import { FetchError } from '../../../http';
import { handleXhrError } from '../../../utils';

export default function oninit(vnode: Mithril.Vnode<{}>) {
  helper.analyticsTrackView('Tournament create');
  socket.createDefault();

  const errors = m.prop<CreateErrorResponse>();

  function create(form: HTMLFormElement) {
    const variant = (form[0] as HTMLInputElement).value;
    const position = (form[1] as HTMLInputElement).value;
    const mode = (form[2] as HTMLInputElement).value;
    const time = (form[3] as HTMLTextAreaElement).value;
    const increment = (form[4] as HTMLTextAreaElement).value;
    const duration = (form[5] as HTMLTextAreaElement).value;
    const timeToStart = (form[6] as HTMLTextAreaElement).value;
    xhr.create(variant, position, mode, time, increment, duration, timeToStart)
    .then((data: TournamentCreateResponse) => {
      router.set('/tournament/' + data.id)
    })
    .catch(handleCreateError);
  }

  function handleCreateError (error: FetchError) {
    error.response.json().then((errorResponse: CreateErrorResponse) => {
      console.log(errorResponse);
      if (errorResponse && (errorResponse.global || errorResponse.variant || errorResponse.mode || errorResponse.time || errorResponse.increment || errorResponse.duration || errorResponse.timeToStart)) {
        errors(errorResponse);
        redraw();
      }
      else
        throw error;
    }).catch(handleXhrError);
  }

  vnode.state = {
    create,
    errors
  };
}

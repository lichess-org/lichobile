import router from '../../router';
import {SearchState} from './interfaces';
import * as xhr from './searchXhr'

export default function oninit(vnode: Mithril.Vnode<{}, SearchState>) {

  vnode.state = {
    search
  };

  function search(form: HTMLFormElement) {
    const elements: HTMLCollection = form[0].elements as HTMLCollection;
    const variant = (elements[0] as HTMLInputElement).value;
    const position = (elements[1] as HTMLInputElement).value;
    const mode = (elements[2] as HTMLInputElement).value;
    const time = (elements[3] as HTMLTextAreaElement).value;
    const increment = (elements[4] as HTMLTextAreaElement).value;
    const duration = (elements[5] as HTMLTextAreaElement).value;
    const timeToStart = (elements[6] as HTMLTextAreaElement).value;
    /*
    xhr.search(variant, position, mode, time, increment, duration, timeToStart)
    .then((data: TournamentCreateResponse) => {
      close(null);
      router.set('/tournament/' + data.id)
    })
    .catch(handleXhrError);
    */
  }
}

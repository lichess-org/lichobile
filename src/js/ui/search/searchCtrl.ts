import router from '../../router';
import {SearchState} from './interfaces';
import * as xhr from './searchXhr'

export default function oninit(vnode: Mithril.Vnode<{}, SearchState>) {

  vnode.state = {
    search
  };

	const fields = ['players.a', 'players.b', 'players.white', 'players.black', 'players.winner', 'ratingMin', 'ratingMax', 'hasAi', 'source', 'perf', 'turnsMin', 'turnsMax', 'durationMin', 'durationMax', 'clock.initMin', 'clock.initMax', 'clock.incMin', 'clock.incMax', 'status', 'winnerColor', 'dateMin', 'dateMax', 'sort.field', 'sort.order'];

	function search(form: HTMLFormElement) {
    const elements: HTMLCollection = form[0].elements as HTMLCollection;
		const queryData = fields.map((name: string) => ({name: name, value: elements['name'].value}));
		/*
    xhr.search(queryData)
    .then((data: any) => {
      results(data);
    })
    .catch(handleXhrError);
    */
		}
}

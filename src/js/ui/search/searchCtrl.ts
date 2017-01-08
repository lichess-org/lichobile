import router from '../../router';
import {SearchState, SearchResult, SearchQuery} from './interfaces';
import * as xhr from './searchXhr'
import * as stream from 'mithril/stream';
import { handleXhrError } from '../../utils';

export default function oninit(vnode: Mithril.Vnode<{}, SearchState>) {

  const result = stream<SearchResult>();

  vnode.state = {
    search,
    result
  };

  const fields = ['players.a', 'players.b', 'players.white', 'players.black', 'players.winner', 'ratingMin', 'ratingMax', 'hasAi', 'source', 'perf', 'turnsMin', 'turnsMax', 'durationMin', 'durationMax', 'clock.initMin', 'clock.initMax', 'clock.incMin', 'clock.incMax', 'status', 'winnerColor', 'dateMin', 'dateMax', 'sort.field', 'sort.order'];

  function search(form: HTMLFormElement) {
    console.log(form);
    console.log(form[0]);
    console.log(form.elements);
    const elements: HTMLCollection = form.elements as HTMLCollection;
    const queryData = fields.reduce((acc, el) => buildQuery(elements, acc, el), {}) as SearchQuery;
		
    xhr.search(queryData)
    .then((data: SearchResult) => {
      result(data);
    })
    .catch(handleXhrError);
    
  }
}

function buildQuery (elements: HTMLCollection, acc: any, name: string) {
  if(elements[name]) {
    acc[name] = elements[name].value;
    return acc;
  }
  else {
    return acc;
  }
}

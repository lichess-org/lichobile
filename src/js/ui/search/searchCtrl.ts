import router from '../../router';
import {SearchState, SearchResult, SearchQuery, UserGameWithDate} from './interfaces';
import * as xhr from './searchXhr'
import * as stream from 'mithril/stream';
import { handleXhrError } from '../../utils';
import * as helper from '../helper';
import redraw from '../../utils/redraw';
import { ScrollState } from '../user/games';
import { toggleGameBookmark } from '../../xhr';

let cachedScrollState: ScrollState;

export default function oninit(vnode: Mithril.Vnode<{}, SearchState>) {
  helper.analyticsTrackView('Advanced search');
  const result = stream<SearchResult>();
  const games = stream<Array<UserGameWithDate>>();
  const lastQuery = stream<SearchQuery>();

  vnode.state = {
    search,
    result,
    games,
    bookmark,
    more
  };

  const fields = ['players.a', 'players.b', 'players.white', 'players.black', 'players.winner', 'ratingMin', 'ratingMax', 'hasAi', 'source', 'perf', 'turnsMin', 'turnsMax', 'durationMin', 'durationMax', 'clock.initMin', 'clock.initMax', 'clock.incMin', 'clock.incMax', 'status', 'winnerColor', 'dateMin', 'dateMax', 'sort.field', 'sort.order', 'analysed'];

  function search(form: HTMLFormElement) {
    const elements: HTMLCollection = form.elements as HTMLCollection;
    const queryData = fields.reduce((acc, el) => buildQuery(elements, acc, el), {}) as SearchQuery;
    lastQuery(queryData);
    console.log(queryData);
    xhr.search(queryData)
    .then((data: SearchResult) => {
      console.log(data);
      result(prepareData(data));
      games(result().paginator.currentPageResults);
      redraw();
    })
    .catch(handleXhrError);

  }

  function bookmark(id: string) {
    toggleGameBookmark(id);
  }

  function more() {
    const queryData = lastQuery();
    queryData.page = result().paginator.nextPage;
    console.log(queryData);
    xhr.search(queryData)
    .then((data: SearchResult) => {
      result(prepareData(data));
      games(games().concat(result().paginator.currentPageResults));
      console.log(data);
      redraw();
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

function prepareData(xhrData: SearchResult) {
  if (xhrData.paginator && xhrData.paginator.currentPageResults) {
    xhrData.paginator.currentPageResults.forEach(g => {
      g.date = window.moment(g.timestamp).calendar();
    });
  }
  return xhrData;
}

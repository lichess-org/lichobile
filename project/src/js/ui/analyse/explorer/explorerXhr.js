import { fetchJSON } from '../../../http';
import * as m from 'mithril';

const endpoint = 'https://expl.lichess.org';

export function openingXhr(variant, fen, config, withGames) {
  let url;
  const params = {
    fen,
    moves: 12
  };
  if (!withGames) {
    params.topGames = 0;
    params.recentGames = 0;
  }
  if (config.db.selected() === 'masters') url = '/master';
  else {
    url = '/lichess';
    params.variant = variant;
    params['speeds[]'] = config.speed.selected();
    params['ratings[]'] = config.rating.selected();
  }
  return fetchJSON(endpoint + url, {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: params
  });
}

export function tablebaseXhr(fen) {
  return m.request(endpoint + '/tablebase', {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: {
      fen: fen
    }
  });
}

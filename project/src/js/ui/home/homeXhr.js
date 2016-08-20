import { fetchJSON } from '../../http';

export function featured(feedback) {
  return fetchJSON('/tv', null, feedback);
}

export function dailyPuzzle() {
  return fetchJSON('/training/daily', null, true);
}

export function topPlayersOfTheWeek() {
  return fetchJSON('/player/top/week', null, true);
}

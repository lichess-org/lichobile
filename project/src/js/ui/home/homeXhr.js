import { request } from '../../http';

export function featured(feedback) {
  return request('/tv', null, feedback);
}

export function dailyPuzzle() {
  return request('/training/daily', null, true);
}

export function topPlayersOfTheWeek() {
  return request('/player/top/week', null, true);
}

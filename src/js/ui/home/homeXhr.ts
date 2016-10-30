import { fetchJSON } from '../../http';

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', null, feedback);
}

export function dailyPuzzle(): Promise<any> {
  return fetchJSON('/training/daily', null, true);
}

export function topPlayersOfTheWeek(): Promise<any> {
  return fetchJSON('/player/top/week', null, true);
}

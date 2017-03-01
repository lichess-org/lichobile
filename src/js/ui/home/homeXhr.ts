import { fetchJSON } from '../../http';
import { DailyPuzzle } from '../../lichess/interfaces';
import { OnlineGameData } from '../../lichess/interfaces/game';

export function featured(feedback: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv', null, feedback);
}

export function dailyPuzzle(): Promise<{ puzzle: DailyPuzzle }> {
  return fetchJSON('/training/daily', null, true);
}

export function topPlayersOfTheWeek(): Promise<any> {
  return fetchJSON('/player/top/week', null, true);
}

import i18n from '../i18n';
import { FetchError } from '../http';
import redraw from './redraw';

export const lichessSri = Math.random().toString(36).substring(2).slice(0, 10);

// game -> last pos fen
interface GamePosCached {
  fen: string
  orientation: Color
}

export const gamePosCache: Map<string, GamePosCached> = new Map()

export function loadLocalJsonFile(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200)
          resolve(JSON.parse(xhr.responseText));
        else
          reject(xhr)
      }
    }
    xhr.send(null);
  })
}

export function autoredraw(action: () => void): void {
  const res = action();
  redraw();
  return res;
}

export function hasNetwork(): boolean {
  return window.navigator.connection.type !== Connection.NONE;
}

export function isFetchError(error: Error | FetchError): error is FetchError {
  return (<FetchError>error).response !== undefined;
}

export function handleXhrError(error: Error | FetchError): void {
  if (!hasNetwork()) {
    window.plugins.toast.show(i18n('noInternetConnection'), 'short', 'center');
  } else {
    if (isFetchError(error)) {
      const status = error.response.status;
      let message: string;

      if (!status || status === 0)
        message = 'lichessIsUnreachable';
      else if (status === 401)
        message = 'unauthorizedError';
      else if (status === 404)
        message = 'resourceNotFoundError';
      else if (status === 503)
        message = 'lichessIsUnavailableError';
      else if (status >= 500)
        message = 'Server error.';
      else
        message = 'Error.';

      message = i18n(message);

      let promise: Promise<any>;
      try {
        promise = error.response.json();
      } catch (e) {
        promise = error.response.text();
      }

      promise.then((data: any) => {
        if (typeof data === 'string') {
          message += ` ${data}`;
        }
        else if (data.global && data.global.constructor === Array) {
          message += ` ${data.global[0]}`;
        }
        else if (typeof data.error === 'string') {
          message += ` ${data.error}`;
        }
        window.plugins.toast.show(message, 'short', 'center');
      })
    } else {
      // can be a type error in promise or unreachable network
      console.error(error);
    }
  }
}

export function serializeQueryParameters(obj: any): string {
  let str = '';
  for (const key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }
  return str;
}

function partialApply(fn: Function, args: Array<any>): Function {
  return fn.bind.apply(fn, [null].concat(args));
}

export function partialf(): Function {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
}

export function f(fn: Function, ...args: Array<any>) {
  return function() {
    fn.apply(fn, args);
  };
}

export function noop() {}

export function lightPlayerName(player?: any, withRating?: boolean) {
  if (player) {
    return (player.title ? player.title + ' ' + player.name : player.name) + (
      withRating ? ' (' + player.rating + ')' : '');
  } else {
    return 'Anonymous';
  }
}

// TODO
// this is too polymorphic to be typed... needs a complete refactoring
export function playerName(player: any, withRating: boolean = false): string {
  if (player.name || player.username || player.user) {
    let name = player.name || player.username || player.user.username;
    if (player.user && player.user.title) name = player.user.title + ' ' + name;
    if (withRating && (player.user || player.rating)) {
      name += ' (' + (player.rating || player.user.rating);
      if (player.provisional) name += '?';
      name += ')';
    }
    return name;
  }

  if (player.ai) {
    return aiName(player);
  }

  return 'Anonymous';
}

export function aiName(player: { ai: number }) {
  return i18n('aiNameLevelAiLevel', 'Stockfish', player.ai);
}

const perfIconsMap: {[index:string]: string} = {
  bullet: 'T',
  blitz: ')',
  classical: '+',
  correspondence: ';',
  chess960: '\'',
  kingOfTheHill: '(',
  threeCheck: '.',
  antichess: '@',
  atomic: '>',
  puzzle: '-',
  horde: '_',
  fromPosition: '*',
  racingKings: '',
  crazyhouse: ''
};

export function gameIcon(perf: string): string {
  return perfIconsMap[perf] || '8';
}

export function secondsToMinutes(sec: number): number {
  return sec === 0 ? sec : sec / 60;
}

export function tupleOf(x: number | string): [string, string] {
  return [x.toString(), x.toString()];
}

export function oppositeColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

export function caseInsensitiveSort(a: string, b: string): number {
  const alow = a.toLowerCase();
  const blow = b.toLowerCase();

  return alow > blow ? 1 : (alow < blow ? -1 : 0);
}

export function userFullNameToId(fullName: string): string {
  const split = fullName.split(' ');
  const id = split.length === 1 ? split[0] : split[1];
  return id.toLowerCase();
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function boardOrientation(data: OnlineGameData, flip?: boolean): 'black' | 'white' {
  if (data.game.variant.key === 'racingKings') {
    return flip ? 'black' : 'white';
  } else {
    return flip ? data.opponent.color : data.player.color;
  }
}

export function pad(num: number, size: number): string {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
}

export function formatTimeInSecs(seconds: number): string {
  let timeStr = '';
  const hours = Math.floor(seconds / 60 / 60);
  const mins = Math.floor(seconds / 60) - (hours * 60);
  const secs = seconds % 60;
  if (hours > 0) {
    timeStr = hours + ':' + pad(mins, 2) + ':' + pad(secs, 2);
  } else {
    timeStr = mins + ':' + pad(secs, 2);
  }

  return timeStr;
}

export function formatTournamentDuration(timeInMin: number): string {
  const hours = Math.floor(timeInMin / 60);
  const minutes = Math.floor(timeInMin - hours * 60);
  return (hours ? hours + 'H ' : '') + (minutes ? minutes + 'M' : '');
}

export function formatTournamentTimeControl(clock: TournamentClock): string {
  if (clock) {
    const min = secondsToMinutes(clock.limit);
    const t = min === 0.5 ? '½' : min === 0.75 ? '¾' : min.toString();
    return t + '+' + clock.increment;
  } else {
    return '∞';
  }
}

export function noNull<T>(v: T) {
  return v !== undefined && v !== null;
}

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((a: T[], b: T[]) => a.concat(b), []);
}

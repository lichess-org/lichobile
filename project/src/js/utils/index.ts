import i18n from '../i18n';
import { ResponseError } from '../http';
import redraw from './redraw';
import * as m from 'mithril';

export const lichessSri = Math.random().toString(36).substring(2);

export function loadLocalJsonFile(url: string): Promise<any> {
  let curXhr: XMLHttpRequest;
  return new Promise((resolve, reject) => {
    m.request({
      url,
      method: 'GET',
      config(xhr) {
        curXhr = xhr;
      }
    })
    .run((data: any) => resolve(data))
    .catch((error: Error) => {
      // workaround when xhr for local file has a 0 status it will
      // reject the promise and still have the response object
      if (curXhr.status === 0) {
        try {
          resolve(JSON.parse(curXhr.responseText));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(error);
      }
    });
  });
}

export function autoredraw(action: Function): void {
  const res = action();
  redraw();
  return res;
}

export function tellWorker(worker: Worker, topic: string, payload?: any): void {
  if (payload !== undefined) {
    worker.postMessage({ topic, payload });
  } else {
    worker.postMessage({ topic });
  }
}

export function askWorker(worker: Worker, msg: WorkerMessage): Promise<any> {
  return new Promise(function(resolve, reject) {
    function listen(e: MessageEvent) {
      if (e.data.topic === msg.topic) {
        worker.removeEventListener('message', listen);
        resolve(e.data.payload);
      } else if (e.data.topic === 'error' && e.data.payload.callerTopic === msg.topic) {
        worker.removeEventListener('message', listen);
        reject(e.data.payload.error);
      }
    }
    worker.addEventListener('message', listen);
    worker.postMessage(msg);
  });
}

export function hasNetwork(): boolean {
  return window.navigator.connection.type !== Connection.NONE;
}

export function handleXhrError(error: ResponseError): void {
  const status = error.response && error.response.status;

  if (!hasNetwork()) {
    window.plugins.toast.show(i18n('noInternetConnection'), 'short', 'center');
  } else {
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

    if (error.response) {
      let data: any;
      try {
        data = error.response.json();
      } catch (e) {
        data = error.response.text();
      }

      if (typeof data === 'string') {
        message += ` ${data}`;
      }
      else if (data.global && data.global.constructor === Array) {
        message += ` ${data.global[0]}`;
      }
      else if (typeof data.error === 'string') {
        message += ` ${data.error}`;
      }
    }

    window.plugins.toast.show(message, 'short', 'center');
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

export function playerName(player: Player, withRating: boolean = false): string {
  if (player.username || player.user) {
    let name = player.username || player.user.username;
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

export function aiName(player: any) {
  return i18n('aiNameLevelAiLevel', player.engineName || 'Stockfish', player.ai);
}

export function backHistory(): void {
  setViewSlideDirection('bwd');
  if (window.navigator.app && window.navigator.app.backHistory)
    window.navigator.app.backHistory();
  else
    window.history.go(-1);
}

// simple way to determine views animation direction
let viewSlideDirection = 'fwd';
export function setViewSlideDirection(d: string): void {
  viewSlideDirection = d;
}
export function getViewSlideDirection(): string {
  return viewSlideDirection;
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

export function tupleOf(x: number): [string, string] {
  return [x.toString(), x.toString()];
}

export function oppositeColor(color: 'white' | 'black'): 'white' | 'black' {
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

// Returns a random number between min (inclusive) and max (exclusive)
export function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function challengeTime(c: ChallengeClock): string {
  if (c.timeControl.type === 'clock') {
    return c.timeControl.show;
  } else if (c.timeControl.type === 'correspondence') {
    return i18n('nbDays', c.timeControl.daysPerTurn);
  } else {
    return '∞';
  }
}

export function boardOrientation(data: GameData, flip: boolean): 'black' | 'white' {
  if (data.game.variant.key === 'racingKings') {
    return flip ? 'black' : 'white';
  } else {
    return flip ? data.opponent.color : data.player.color;
  }
}

export function getBoardBounds(viewportDim: {vh: number, vw: number}, isPortrait: boolean, isIpadLike: boolean, isLandscapeSmall: boolean, mode: string): Dimensions  {
  const { vh, vw } = viewportDim;
  const top = 50;

  if (isPortrait) {
    const contentHeight = vh - 50;
    const pTop = 50 + (mode === 'game' ? ((contentHeight - vw - 40) / 2) : 0);
    return {
      top: pTop,
      right: vw,
      bottom: pTop + vw,
      left: 0,
      width: vw,
      height: vw
    };
  } else if (isIpadLike) {
    const wsSide = vh - top - (vh * 0.12);
    const wsTop = top + ((vh - wsSide - top) / 2);
    return {
      top: wsTop,
      right: wsSide,
      bottom: wsTop + wsSide,
      left: 0,
      width: wsSide,
      height: wsSide
    };
  } else if (isLandscapeSmall) {
    const smallTop = 45;
    const lSide = vh - smallTop;
    return {
      top: smallTop,
      right: lSide,
      bottom: smallTop + lSide,
      left: 0,
      width: lSide,
      height: lSide
    };
  } else {
    const lSide = vh - top;
    return {
      top,
      right: lSide,
      bottom: top + lSide,
      left: 0,
      width: lSide,
      height: lSide
    };
  }
}

export function variantReminder(el: HTMLElement, icon: string): void {
  const div = document.createElement('div');
  div.className = 'variant_reminder';
  div.dataset['icon'] = icon;
  el.appendChild(div);
  setTimeout(function() {
    const r = el.querySelector('.variant_reminder');
    if (r) {
      r.classList.add('gone');
      setTimeout(function() {
        if (el && r) el.removeChild(r);
      }, 600);
    }
  }, 800);
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

export function noNull(v: any) {
  return v !== undefined && v !== null;
}

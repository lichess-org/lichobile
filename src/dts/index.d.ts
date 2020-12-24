/// <reference path="jsx.d.ts" />
/// <reference path="lichess.d.ts" />
/// <reference path="rlite.d.ts" />
/// <reference path="shepherd.d.ts" />
/// <reference path="stockfish.d.ts" />
/// <reference path="signals.d.ts" />
/// <reference path="misc.d.ts" />
/// <reference path="mithril.d.ts" />

// Avoid conflicts between NodeJS's setTimeout and window.setTimeout
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;

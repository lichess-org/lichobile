import { CevalWork } from '../interfaces';
import { setOption, setVariant, convertFenForStockfish } from '../../../utils/stockfish';
import * as Signal from 'signals';

interface Opts {
  minDepth: number
  maxDepth: number
}

interface ExtendedNavigator extends Navigator {
  hardwareConcurrency: number
}

const output = new Signal();

export default function cevalEngine(opts: Opts) {
  // after a 'go' command, stockfish will be continue to emit until the 'bestmove'
  // message, reached by depth or after a 'stop' command
  // finished here means stockfish has emited the bestmove and is ready for
  // another command
  let finished = true;

  // stopped flag is true when a search has been interrupted before its end
  let stopped = false;

  // we may have several start requests queued while we wait for previous
  // eval to complete
  // we'll simply take the last request
  let startQueue: Array<CevalWork> = []

  function processOutput(text: string, work: CevalWork) {
    if (text.indexOf('bestmove') === 0) {
      console.info('stockfish analysis done', text)
      finished = true;
    }
    if (stopped) return;
    if (/currmovenumber|lowerbound|upperbound/.test(text)) return;
    console.log(text)
    const matches = text.match(/depth (\d+) .*score (cp|mate) ([-\d]+) .*nps (\d+) .*pv (.+)/);
    if (!matches) return;
    const depth = parseInt(matches[1]);
    if (depth < opts.minDepth) return;
    let cp: number;
    let mate: number;
    if (matches[2] === 'cp') cp = parseFloat(matches[3]);
    else mate = parseFloat(matches[3]);
    if (work.ply % 2 === 1) {
      if (matches[2] === 'cp') cp = -cp;
      else mate = -mate;
    }
    const nps = parseInt(matches[4], 10);
    const best = matches[5].split(' ')[0];
    work.emit({
      work,
      ceval: {
        depth,
        maxDepth: opts.maxDepth,
        cp,
        mate,
        best,
        nps
      }
    });
  }

  function stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (finished) {
        stopped = true;
        resolve();
      } else {
        function listen(msg: string) {
          if (msg.indexOf('bestmove') === 0) {
            output.remove(listen);
            finished = true;
            resolve();
          }
        }
        output.add(listen);
        if (!stopped) {
          stopped = true;
          send('stop');
        }
      }
    })
  }

  function launchEval(work: CevalWork) {
    const fen = convertFenForStockfish(work.initialFen);

    output.removeAll();
    output.add((msg: string) => processOutput(msg, work));

    stopped = false;
    finished = false;

    return setOption('Threads',
      Math.ceil(((navigator as ExtendedNavigator).hardwareConcurrency || 1) / 2)
    )
    .then(() => send(['position', 'fen', fen, 'moves', work.moves].join(' ')))
    .then(() => send('go depth ' + opts.maxDepth));
  }

  function doStart() {
    const work = startQueue.pop();
    if (work) {
      launchEval(work);
      startQueue = [];
    }
    else console.error('no work queued to start eval');
  }

  return {
    init(variant: VariantKey) {
      return Stockfish.init()
      .then(() => init(variant))
      // stockfish plugin will reject if already inited
      .catch(() => {
        return Stockfish.exit()
        .then(() => Stockfish.init(), () => Stockfish.init())
        .then(() => init(variant))
      })
      .catch(console.error.bind(console));
    },

    start(work: CevalWork) {
      startQueue.push(work);
      stop().then(doStart);
    },

    stop,

    exit() {
      output.removeAll();
      return Stockfish.exit();
    }
  };
}

function init(variant: VariantKey) {
  Stockfish.output(output.dispatch);
  return send('uci')
  .then(() => setOption('Ponder', 'false'))
  .then(() => setVariant(variant));
}

function send(text: string) {
  console.info('stockfish send', text)
  return Stockfish.cmd(text);
}

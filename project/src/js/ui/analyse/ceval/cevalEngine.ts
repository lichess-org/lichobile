import { CevalWork } from '../interfaces';

export default function cevalEngine(opts: any) {

  function processOutput(text: string, work: CevalWork) {
    if (/currmovenumber|lowerbound|upperbound/.test(text)) return;
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

  return {
    init(variant: VariantKey) {
      return Stockfish.init()
      .then(() => init(variant))
      // stockfish plugin will reject if already inited
      .catch(() => {
        return Stockfish.exit()
        .then(() => Stockfish.init(), () => Stockfish.init())
        .then(() => init(variant));
      })
      .catch(console.error.bind(console));
    },

    start(work: CevalWork) {
      send(['position', 'fen', work.position, 'moves', work.moves].join(' '))
      .then(() => send('go depth ' + opts.maxDepth));

      Stockfish.output(function(msg) {
        // console.log(msg);
        processOutput(msg, work);
      });
    },

    stop() {
      send('stop');
    },

    exit() {
      return Stockfish.exit();
    }
  };
}

function init(variant: VariantKey) {
  return send('uci')
  .then(() => setOption('Ponder', 'false'))
  .then(() => prepare(variant));
}

function send(text: string) {
  return Stockfish.cmd(text);
}

function setOption(name: string, value: string | boolean) {
  return Stockfish.cmd(`setoption name ${name} value ${value}`);
}

function prepare(variant: VariantKey) {
  return Promise.all([
    setOption('UCI_Chess960', variant === 'chess960'),
    setOption('UCI_KingOfTheHill', variant === 'kingOfTheHill'),
    setOption('UCI_3Check', variant === 'threeCheck'),
    setOption('UCI_Atomic', variant === 'atomic'),
    setOption('UCI_Horde', variant === 'horde'),
    setOption('UCI_Race', variant === 'racingKings')
    // setOption('UCI_House', variant === Crazyhouse)
  ]);
}

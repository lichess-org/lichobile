export default function cevalEngine(opts) {

  function processOutput(text, work) {
    if (/currmovenumber|lowerbound|upperbound/.test(text)) return;
    const matches = text.match(/depth (\d+) .*score (cp|mate) ([-\d]+) .*pv (.+)/);
    if (!matches) return;
    const depth = parseInt(matches[1]);
    if (depth < opts.minDepth) return;
    var cp, mate;
    if (matches[2] === 'cp') cp = parseFloat(matches[3]);
    else mate = parseFloat(matches[3]);
    if (work.ply % 2 === 1) {
      if (matches[2] === 'cp') cp = -cp;
      else mate = -mate;
    }
    const best = matches[4].split(' ')[0];
    work.emit({
      work,
      ceval: {
        depth,
        cp,
        mate,
        best
      }
    });
  }

  return {
    init(variant, cb) {
      window.Stockfish.init(() => {
        setOption('Ponder', 'false');
        prepare(variant);
        cb();
      });
    },

    start(work) {
      send(['position', 'fen', work.position, 'moves', work.moves].join(' '));
      send('go depth ' + opts.maxDepth);
      window.Stockfish.output(function(msg) {
        console.log(msg);
        processOutput(msg, work);
      });
    },

    stop() {
      send('stop');
    },

    exit() {
      window.Stockfish.exit();
    }
  };
}

function send(text) {
  window.Stockfish.cmd(text);
}

function setOption(name, value) {
  window.Stockfish.cmd(`setoption name ${name} value ${value}`);
}

function prepare(variant) {
  setOption('UCI_Chess960', variant === 'chess960');
  // setoption('UCI_House', variant === Crazyhouse);
  // setoption('UCI_KingOfTheHill', variant === KingOfTheHill);
  // setoption('UCI_Race', variant === RacingKings);
  // setoption('UCI_3Check', variant === ThreeCheck);
  // setoption('UCI_Atomic', variant === Atomic);
  // setoption('UCI_Horde', variant === Horde);
}

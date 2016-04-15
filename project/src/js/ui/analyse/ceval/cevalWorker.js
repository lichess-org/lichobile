import m from 'mithril';

export default function cevalWorker(opts, name) {

  const instance = new Worker(opts.path);
  const switching = m.prop(false); // when switching to new work, info for previous can be emited

  function send(text) {
    instance.postMessage(text);
  }

  function setOption(opt, value) {
    send(`setoption name ${opt} value ${value}`);
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

  function processOutput(text, work) {
    if (/currmovenumber|lowerbound|upperbound/.test(text)) return;
    const matches = text.match(/depth (\d+) .*score (cp|mate) ([-\d]+) .*pv (.+)/);
    if (!matches) return;
    const depth = parseInt(matches[1]);
    if (switching() && depth > 1) return; // stale info for previous work
    switching(false); // got depth 1, it's now computing the current work
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
      },
      name
    });
  }

  // warmup
  send('uci');
  prepare('variant');

  return {
    start(work) {
      switching(true);
      send(['position', 'fen', work.position, 'moves', work.moves].join(' '));
      send('go depth ' + opts.maxDepth);
      instance.onmessage = function(msg) {
        processOutput(msg.data, work);
      };
    },

    stop() {
      send('stop');
      switching(true);
    },

    terminate() {
      if (instance) instance.terminate();
    }
  };
}

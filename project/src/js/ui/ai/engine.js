const maxMoveTime = 8000;
const maxSkill = 20;
const levelToDepth = {
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 5,
  6: 8,
  7: 13,
  8: 21
};

const bestmoveRegExp = /^bestmove (\w{4})/;

export default function(ctrl) {
  let level = 1;

  return {
    init() {
      return Stockfish.init()
      .then(onInit)
      .catch(() => {
        // trying to init an already init stockfish will return an error
        return Stockfish.exit()
        .then(() => Stockfish.init(), () => Stockfish.init())
        .then(onInit);
      })
      .catch(console.error.bind(console));
    },

    search(initialFen, moves) {
      Stockfish.output(function(msg) {
        // console.log(msg);
        const bestmoveRegExpMatch = msg.match(bestmoveRegExp);
        if (bestmoveRegExpMatch) {
          ctrl.onEngineBestMove(bestmoveRegExpMatch[1]);
        }
      });

      // console.info('engine search pos: ', `position fen ${initialFen} moves ${moves}`);
      // console.info(`go movetime ${moveTime(level)} depth ${depth(level)}`);
      cmd(`position fen ${initialFen} moves ${moves}`)
      .then(() => cmd(`go movetime ${moveTime(level)} depth ${depth(level)}`));
    },

    setLevel(l) {
      level = l;
      // console.info('Skill Level', skill(level));
      return setOption('Skill Level', skill(level));
    },

    prepare(variant) {
      return Promise.all([
        setOption('UCI_Chess960', variant === 'chess960'),
        setOption('UCI_KingOfTheHill', variant === 'kingOfTheHill'),
        setOption('UCI_3Check', variant === 'threeCheck')
        // setOption('UCI_House', variant === Crazyhouse),
        // setOption('UCI_Atomic', variant === Atomic),
        // setOption('UCI_Horde', variant === Horde),
        // setOption('UCI_Race', variant === RacingKings)
      ]);
    },

    exit() {
      return Stockfish.exit();
    }
  };
}

function onInit() {
  return cmd('uci')
  .then(() => setOption('Ponder', 'false'));
}

function setOption(name, value) {
  return Stockfish.cmd(`setoption name ${name} value ${value}`);
}

function cmd(text) {
  return Stockfish.cmd(text);
}

function moveTime(level) {
  return level * maxMoveTime / 8;
}

function skill(level) {
  return Math.round((level - 1) * (maxSkill / 7));
}

function depth(level) {
  return levelToDepth[level];
}

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

export default function(ctrl) {
  let level = 1;
  const bestmoveRegExp = /^bestmove (\w{4})/;

  return {
    init(cb) {
      Stockfish.init(function() {

        Stockfish.output(function(msg) {
          const bestmoveRegExpMatch = msg.match(bestmoveRegExp);
          if (bestmoveRegExpMatch) {
            console.log(msg);
            ctrl.onEngineBestMove(bestmoveRegExpMatch[1]);
          }
        });

        setOption('Ponder', 'false');

        cb();
      });
    },

    search(initialFen, moves) {
      console.info('engine search pos: ', `position fen ${initialFen} moves ${moves}`);
      Stockfish.cmd(`position fen ${initialFen} moves ${moves}`);
      Stockfish.cmd(`go movetime ${moveTime(level)} depth ${depth(level)}`);
    },

    setLevel(l) {
      level = l;
      setOption('Skill Level', skill(level));
    },

    prepare(variant) {
      setOption('UCI_Chess960', variant === 'chess960');
      // setoption('UCI_House', variant === Crazyhouse);
      // setoption('UCI_KingOfTheHill', variant === KingOfTheHill);
      // setoption('UCI_Race', variant === RacingKings);
      // setoption('UCI_3Check', variant === ThreeCheck);
      // setoption('UCI_Atomic', variant === Atomic);
      // setoption('UCI_Horde', variant === Horde);
    },

    exit() {
      Stockfish.exit();
    }
  };
}

function setOption(name, value) {
  Stockfish.cmd(`setoption name ${name} value ${value}`);
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

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
    init() {
      return window.Stockfish.init()
      .then(function() {

        window.Stockfish.output(function(msg) {
          console.log(msg);
          const bestmoveRegExpMatch = msg.match(bestmoveRegExp);
          if (bestmoveRegExpMatch) {
            console.info(msg);
            ctrl.onEngineBestMove(bestmoveRegExpMatch[1]);
          }
        });

      })
      .then(() => setOption('Ponder', 'false'))
      .catch(console.info.bind(console));
    },

    search(initialFen, moves) {
      console.info('engine search pos: ', `position fen ${initialFen} moves ${moves}`);
      console.info(`go movetime ${moveTime(level)} depth ${depth(level)}`);
      return cmd(`position fen ${initialFen} moves ${moves}`)
      .then(() => cmd(`go movetime ${moveTime(level)} depth ${depth(level)}`));
    },

    setLevel(l) {
      level = l;
      console.info('Skill Level', skill(level));
      return setOption('Skill Level', skill(level));
    },

    prepare(variant) {
      return setOption('UCI_Chess960', variant === 'chess960');
      // setoption('UCI_House', variant === Crazyhouse);
      // setoption('UCI_KingOfTheHill', variant === KingOfTheHill);
      // setoption('UCI_Race', variant === RacingKings);
      // setoption('UCI_3Check', variant === ThreeCheck);
      // setoption('UCI_Atomic', variant === Atomic);
      // setoption('UCI_Horde', variant === Horde);
    },

    exit() {
      return window.Stockfish.exit();
    }
  };
}

function setOption(name, value) {
  return window.Stockfish.cmd(`setoption name ${name} value ${value}`);
}

function cmd(text) {
  return window.Stockfish.cmd(text);
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

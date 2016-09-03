import { AiRoundInterface } from '../shared/round';

interface LevelToDepht {
  [index: number]: number
}

const maxMoveTime = 8000;
const maxSkill = 20;
const levelToDepth: LevelToDepht = {
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

export default function(ctrl: AiRoundInterface) {
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

    search(initialFen: string, moves: string) {
      Stockfish.output((msg: string) => {
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

    setLevel(l: number) {
      level = l;
      return setOption('Skill Level', String(skill(level)));
    },

    prepare(variant: VariantKey) {
      return Promise.all([
        setOption('UCI_Chess960', String(variant === 'chess960')),
        setOption('UCI_KingOfTheHill', String(variant === 'kingOfTheHill')),
        setOption('UCI_3Check', String(variant === 'threeCheck')),
        // setOption('UCI_House', variant === Crazyhouse),
        setOption('UCI_Atomic', String(variant === 'atomic')),
        setOption('UCI_Horde', String(variant === 'horde')),
        setOption('UCI_Race', String(variant === 'racingKings'))
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

function setOption(name: string, value: string) {
  return Stockfish.cmd(`setoption name ${name} value ${value}`);
}

function cmd(text: string) {
  return Stockfish.cmd(text);
}

function moveTime(level: number) {
  return level * maxMoveTime / 8;
}

function skill(level: number) {
  return Math.round((level - 1) * (maxSkill / 7));
}

function depth(level: number) {
  return levelToDepth[level];
}

import { Plugins } from '@capacitor/core'
import { AiRoundInterface } from '../shared/round'
import { send, getNbCores, setOption, setVariant } from '../../utils/stockfish'

interface LevelToDepth {
  [index: number]: number
}

const maxMoveTime = 8000
const maxSkill = 20
const levelToDepth: LevelToDepth = {
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 5,
  6: 8,
  7: 13,
  8: 21
}

export interface EngineInterface {
  init(): Promise<void>
  newGame(): Promise<void>
  search(initialFen: string, moves: string): void
  setLevel(level: number): Promise<void>
  prepare(variant: VariantKey): Promise<void>
  exit(): Promise<void>
}

export default function(ctrl: AiRoundInterface): EngineInterface {
  let level = 1

  return {
    init() {
      Plugins.Stockfish.addListener('output', ({ line }: { line: string }) => {
        console.debug('[stockfish >>] ' + line)
        const match = line.match(/^bestmove (\w{4})|^bestmove ([PNBRQ]@\w{2})/)
        if (match) {
          if (match[1]) ctrl.onEngineMove(match[1])
          else if (match[2]) ctrl.onEngineDrop(match[2])
        }
      })

      return Plugins.Stockfish.start()
      .then(onInit)
      .catch(console.error.bind(console))
    },

    newGame() {
      return send('ucinewgame')
    },

    search(initialFen: string, moves: string) {
      // console.info('engine search pos: ', `position fen ${initialFen} moves ${moves}`)
      send(`position fen ${initialFen} moves ${moves}`)
      .then(() => send(`go movetime ${moveTime(level)} depth ${depth(level)}`))
    },

    setLevel(l: number) {
      level = l
      return setOption('Skill Level', String(skill(level)))
    },

    prepare(variant: VariantKey) {
      return setVariant(variant)
    },

    exit() {
      Plugins.Stockfish.removeAllListeners()
      return Plugins.Stockfish.exit()
    }
  }
}

function onInit() {
  return send('uci')
  .then(() => setOption('Threads', getNbCores()))
  .then(async () => {
    const { value: mem }= await Plugins.Stockfish.getMaxMemory()
    setOption('Hash', mem)
  })
  .then(() => setOption('Ponder', 'false'))
}

function moveTime(level: number) {
  return level * maxMoveTime / 8
}

function skill(level: number) {
  return Math.round((level - 1) * (maxSkill / 7))
}

function depth(level: number) {
  return levelToDepth[level]
}

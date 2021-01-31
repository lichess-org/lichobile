import { Capacitor } from '@capacitor/core'
import { AiRoundInterface } from '../shared/round'
import { StockfishWrapper, getNbCores, getMaxMemory } from '../../stockfish'

export default class Engine {
  private level = 1
  private stockfish: StockfishWrapper
  private isInit = false
  private listener: (e: Event) => void

  constructor(readonly ctrl: AiRoundInterface, readonly variant: VariantKey) {
    this.listener = (e: Event) => {
      const line = (e as any).output
      const bmMatch = line.match(/^bestmove (\w{4})|^bestmove ([PNBRQ]@\w{2})/)
      if (bmMatch) {
        if (bmMatch[1]) this.ctrl.onEngineMove(bmMatch[1])
        else if (bmMatch[2]) this.ctrl.onEngineDrop(bmMatch[2])
      }
    }
    this.stockfish = new StockfishWrapper(variant)
  }

  public async init(): Promise<void> {
    try {
      if (!this.isInit) {
        await this.stockfish.start()
        this.isInit = true
        window.addEventListener('stockfish', this.listener, { passive: true })
        await this.stockfish.setVariant()
        await this.stockfish.setOption('UCI_AnalyseMode', false)
        await this.stockfish.setOption('UCI_LimitStrength', true)
        await this.stockfish.setOption('Threads', getNbCores())
        const mem = await getMaxMemory()
        if (Capacitor.platform !== 'web') {
          await this.stockfish.setOption('Hash', mem)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  public async newGame(): Promise<void> {
    await this.stockfish.send('ucinewgame')
    await this.stockfish.setOption('UCI_AnalyseMode', false)
    await this.stockfish.setOption('UCI_LimitStrength', true)
  }

  public async search(initialFen: string, moves: string): Promise<void> {
    // console.info('engine search pos: ', `position fen ${initialFen} moves ${moves}`)
    await this.stockfish.send(`position fen ${initialFen} moves ${moves}`)
    await this.stockfish.send(`go movetime ${moveTime(this.level)} depth ${depth(this.level)}`)
  }

  public async setLevel(l: number): Promise<void> {
    this.level = l
    return Capacitor.platform === 'ios' || Capacitor.platform === 'android' ?
      this.stockfish.setOption('UCI_Elo', elo(this.level)) :
      this.stockfish.setOption('Skill Level', String(skill(this.level)))
  }

  public async exit(): Promise<void> {
    window.removeEventListener('stockfish', this.listener, false)
    return this.stockfish.exit()
  }
}

const maxMoveTime = 5000
const maxSkill = 20
const levelToDepth: Record<number, number> = {
  1: 5,
  2: 5,
  3: 5,
  4: 5,
  5: 5,
  6: 8,
  7: 13,
  8: 22
}
const eloTable: Record<number, number> = {
  1: 800,
  2: 1100,
  3: 1400,
  4: 1700,
  5: 2000,
  6: 2300,
  7: 2700,
  8: 3000,
}

function elo(level: number) {
  return String(eloTable[level])
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

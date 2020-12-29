import { Plugins } from '@capacitor/core'
import { VariantKey } from './lichess/interfaces/variant'
import { isVariant } from './lichess/variant'

export interface StockfishPlugin {
  addListener(event: 'output', callback: (v: { line: string }) => void): void
  removeAllListeners(): void
  getMaxMemory(): Promise<{ value: number }>
  start(): Promise<void>
  cmd(options: { cmd: string }): Promise<void>
  exit(): Promise<void>
}

const StockfishPlugin = Plugins.Stockfish as StockfishPlugin

export class Stockfish {
  public plugin: StockfishPlugin

  constructor(readonly variant: VariantKey) {
    // todo implem variant
    this.plugin = isVariant(variant) ? StockfishPlugin : StockfishPlugin
  }

  public addListener(callback: (line: string) => void) {
    this.plugin.removeAllListeners()
    this.plugin.addListener('output', ({ line }) => {
      console.debug('[stockfish >>] ' + line)
      callback(line)
    })
  }

  public send(text: string): Promise<void> {
    console.debug('[stockfish <<] ' + text)
    return this.plugin.cmd({ cmd: text })
  }

  public setOption(name: string, value: string | number | boolean): Promise<void> {
    return this.send(`setoption name ${name} value ${value}`)
  }

  public setVariant(): Promise<void> {
    if (isVariant(this.variant)) {
      if (this.variant === 'chess960')
        return this.setOption('UCI_Chess960', true)
      else if (this.variant === 'antichess')
        return this.setOption('UCI_Variant', 'giveaway')
      else
        return this.setOption('UCI_Variant', this.variant.toLowerCase())
    }

    return Promise.resolve()
  }
}

const memPromise = StockfishPlugin.getMaxMemory().then(r => r.value)

export function getMaxMemory(): Promise<number> {
  return memPromise
}

export function getNbCores(): number {
  const cores = window.deviceInfo.cpuCores
  return cores > 2 ? cores - 1 : 1
}

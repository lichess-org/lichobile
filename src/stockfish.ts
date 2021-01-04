import { Plugins } from '@capacitor/core'
import { VariantKey } from './lichess/interfaces/variant'

export interface StockfishPlugin {
  addListener(event: 'output', callback: (v: { line: string }) => void): void
  removeAllListeners(): void
  getMaxMemory(): Promise<{ value: number }>
  start(): Promise<void>
  cmd(options: { cmd: string }): Promise<void>
  exit(): Promise<void>
}

const StockfishPlugin = Plugins.Stockfish as StockfishPlugin

export class StockfishWrapper {
  constructor(readonly variant: VariantKey) { }

  public addListener(callback: (line: string) => void): void {
    if (this.isVariant()) {
      window.Stockfish.output((line: string) => {
        console.debug('[stockfish >>] ' + line)
        callback(line)
      })
    } else {
      StockfishPlugin.removeAllListeners()
      StockfishPlugin.addListener('output', ({ line }) => {
        console.debug('[stockfish >>] ' + line)
        callback(line)
      })
    }
  }

  public start(): Promise<void> {
    if (this.isVariant()) {
      return window.Stockfish.init()
    } else {
      return StockfishPlugin.start()
    }
  }

  public send(text: string): Promise<void> {
    console.debug('[stockfish <<] ' + text)
    if (this.isVariant()) {
      return window.Stockfish.cmd(text)
    } else {
      return StockfishPlugin.cmd({ cmd: text })
    }
  }

  public setOption(name: string, value: string | number | boolean): Promise<void> {
    return this.send(`setoption name ${name} value ${value}`)
  }

  public setVariant(): Promise<void> {
    if (this.isVariant()) {
      if (this.variant === 'antichess')
        return this.setOption('UCI_Variant', 'giveaway')
      else
        return this.setOption('UCI_Variant', this.variant.toLowerCase())
    }

    if (this.variant === 'chess960') {
      return this.setOption('UCI_Chess960', true)
    }

    return Promise.resolve()
  }

  public exit(): Promise<void> {
    if (this.isVariant()) {
      return window.Stockfish.exit()
    } else {
      StockfishPlugin.removeAllListeners()
      return StockfishPlugin.exit()
    }
  }

  private isVariant() {
    return !(
      this.variant === 'standard' ||
      this.variant === 'fromPosition' ||
      this.variant === 'chess960'
    )
  }
}

export function getMaxMemory(): number {
  return window.deviceInfo.stockfishMaxMemory
}

export function getNbCores(): number {
  const cores = window.deviceInfo.cpuCores
  return cores > 2 ? cores - 1 : 1
}

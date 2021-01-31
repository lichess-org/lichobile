import { Capacitor, Plugins } from '@capacitor/core'
import { VariantKey } from './lichess/interfaces/variant'

export interface StockfishPlugin {
  getMaxMemory(): Promise<{ value: number }>
  start(): Promise<void>
  cmd(options: { cmd: string }): Promise<void>
  exit(): Promise<void>
}

const StockfishVariantsPlugin = Plugins.StockfishVariants as StockfishPlugin
const StockfishPlugin = Plugins.Stockfish as StockfishPlugin

export class StockfishWrapper {
  private plugin: StockfishPlugin

  constructor(readonly variant: VariantKey) {
    this.plugin = Capacitor.platform === 'android' && !this.isVariant() ?
      StockfishPlugin : StockfishVariantsPlugin
  }

  public async start(): Promise<{ engineName: string }> {
    return new Promise((resolve) => {
      let engineName = 'Stockfish'
      const listener = (e: Event) => {
        const line = (e as any).output
        console.debug('[stockfish >>] ' + line)
        if (line.startsWith('id name ')) {
          engineName = line.substring('id name '.length)
        }
        if (line.startsWith('uciok')) {
          window.removeEventListener('stockfish', listener, false)
          resolve({ engineName })
        }
      }
      window.addEventListener('stockfish', listener, { passive: true })
      this.plugin.start()
      .then(() => this.send('uci'))
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
    if (this.isVariant()) {
      if (this.variant === 'threeCheck')
        return this.setOption('UCI_Variant', '3check')
      else
        return this.setOption('UCI_Variant', this.variant.toLowerCase())
    } else {
      return this.setOption('UCI_Chess960', 'chess960' === this.variant)
    }
  }

  public exit(): Promise<void> {
    return this.plugin.exit()
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

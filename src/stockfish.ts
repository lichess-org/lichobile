import { Capacitor, registerPlugin } from '@capacitor/core'
import { Stockfish, StockfishPlugin as IStockfishPlugin } from 'capacitor-stockfish'
import { VariantKey } from './lichess/interfaces/variant'

const StockfishVariants = registerPlugin<IStockfishPlugin>('StockfishVariants', {
  web: () => import('./stockfishVariantsWeb').then(m => new m.StockfishVariantsWeb()),
})

export class StockfishPlugin {
  private plugin: IStockfishPlugin

  constructor(readonly variant: VariantKey) {
    this.plugin = Capacitor.getPlatform() === 'android' && !this.isVariant() ?
      Stockfish : StockfishVariants
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

  public isReady(): Promise<void> {
    return new Promise((resolve) => {
      const listener = (e: Event) => {
        const line = (e as any).output
        if (line.startsWith('readyok')) {
          window.removeEventListener('stockfish', listener, false)
          resolve()
        }
      }
      window.addEventListener('stockfish', listener, { passive: true })
      this.send('isready')
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
      if (Capacitor.getPlatform() !== 'web' && this.variant === 'threeCheck')
        return this.setOption('UCI_Variant', '3check')
      if (Capacitor.getPlatform() === 'web' && this.variant === 'antichess')
        return this.setOption('UCI_Variant', 'giveaway')
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

export async function getMaxMemory(): Promise<number> {
  return Promise.resolve(window.deviceInfo.stockfishMaxMemory)
}

export function getNbCores(): number {
  const cores = window.deviceInfo.cpuCores
  return cores > 2 ? cores - 1 : 1
}


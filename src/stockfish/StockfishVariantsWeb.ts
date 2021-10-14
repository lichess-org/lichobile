import { StockfishPlugin } from 'capacitor-stockfish-variants/dist/esm/definitions'
import { WebPlugin } from '@capacitor/core'

export class StockfishVariantsWeb extends WebPlugin implements StockfishPlugin {
  private worker?: Worker

  constructor() {
    super({
      name: 'StockfishVariants',
      platforms: ['web']
    })
  }

  async getMaxMemory(): Promise<{ value: number }> {
    return Promise.resolve({ value: 1024 })
  }

  async start() {
    return new Promise((resolve) => {
      if (this.worker) {
        setTimeout(resolve, 1)
      } else {
        this.worker = new Worker('../stockfish.js')
        this.worker.onmessage = msg => {

          const ev: any = new Event('stockfish')
          ev['output'] = msg.data
          window.dispatchEvent(ev)
        }
        setTimeout(resolve, 1)
      }
    }).then(() => {})
  }

  async cmd({ cmd }: { cmd: string }) {
    return new Promise((resolve) => {
      if (this.worker) this.worker.postMessage(cmd)
      setTimeout(resolve, 1)
    }).then(() => {})
  }

  async exit() {
    return new Promise((resolve) => {
      if (this.worker) {
        this.worker.terminate()
        this.worker = undefined
      }
      setTimeout(resolve, 1)
    }).then(() => {})
  }
}

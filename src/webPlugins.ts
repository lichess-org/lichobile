import { Capacitor, WebPlugin, registerWebPlugin, PluginListenerHandle, ListenerCallback } from '@capacitor/core'
// custom web plugin registration done here for now
// because importing code from node_modules causes capacitor runtime code to
// be included twice

if (Capacitor.platform === 'web') {

  // Stockfish
  class StockfishWeb extends WebPlugin {
    private worker?: Worker
    private listener?: ListenerCallback

    constructor() {
      super({
        name: 'StockfishVariants',
        platforms: ['web']
      })
    }

    addListener(_: string, callback: ListenerCallback): PluginListenerHandle {
      this.listener = callback
      if (this.worker) {
        this.worker.onmessage = msg => {
          if (this.listener) this.listener({ line: msg.data })
        }
      }

      return {
        remove: () => {
          this.listener = undefined
          if (this.worker) {
            this.worker.onmessage = null
          }
        }
      }
    }

    removeAllListeners(): void {
      this.listener = undefined
      if (this.worker) this.worker.onmessage = null
    }

    async getMaxMemory(): Promise<number> {
      return 1024
    }

    async start() {
      return new Promise((resolve) => {
        if (this.worker) {
          this.worker.onmessage = msg => {
            if (this.listener) this.listener({ line: msg.data })
          }
          setTimeout(resolve, 1)
        } else {
          this.worker = new Worker('../stockfish.js')
          this.worker.onmessage = msg => {
            if (this.listener) this.listener({ line: msg.data })
          }
          setTimeout(resolve, 1)
        }
      })
    }

    async cmd({ cmd }: { cmd: string }) {
      return new Promise((resolve) => {
        if (this.worker) this.worker.postMessage(cmd)
          setTimeout(resolve, 1)
      })
    }

    async exit() {
      return new Promise((resolve) => {
        if (this.worker) {
          this.worker.terminate()
          this.worker = undefined
        }
        setTimeout(resolve, 1)
      })
    }
  }
  const stockfishWeb = new StockfishWeb()
  registerWebPlugin(stockfishWeb)

  // SoundEffect
  class SoundEffectWeb extends WebPlugin {

    private audioMap: { [id: string]: HTMLAudioElement | undefined } = {}

    constructor() {
      super({
        name: 'SoundEffect',
        platforms: ['web']
      })
    }

    async loadSound({ id, path }: { id: string, path: string }): Promise<void> {
      const audio = new Audio()
      audio.setAttribute('src', path)
      audio.load()
      this.audioMap[id] = audio
    }

    async play({ id }: { id: string }): Promise<void> {
      const audio = this.audioMap[id]
      if (audio) audio.play()
    }
  }
  const SoundEffect = new SoundEffectWeb()
  registerWebPlugin(SoundEffect)
}

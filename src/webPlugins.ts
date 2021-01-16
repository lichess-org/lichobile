import { Capacitor, WebPlugin, registerWebPlugin, PluginListenerHandle, ListenerCallback } from '@capacitor/core'
// custom web plugin registration done here for now
// because importing code from node_modules causes capacitor runtime code to
// be included twice

if (Capacitor.platform === 'web') {

  // Stockfish
  class StockfishWeb extends WebPlugin {
    private worker?: Worker
    private outputListeners: Set<ListenerCallback> = new Set()

    constructor() {
      super({
        name: 'StockfishVariants',
        platforms: ['web']
      })
    }

    addListener(_: string, callback: ListenerCallback): PluginListenerHandle {
      this.outputListeners.add(callback)

      return {
        remove: () => {
          this.outputListeners.delete(callback)
        }
      }
    }

    removeAllListeners(): void {
      this.outputListeners.clear()
    }

    notifyListeners(_: string, data: unknown) {
      for (const callback of this.outputListeners) callback(data)
    }

    async getMaxMemory(): Promise<number> {
      return 1024
    }

    async start() {
      return new Promise((resolve) => {
        if (this.worker) {
          setTimeout(resolve, 1)
        } else {
          this.worker = new Worker('../stockfish.js')
          this.worker.onmessage = msg => {
            this.notifyListeners('output', { line: msg.data })
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

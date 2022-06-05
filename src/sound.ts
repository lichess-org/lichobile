import throttle from 'lodash-es/throttle'
import settings from './settings'
import { isForeground } from './utils/appMode'

let ctx = typeof(window.AudioContext) != 'undefined' ? new AudioContext() : null

export default {
  load(): Promise<void> {
    return ctx == null 
      ? Promise.resolve()
      : Promise.all([
        loadSound('move').then(buf => (move = buf)),
        loadSound('capture').then(buf => (capture = buf)),
        loadSound('explosion').then(buf => (explosion = buf)),
        loadSound('lowtime').then(buf => (lowtime = buf)),
        loadSound('dong').then(buf => (dong = buf)),
        loadSound('berserk').then(buf => (berserk = buf)),
        loadSound('clock').then(buf => (clock = buf)),
        loadSound('confirmation').then(buf => (confirmation = buf)),
      ]).then(() => console.log('all sounds loaded.'))
  },
  
  resume(): void {
    if (ctx != null ) {  
      void ctx.close() // should be able to reuse these. However, webkit.
      ctx = new AudioContext()
    }
  },
  move(): void {
    play(move)
  },
  throttledMove: throttle(() => {
    play(move)
  }, 50),
  capture(): void {
    play(capture)
  },
  throttledCapture: throttle(() => {
    play(capture)
  }, 50),
  explosion(): void {
    play(explosion)
  },
  throttledExplosion: throttle(() => {
    play(explosion)
  }, 50),
  lowtime(): void {
    play(lowtime)
  },
  dong(): void {
    play(dong)
  },
  berserk(): void {
    play(berserk)
  },
  clock(): void {
    play(clock)
  },
  confirmation(): void {
    play(confirmation)
  },
}

let move: AudioBuffer
let capture: AudioBuffer
let explosion: AudioBuffer
let lowtime: AudioBuffer
let dong: AudioBuffer
let berserk: AudioBuffer
let clock: AudioBuffer
let confirmation: AudioBuffer

function loadSound(id: string): Promise<AudioBuffer> {
  return window
    .fetch(`sounds/${id}.mp3`)
    .then(rsp => rsp.arrayBuffer())
    .then(buf => ctx!.decodeAudioData(buf))
}

function play(snd: AudioBuffer): void {
  if (settings.general.sound() && isForeground() && ctx != null) {
    const mv = ctx.createBufferSource()
    mv.buffer = snd
    mv.connect(ctx.destination)
    mv.start()
  }
}

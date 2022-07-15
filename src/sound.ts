import { Capacitor } from '@capacitor/core'
import { SoundEffect } from 'capacitor-sound-effect'
import throttle from 'lodash-es/throttle'
import settings from './settings'
import { isForeground } from './utils/appMode'

let ctx = typeof(window.AudioContext) !== 'undefined' ? new AudioContext() : null

export default {
  load(): Promise<void> {
    return Promise.all([
      loadSound('move'),
      loadSound('capture'),
      loadSound('explosion'),
      loadSound('lowtime'),
      loadSound('dong'),
      loadSound('berserk'),
      loadSound('clock'),
      loadSound('confirmation'),
    ]).then(() => console.log('all sounds loaded.'))
  },

  resume(): void {
    if (ctx != null) {
      void ctx.close() // should be able to reuse these. However, webkit.
      ctx = new AudioContext()
    }
  },
  move(): void {
    play('move')
  },
  throttledMove: throttle(() => {
    play('move')
  }, 50),
  capture(): void {
    play('capture')
  },
  throttledCapture: throttle(() => {
    play('capture')
  }, 50),
  explosion(): void {
    play('explosion')
  },
  throttledExplosion: throttle(() => {
    play('explosion')
  }, 50),
  lowtime(): void {
    play('lowtime')
  },
  dong(): void {
    play('dong')
  },
  berserk(): void {
    play('berserk')
  },
  clock(): void {
    play('clock')
  },
  confirmation(): void {
    play('confirmation')
  },
}

const iosBuffers: {[id: string]: AudioBuffer } = {}

async function loadSound(id: string): Promise<void> {
  const path = `sounds/${id}.mp3`
  if (Capacitor.getPlatform() === 'ios' && ctx != null) {
    window
      .fetch(path)
      .then(rsp => rsp.arrayBuffer())
      .then(buf => ctx!.decodeAudioData(buf))
      .then(audio => iosBuffers[id] = audio)
  } else {
    SoundEffect.loadSound({ id, path })
  }
}

function play(id: string): void {
  if (settings.general.sound() && isForeground()) {
    if (Capacitor.getPlatform() === 'ios' && ctx != null) {
      const mv = ctx.createBufferSource()
      mv.buffer = iosBuffers[id]
      mv.connect(ctx.destination)
      mv.start()
    } else {
      SoundEffect.play({ id })
    }
  }
}

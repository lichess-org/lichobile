import throttle from 'lodash-es/throttle'
import { SoundEffect } from 'capacitor-sound-effect'
import { DeviceInfo } from '@capacitor/device'
import settings from './settings'
import { isForeground } from './utils/appMode'

function shouldPlay(): boolean {
  return settings.general.sound() && isForeground()
}

export default {
  load(info: DeviceInfo): Promise<void> {
    const ext = info.platform === 'ios' ? '.aifc' : '.mp3'

    return Promise.all([
      SoundEffect.loadSound({ id: 'move', path: `sounds/move${ext}` }),
      SoundEffect.loadSound({ id: 'capture', path: `sounds/capture${ext}` }),
      SoundEffect.loadSound({ id: 'explosion', path: `sounds/explosion${ext}` }),
      SoundEffect.loadSound({ id: 'lowtime', path: `sounds/lowtime${ext}` }),
      SoundEffect.loadSound({ id: 'dong', path: `sounds/dong${ext}` }),
      SoundEffect.loadSound({ id: 'berserk', path: `sounds/berserk${ext}` }),
      SoundEffect.loadSound({ id: 'clock', path: `sounds/clock${ext}` }),
      SoundEffect.loadSound({ id: 'confirmation', path: `sounds/confirmation${ext}` }),
    ]).then(() => { /* noop */ })
  },
  move() {
    if (shouldPlay()) SoundEffect.play({ id: 'move' })
  },
  throttledMove: throttle(() => {
    if (shouldPlay()) SoundEffect.play({ id: 'move' })
  }, 50),
  capture() {
    if (shouldPlay()) SoundEffect.play({ id: 'capture' })
  },
  throttledCapture: throttle(() => {
    if (shouldPlay()) SoundEffect.play({ id: 'capture' })
  }, 50),
  explosion() {
    if (shouldPlay()) SoundEffect.play({ id: 'explosion' })
  },
  throttledExplosion: throttle(() => {
    if (shouldPlay()) SoundEffect.play({ id: 'explosion' })
  }, 50),
  lowtime() {
    if (shouldPlay()) SoundEffect.play({ id: 'lowtime' })
  },
  dong() {
    if (shouldPlay()) SoundEffect.play({ id: 'dong' })
  },
  berserk() {
    if (shouldPlay()) SoundEffect.play({ id: 'berserk' })
  },
  clock() {
    if (shouldPlay()) SoundEffect.play({ id: 'clock' })
  },
  confirmation() {
    if (shouldPlay()) SoundEffect.play({ id: 'confirmation' })
  },
}

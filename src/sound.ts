import { Plugins } from '@capacitor/core'
import settings from './settings'
import * as throttle from 'lodash/throttle'

interface Media {
  move: string
  capture: string
  explosion: string
  lowtime: string
  dong: string
  berserk: string
  clock: string
  confirmation: string
}

let shouldPlay: boolean = settings.general.sound()
let lla: LLA
let media: Readonly<Media>

if (window.hotjs) {
  window.hotjs.Audio!.init!()
  lla = window.hotjs.Audio
} else {
  lla = window.plugins.LowLatencyAudio
}

Plugins.Device.getInfo().then(info => {
  const ext = info.platform === 'ios' ? '.aifc' : '.mp3'

  media = {
    move: `sounds/move${ext}`,
    capture: `sounds/capture${ext}`,
    explosion: `sounds/explosion${ext}`,
    lowtime: `sounds/lowtime${ext}`,
    dong: `sounds/dong${ext}`,
    berserk: `sounds/berserk${ext}`,
    clock: `sounds/clock${ext}`,
    confirmation: `sounds/confirmation${ext}`,
  }

  lla.preloadFX('move', media.move)
  lla.preloadFX('capture', media.capture)
  lla.preloadFX('explosion', media.explosion)
  lla.preloadFX('lowtime', media.lowtime)
  lla.preloadFX('dong', media.dong)
  lla.preloadFX('berserk', media.berserk)
  lla.preloadFX('clock', media.clock)
  lla.preloadFX('confirmation', media.confirmation)
})

export default {
  move() {
    if (shouldPlay) lla.play('move')
  },
  throttledMove: throttle(() => {
    if (shouldPlay) lla.play('move')
  }, 50),
  capture() {
    if (shouldPlay) lla.play('capture')
  },
  throttledCapture: throttle(() => {
    if (shouldPlay) lla.play('capture')
  }, 50),
  explosion() {
    if (shouldPlay) lla.play('explosion')
  },
  throttledExplosion: throttle(() => {
    if (shouldPlay) lla.play('explosion')
  }, 50),
  lowtime() {
    if (shouldPlay) lla.play('lowtime')
  },
  dong() {
    if (shouldPlay) lla.play('dong')
  },
  berserk() {
    if (shouldPlay) lla.play('berserk')
  },
  clock() {
    if (shouldPlay) lla.play('clock')
  },
  confirmation() {
    if (shouldPlay) lla.play('confirmation')
  },
  onSettingChange(v: boolean) {
    shouldPlay = v
  }
}

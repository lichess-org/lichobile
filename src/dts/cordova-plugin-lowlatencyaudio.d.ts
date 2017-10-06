interface LLA {
  preloadFX: (id: string, uri: string, success?: () => void, error?: (err: string) => void) => void
  preloadAudio: (id: string, uri: string, volume?: number, voices?: number, success?: () => void, error?: (err: string) => void) => void
  play: (label: string) => void
  init?: () => void
}

interface Plugins {
  LowLatencyAudio: LLA
}

interface Window {
  hotjs: {
    Audio: LLA
  }
}

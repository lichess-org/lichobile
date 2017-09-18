interface LLA {
  preloadFX: (label: string, uri: string, success: () => void, error: (err: string) => void) => void
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

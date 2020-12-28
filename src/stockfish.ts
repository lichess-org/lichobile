import { Plugins } from '@capacitor/core'
import { VariantKey } from './lichess/interfaces/variant'

export interface StockfishPlugin {
  addListener(event: 'output', callback: (v: { line: string }) => void): void
  removeAllListeners(): void
  getMaxMemory(): Promise<{ value: number }>
  start(): Promise<void>
  cmd(options: { cmd: string }): Promise<void>
  exit(): Promise<void>
}

export const Stockfish = Plugins.Stockfish as StockfishPlugin

export function send(text: string): Promise<void> {
  console.debug('[stockfish <<] ' + text)
  return Stockfish.cmd({ cmd: text })
}

export function setOption(name: string, value: string | number | boolean): Promise<void> {
  return send(`setoption name ${name} value ${value}`)
}

export function getNbCores(): number {
  const cores = window.deviceInfo.cpuCores
  return cores > 2 ? cores - 1 : 1
}

export function setVariant(variant: VariantKey): Promise<void> {

  const uci960p =
    setOption('UCI_Chess960', 'chess960' === variant)

  if (['standard', 'fromPosition', 'chess960'].includes(variant))
    return Promise.all([uci960p, setOption('UCI_Variant', 'chess')]).then(() => {})
  else if (variant === 'antichess')
    return setOption('UCI_Variant', 'giveaway')
  else
    return setOption('UCI_Variant', variant.toLowerCase())
}

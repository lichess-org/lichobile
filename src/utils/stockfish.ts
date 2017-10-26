import { VariantKey } from '../lichess/interfaces/variant'

interface XNavigator extends Navigator {
  hardwareConcurrency: number
}

export function send(text: string) {
  console.debug('[stockfish <<]', text)
  return Stockfish.cmd(text)
}

export function setOption(name: string, value: string | number | boolean) {
  return Stockfish.cmd(`setoption name ${name} value ${value}`)
}

export function getNbCores(): number {
  const cores = (<XNavigator>navigator).hardwareConcurrency || 1
  return cores > 2 ? cores - 1 : 1
}

export function setVariant(variant: VariantKey) {

  const uci960p =
    setOption('UCI_Chess960', 'chess960' === variant)

  if (['standard', 'fromPosition', 'chess960'].includes(variant))
    return Promise.all([uci960p, setOption('UCI_Variant', 'chess')])
  else if (variant === 'antichess')
    return setOption('UCI_Variant', 'giveaway')
  else
    return setOption('UCI_Variant', variant.toLowerCase())
}

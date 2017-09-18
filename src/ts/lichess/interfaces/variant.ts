
export type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse'

export interface Variant {
  key: VariantKey
  name: string
  short: string
  title?: string
}

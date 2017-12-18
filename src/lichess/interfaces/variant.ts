
export type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse'

export interface Variant {
  readonly key: VariantKey
  readonly name: string
  readonly short: string
  readonly title?: string
}

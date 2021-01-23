import { base62ToNumber } from '../index'

describe('base62ToNumber', () => {
  it('returns null for empty strings', () => {
    expect(base62ToNumber('')).toBeUndefined()
  })

  it('returns null for large strings', () => {
    expect(base62ToNumber('cAh2fnMq')).toBeUndefined()
  })

  it('returns null for malformed strings', () => {
    expect(base62ToNumber('c!fg')).toBeUndefined()
  })

  it('works on a variety of known numbers', () => {
    Object.entries({
      "OOw2R": 264252818,
      "tzQPe": 446929711,
      "aRWYk": 537753616,
    }).forEach(([base62, expected]) => {
      expect(base62ToNumber(base62)).toBe(expected)
    })
  })
})

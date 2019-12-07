import * as utils from '../object'

describe('object utils', () => {
  it('can get an object value at path', () => {
    const o = { a: 1, b: 2, c: { d: 3 }}
    expect(utils.getAtPath(o, 'c.d')).toBe(3)

    const o2 = { a: 1, b: 2, c: { d: 3 }}
    expect(utils.getAtPath(o2, 'd')).toBe(undefined)
    expect(utils.getAtPath(o2, 'd.e')).toBe(undefined)
  })

  it('can set an object value at path', () => {
    const o: any = { a: 1, b: 2, c: { d: 3 }}

    utils.setAtPath(o, 'c.e', 4)
    expect(o.c.e).toBe(4)

    const o2: any = { a: 1, b: 2, c: { d: 3 }}
    utils.setAtPath(o2, 'c.d', 4)
    expect(o2.c.d).toBe(4)

    const o3: any = { a: 1, b: 2, c: { d: 3 }}
    utils.setAtPath(o3, 'f.g', 9)
    expect(o3.f.g).toBe(9)
  })
})

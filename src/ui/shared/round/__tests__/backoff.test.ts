import backoff from '../backoff'

describe('backoff', () => {
  jest.useFakeTimers()

  test('executes the first call immediately', () => {
    // expected delays: 0, 200, 400, 800, ...
    const mockCallback = jest.fn(() => { /* noop */})
    const backedOff = backoff(100, 2, mockCallback)

    backedOff()
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(0)
  })

  test('debounces repeated calls', () => {
    const mockCallback = jest.fn(() => { /* noop */})
    const backedOff = backoff(100, 2, mockCallback)
    backedOff()

    for (let i = 0; i < 10; i++) {
      backedOff()
    }
    expect(mockCallback).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(1000)
    expect(mockCallback).toHaveBeenCalledTimes(2)
  })

  test('multiplies delay by factor', () => {
    // expected delays: 0, 2000, 4000, 8000, ...
    const mockCallback = jest.fn(() => { /* noop */})
    const backedOff = backoff(1000, 2, mockCallback)
    backedOff()

    const expectedDelays = [2000, 4000, 8000]
    expectedDelays.forEach((ms, index) => {
      backedOff()
      jest.advanceTimersByTime(ms - 100)
      expect(mockCallback).toHaveBeenCalledTimes(index + 1)
      jest.advanceTimersByTime(100)
      expect(mockCallback).toHaveBeenCalledTimes(index + 2)
    });
  })

  test('works with arrow functions', () => {
    let x = 0
    const callback = () => {
      x++
    }
    const backedOff = backoff(1000, 2, callback)
    backedOff()
    expect(x).toBe(1)

    backedOff()
    jest.runAllTimers()
    expect(x).toBe(2)
  })

  test('works with object methods', () => {
    class Obj {
      x = 0
      callback = () => {
        this.x++
      }
    }
    const obj = new Obj()
    const backedOff = backoff(1000, 2, obj.callback)
    backedOff()
    expect(obj.x).toBe(1)

    backedOff()
    jest.runAllTimers()
    expect(obj.x).toBe(2)
  })
})

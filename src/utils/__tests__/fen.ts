import * as fen from '../fen'

describe('Fen utils', () => {
  it('validates standard fens', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    ]
    fens.forEach(f => {
      expect(fen.validateFen(f)).toBe(true)
    })
  })

  it('validates threecheck fens', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 +0+0',
      'r1bqkbnr/pppp2pp/8/4p1NQ/1n2P3/8/PPPP1PPP/RNB1K2R b KQ - 5 6 +3+0'
    ]
    fens.forEach(f => {
      expect(fen.validateFen(f, 'threeCheck')).toBe(true)
    })
  })

  it('validates crazyhouse fens', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/ w KQkq - 0 1',
      'r1b2bnr/ppp1pkpp/2n5/q7/8/2N5/PPPP1PPP/R1BQK1NR/PPbp w KQ - 10 6'
    ]
    fens.forEach(f => {
      expect(fen.validateFen(f, 'crazyhouse')).toBe(true)
    })
  })
})

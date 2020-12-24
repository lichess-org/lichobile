import ForecastCtrl from '../ForecastCtrl'
import { ForecastStep, MinimalForecastStep } from '~/lichess/interfaces/forecast'

const fctrl = new ForecastCtrl({ onMyTurn: true })
const notMyTurnFctrl = new ForecastCtrl({ onMyTurn: false })
const emptyLine: MinimalForecastStep[] = []
const kingsPawn = [{ ply: 1, uci: 'e2e4' }]
const queensPawn = [{ ply: 1, uci: 'd2d4' }]
const kingsPawnGame = [
  { ply: 1, uci: 'e2e4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'e7e5', fen: 'fen', san: 'san' },
]
const queensPawnGame = [
  { ply: 1, uci: 'd2d4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'd7d5', fen: 'fen', san: 'san' },
]
const sicilian = [
  { ply: 1, uci: 'e2e4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'c7c5', fen: 'fen', san: 'san' },
]
const petrov = [
  { ply: 1, uci: 'e2e4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'e7e5', fen: 'fen', san: 'san' },
  { ply: 3, uci: 'g1f3', fen: 'fen', san: 'san' },
  { ply: 4, uci: 'g8f6', fen: 'fen', san: 'san' },
]
const kingsKnight = [
  { ply: 1, uci: 'e2e4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'e7e5', fen: 'fen', san: 'san' },
  { ply: 3, uci: 'g1f3', fen: 'fen', san: 'san' },
]
const centerGame = [
  { ply: 1, uci: 'e2e4', fen: 'fen', san: 'san' },
  { ply: 2, uci: 'e7e5', fen: 'fen', san: 'san' },
  { ply: 3, uci: 'd2d4', fen: 'fen', san: 'san' },
]

describe('ForecastCtrl', () => {
  describe('isPrefix', () => {
    test('an empty line is a prefix of anything', () => {
      expect(fctrl.isPrefix(kingsPawn, emptyLine)).toBe(true)
    })
    test('a line is a prefix of itself', () => {
      expect(fctrl.isPrefix(kingsPawn, kingsPawn)).toBe(true)
    })
    test('non-empty prefixes', () => {
      expect(fctrl.isPrefix(kingsPawnGame, kingsPawn)).toBe(true)
      expect(fctrl.isPrefix(kingsPawn, kingsPawnGame)).toBe(false)
    })
    test('colliding lines', () => {
      expect(fctrl.isPrefix(kingsPawnGame, sicilian)).toBe(false)
      expect(fctrl.isPrefix(sicilian, kingsPawnGame)).toBe(false)
    })
  })

  describe('collides', () => {
    describe('on either player\'s turn', () => {
      [fctrl, notMyTurnFctrl].forEach((ctrl) => {
        test('empty lines cannot collide with anything', () => {
          expect(ctrl.collides(emptyLine, emptyLine)).toBe(false)
          expect(ctrl.collides(kingsPawnGame, emptyLine)).toBe(false)
          expect(ctrl.collides(emptyLine, kingsPawnGame)).toBe(false)
        })
        test('lines does not collide with themselves', () => {
          expect(ctrl.collides(kingsPawn, kingsPawn)).toBe(false)
          expect(ctrl.collides(kingsPawnGame, kingsPawnGame)).toBe(false)
        })
        test('prefixes are not collisions', () => {
          expect(ctrl.collides(kingsPawn, kingsPawnGame)).toBe(false)
          expect(ctrl.collides(kingsPawnGame, kingsPawn)).toBe(false)
          expect(ctrl.collides(kingsPawnGame, petrov)).toBe(false)
          expect(ctrl.collides(kingsPawn, petrov)).toBe(false)
          expect(ctrl.collides(petrov, kingsPawnGame)).toBe(false)
          expect(ctrl.collides(petrov, kingsPawn)).toBe(false)
        })
      })
    })

    // collides when the first divergence is on an *even*-index ply >= 2
    describe('on the current player\'s turn', () => {
      test('single- and double-ply forecasts cannot collide', () => {
        expect(fctrl.collides(queensPawn, kingsPawn)).toBe(false)
        expect(fctrl.collides(queensPawn, kingsPawnGame)).toBe(false)
        expect(fctrl.collides(kingsPawn, queensPawn)).toBe(false)
        expect(fctrl.collides(kingsPawnGame, queensPawn)).toBe(false)
        expect(fctrl.collides(kingsPawnGame, queensPawnGame)).toBe(false)
        expect(fctrl.collides(queensPawnGame, kingsPawnGame)).toBe(false)
      })
      test('forecasts with the first divergence on an odd index do not collide', () => {
        expect(fctrl.collides(kingsPawnGame, sicilian)).toBe(false)
        expect(fctrl.collides(sicilian, kingsPawnGame)).toBe(false)
      })
      test('forecasts with the first divergence on an even index >= 2 collide', () => {
        expect(fctrl.collides(centerGame, kingsKnight)).toBe(true)
        expect(fctrl.collides(kingsKnight, centerGame)).toBe(true)
      })
    })

    describe('on the other player\'s turn', () => {
      test('single-ply lines do not collide', () => {
        expect(notMyTurnFctrl.collides(queensPawn, kingsPawn)).toBe(false)
      })
      test('forecasts with the first divergence on an odd index collide', () => {
        expect(notMyTurnFctrl.collides(kingsPawnGame, sicilian)).toBe(true)
      })
      test('forecasts with a divergence on an even ply do not collide', () => {
        expect(notMyTurnFctrl.collides(queensPawnGame, kingsPawnGame)).toBe(false)
        expect(notMyTurnFctrl.collides(kingsPawnGame, queensPawnGame)).toBe(false)
      })
    })
  })

  describe('isCandidate', () => {
    const existingLines: ForecastStep[][] = [
      kingsPawnGame,
    ]
    const existingLinesFctrl = new ForecastCtrl({onMyTurn: true, steps: existingLines})

    test('prefixes of existing lines are not candidates', () => {
      expect(existingLinesFctrl.isCandidate(kingsPawn)).toBe(false)
    })
    test('extensions of existing lines are candidates', () => {
      expect(existingLinesFctrl.isCandidate(kingsKnight)).toBe(true)
    })
    test('divergent lines are candidates', () => {
      expect(existingLinesFctrl.isCandidate(queensPawnGame)).toBe(true)
    })
    test('empty lines are not candidates', () => {
      expect(existingLinesFctrl.isCandidate([])).toBe(false)
    })
    describe('on the current player\'s turn', () => {
      test('single-ply lines are candidates', () => {
        expect(existingLinesFctrl.isCandidate(queensPawn)).toBe(true)
      })
    })
    describe('on the other player\'s turn', () => {
      const fctrl = new ForecastCtrl({onMyTurn: false})
      test('single-ply lines are not candidates', () => {
        expect(fctrl.isCandidate(queensPawn)).toBe(false)
      })
      test('double-ply lines are candidates', () => {
        expect(fctrl.isCandidate(queensPawnGame)).toBe(true)
      })
    })
  })
})

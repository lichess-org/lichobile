import { castlesMetadataStr, castlingToggleFEN } from '../util'
import { prop } from '~/utils/index'

describe('Editor utils', () => {
  const falseProp = prop<boolean>(false)
  const trueProp = prop<boolean>(true)

  describe('castlingToggleFEN', () => {
    test('returns an empty string when all toggles are off', () => {
      expect(castlingToggleFEN({K: falseProp, Q: falseProp, k: falseProp, q: falseProp})).toEqual('')
    })
    test('returns KQkq when all toggles are on', () => {
      expect(castlingToggleFEN({K: trueProp, Q: trueProp, k: trueProp, q: trueProp})).toEqual('KQkq')
    })
    test('skips over unrecognized toggles', () => {
      expect(castlingToggleFEN({K: trueProp, Q: trueProp, k: trueProp, q: trueProp, something: trueProp})).toEqual('KQkq')
    })
  })

  describe('castlesMetadataStr', () => {
    const allTogglesOn = {K: trueProp, Q: trueProp, k: trueProp, q: trueProp}
    const allTogglesOff = {K: falseProp, Q: falseProp, k: falseProp, q: falseProp}
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

    test('returns only legal castles regardless of toggles', () => {
      const noLegalCastlesFEN = '1n2b3/P2P1P1P/6K1/2QBkNR1/5N2/3P2P1/1R6/B7'
      expect(castlesMetadataStr(allTogglesOn, noLegalCastlesFEN)).toEqual('-')
    })

    test('respects toggles', () => {
      expect(castlesMetadataStr(allTogglesOn, startingFen)).toEqual('KQkq')
      expect(castlesMetadataStr(allTogglesOff, startingFen)).toEqual('-')
    })
  })
})

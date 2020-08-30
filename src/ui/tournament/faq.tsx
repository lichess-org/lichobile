import h from 'mithril/hyperscript'
import router from '../../router'
import i18n, { plural } from '../../i18n'
import * as helper from '../helper'
import { closeIcon } from '../shared/icons'
import TournamentCtrl from './detail/TournamentCtrl'

export interface FaqCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  root: TournamentCtrl
}

export default {
  controller(root: TournamentCtrl): FaqCtrl {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen() {
        return isOpen
      },
      root
    }
  },

  view: function(ctrl: FaqCtrl) {
    if (!ctrl.isOpen()) return null
    const tournament = ctrl.root.tournament

    if (!tournament) return null
    return (
      <div className="modal" id="tournamentFaqModal" oncreate={helper.slidesInUp}>
        <header>
          <button className="modal_close"
            oncreate={helper.ontap(helper.slidesOutDown(ctrl.close, 'tournamentFaqModal'))}
          >
            { closeIcon }
          </button>
          <h2>{i18n('tournamentFAQ')}</h2>
        </header>
        <div className="modal_content">
          <div className="tournamentFaq">
            <p>{i18n('willBeNotified')}</p>

            <h2>{i18n('isItRated')}</h2>
            <p>{i18n('someRated')}</p>

            <h2>{i18n('howAreScoresCalculated')}</h2>
            <p>{i18n('howAreScoresCalculatedAnswer')}</p>

            <h2>{i18n('berserk')}</h2>
            <p>{i18n('berserkAnswer')}</p>

            <h2>{i18n('howIsTheWinnerDecided')}</h2>
            <p>{i18n('howIsTheWinnerDecidedAnswer')}</p>

            <h2>{i18n('howDoesPairingWork')}</h2>
            <p>{i18n('howDoesPairingWorkAnswer')}</p>

            <h2>{i18n('howDoesItEnd')}</h2>
            <p>{i18n('howDoesItEndAnswer')}</p>

            <h2>{i18n('otherRules')}</h2>
            <p>{i18n('thereIsACountdown')}</p>
            <p>{plural('drawingWithinNbMoves', 10)}</p>
          </div>
        </div>
      </div>
    )
  }
}

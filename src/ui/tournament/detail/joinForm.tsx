import h from 'mithril/hyperscript'
import popupWidget from '../../shared/popup'
import i18n from '../../../i18n'
import router from '../../../router'
import TournamentCtrl from './TournamentCtrl'
import formWidgets from '../../shared/form'
import settings from '../../../settings'

let isOpen = false
let tournamentCtrl: TournamentCtrl

export default {
  open,
  close,
  view() {
    return popupWidget(
      'tournament_addtl_info_popup',
      undefined,
      () => renderForm(),
      isOpen,
      close
    )
  }
}

function open(ctrl: TournamentCtrl) {
  router.backbutton.stack.push(close)
  isOpen = true
  tournamentCtrl = ctrl
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function renderForm() {
  const t = tournamentCtrl.tournament
  const tb = t.teamBattle
  const teamList: string[][] = tb ?
    tb.joinWith.map(x => [tb.teams[x], x]).filter(x => x[0]) as string[][]
    :
    []

  return (
    <form id="tournamentPasswordForm" class="tournamentForm"
    onsubmit={function(e: Event) {
      e.preventDefault()
      return join(e.target as HTMLFormElement)
    }}>
      <fieldset>
        <div className={'select_input no_arrow_after' + (t.private ? '' : ' notVisible')}>
          <div className="text_input_container">
            <label>Password: </label>
            <input type="text" id="tournamentPassword" className="passwordField" />
          </div>
        </div>
        <div className={'select_input no_arrow_after' + (t.teamBattle ? '' : ' notVisible')}>
          {formWidgets.renderSelect('Team', 'team', teamList, settings.tournament.join.lastTeam, false)}
        </div>
      </fieldset>
      <div className="popupActionWrapper">
        <button className="popupAction" type="submit">
          <span className="fa fa-check" />
          {i18n('join')}
        </button>
      </div>
    </form>
  )
}

function join(form: HTMLFormElement) {
  const elements: HTMLCollection = (form[0] as HTMLFieldSetElement).elements as HTMLCollection
  const password = (elements[0] as HTMLInputElement).value
  const team = (elements[1] as HTMLTextAreaElement).value

  tournamentCtrl.join(password, team)
  close()
}

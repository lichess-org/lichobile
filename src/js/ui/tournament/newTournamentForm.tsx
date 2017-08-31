import settings from '../../settings'
import i18n from '../../i18n'
import router from '../../router'
import * as utils from '../../utils'
import { TournamentCreateResponse } from '../../lichess/interfaces/tournament'
import popupWidget from '../shared/popup'
import formWidgets from '../shared/form'

import TournamentsListCtrl from './TournamentsListCtrl'
import * as xhr from './tournamentXhr'

let isOpen = false

export default {
  open,
  close,
  view(ctrl: TournamentsListCtrl) {
    return popupWidget(
      'tournament_form_popup',
      undefined,
      () => renderForm(ctrl),
      isOpen,
      close
    )
  }
}

function open() {
  router.backbutton.stack.push(close)
  isOpen = true
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}


function renderForm(ctrl: TournamentsListCtrl) {
  return (
    <form id="tournamentCreateForm"
    onsubmit={function(e: Event) {
      e.preventDefault()
      return create(e.target as HTMLFormElement)
    }}>
      <fieldset>
        <div className="select_input">
          {formWidgets.renderSelect('Variant', 'variant', settings.tournament.availableVariants, settings.tournament.variant, false)}
        </div>
        <div className={'select_input' + (settings.tournament.variant() !== '1' ? ' notVisible' : '')}>
          <label for="select_start_position">
            Position
          </label>
          <select id="select_start_position" className="positions">
            <option value="---">Initial Position</option>
            {ctrl.startPositions.map(c => {
              return (
                <optgroup label={c.name}>
                  {c.positions.map(p =>
                    <option value={p.eco}>{p.eco + ' ' + p.name}</option>
                  )}
                </optgroup>
              )
            })}
          </select>
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Mode', 'mode', settings.tournament.availableModes, settings.tournament.mode, false)}
        </div>
        <div className="select_input inline">
          {formWidgets.renderSelect('Time', 'time', settings.tournament.availableTimes, settings.tournament.time, false)}
        </div>
        <div className="select_input inline no-margin">
          {formWidgets.renderSelect('Increment', 'increment', settings.tournament.availableIncrements.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.increment, false)}
        </div>
        <div className="select_input inline">
          {formWidgets.renderSelect('Duration', 'duration', settings.tournament.availableDurations.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.duration, false)}
        </div>
        <div className="select_input inline no-margin">
          {formWidgets.renderSelect('Time to Start', 'timeToStart', settings.tournament.availableTimesToStart.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.timeToStart, false)}
        </div>
        <div className="select_input">
          {formWidgets.renderCheckbox(i18n('isPrivate'), 'private', settings.tournament.private)}
        </div>
        <div className={'select_input no_arrow_after' + (settings.tournament.private() ? '' : ' notVisible')}>
          <div className="text_input_container">
            <label>Password: </label>
            <input type="text"
              id="password"
              className="passwordField"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck={false}
            />
          </div>
        </div>
      </fieldset>
      <div className="popupActionWrapper">
        <button key="create" className="popupAction" type="submit">
          <span className="fa fa-check" />
          {i18n('createANewTournament')}
        </button>
      </div>
    </form>
  )
}

function create(form: HTMLFormElement) {
  const elements: HTMLCollection = form[0].elements as HTMLCollection
  const variant = (elements[0] as HTMLInputElement).value
  const position = settings.tournament.variant() === '1' ? (elements[1] as HTMLInputElement).value : '---'
  const mode = (elements[2] as HTMLInputElement).value
  const time = (elements[3] as HTMLTextAreaElement).value
  const increment = (elements[4] as HTMLTextAreaElement).value
  const duration = (elements[5] as HTMLTextAreaElement).value
  const timeToStart = (elements[6] as HTMLTextAreaElement).value
  const isPrivate = (elements[7] as HTMLInputElement).checked ? (elements[7] as HTMLInputElement).value : ''
  const password = isPrivate ? (elements[8] as HTMLInputElement).value : ''

  xhr.create(variant, position, mode, time, increment, duration, timeToStart, isPrivate, password)
  .then((data: TournamentCreateResponse) => {
    close()
    router.set('/tournament/' + data.id)
  })
  .catch(utils.handleXhrError)
}

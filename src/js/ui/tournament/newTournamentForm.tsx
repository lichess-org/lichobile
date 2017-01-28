import settings from '../../settings';
import formWidgets from '../shared/form';
import * as utils from '../../utils';
import popupWidget from '../shared/popup';
import i18n from '../../i18n';
import router from '../../router';
import { handleXhrError } from '../../utils';
import { TournamentListsState, TournamentCreateResponse } from './interfaces';
import * as xhr from './tournamentXhr';

let isOpen = false;

export default {
  open,
  close,
  view(ctrl: TournamentListsState) {
    return popupWidget(
      'tournament_form_popup',
      null,
      () => renderForm(ctrl),
      isOpen,
      close
    );
  }
};

function open() {
  router.backbutton.stack.push(close);
  isOpen = true;
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
}


function renderForm(ctrl: TournamentListsState) {
  return (
    <form id="tournamentCreateForm"
    onsubmit={function(e: Event) {
      e.preventDefault();
      return create(e.target as HTMLFormElement);
    }}>
      <fieldset>
        <div className="select_input">
          {formWidgets.renderSelect('Variant', 'variant', settings.tournament.availableVariants, settings.tournament.variant, false, null)}
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
          {formWidgets.renderSelect('Mode', 'mode', settings.tournament.availableModes, settings.tournament.mode, false, null)}
        </div>
        <div className="select_input inline">
          {formWidgets.renderSelect('Time', 'time', settings.tournament.availableTimes, settings.tournament.time, false, null)}
        </div>
        <div className="select_input inline no-margin">
          {formWidgets.renderSelect('Increment', 'increment', settings.tournament.availableIncrements.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.increment, false, null)}
        </div>
        <div className="select_input inline">
          {formWidgets.renderSelect('Duration', 'duration', settings.tournament.availableDurations.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.duration, false, null)}
        </div>
        <div className="select_input inline no-margin">
          {formWidgets.renderSelect('Time to Start', 'timeToStart', settings.tournament.availableTimesToStart.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.timeToStart, false, null)}
        </div>
      </fieldset>
      <button key="create" className="newGameButton" type="submit">
        <span className="fa fa-check" />
        {i18n('createANewTournament')}
      </button>
    </form>
  );
}

function create(form: HTMLFormElement) {
  const elements: HTMLCollection = form[0].elements as HTMLCollection;
  const variant = (elements[0] as HTMLInputElement).value;
  const position = settings.tournament.variant() === '1' ? (elements[1] as HTMLInputElement).value : '---';
  const mode = (elements[2] as HTMLInputElement).value;
  const time = (elements[3] as HTMLTextAreaElement).value;
  const increment = (elements[4] as HTMLTextAreaElement).value;
  const duration = (elements[5] as HTMLTextAreaElement).value;
  const timeToStart = (elements[6] as HTMLTextAreaElement).value;
  xhr.create(variant, position, mode, time, increment, duration, timeToStart)
  .then((data: TournamentCreateResponse) => {
    close(null);
    router.set('/tournament/' + data.id)
  })
  .catch(handleXhrError);
}

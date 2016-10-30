import { header, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import settings from '../../../settings';
import formWidgets from '../../shared/form';
import {TournamentCreateState} from '../interfaces';
import * as utils from '../../../utils';

export default function view(vnode: Mithril.Vnode<{}>) {
  const ctrl = vnode.state as TournamentCreateState;
  const headerCtrl = () => header(null,
    backButton(i18n('createANewTournament'))
  );
  const body = () => tournamentCreateBody(ctrl);

  return layout.free(headerCtrl, body, null, null);
}

function tournamentCreateBody(ctrl: TournamentCreateState) {

  return (
    <div className="tournamentCreate">
      <form id="tournamentCreateForm"
      onsubmit={function(e: Event) {
        e.preventDefault();
        return ctrl.create(e.target as HTMLFormElement);
      }}>
        <div className="select_input">
          {formWidgets.renderSelect('Variant', 'variant', settings.tournament.availableVariants, settings.tournament.variant, false, null)}
        </div>
        <div className={'select_input' + (settings.tournament.variant() !== '1' ? ' hide' : '')}>
          {formWidgets.renderSelectWithGroups('Position', 'position', settings.tournament.availablePositions, settings.tournament.position, false, null)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Mode', 'mode', settings.tournament.availableModes, settings.tournament.mode, false, null)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.tournament.availableTimes, settings.tournament.time, false, null)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.tournament.availableIncrements.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.increment, false, null)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Duration', 'duration', settings.tournament.availableDurations.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.duration, false, null)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Time to Start', 'timeToStart', settings.tournament.availableTimesToStart.map((x: string) => utils.tupleOf(Number(x))), settings.tournament.timeToStart, false, null)}
        </div>
        <button key="create" className="fatButton tournamentCreateSubmit" type="submit">
          <span className="fa fa-check" />
          {i18n('createANewTournament')}
        </button>
      </form>
    </div>
  );
}

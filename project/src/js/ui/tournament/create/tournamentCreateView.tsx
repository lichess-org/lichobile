import { header, backButton } from '../../shared/common';
import router from '../../../router';
import session from '../../../session';
import layout from '../../layout';
import * as m from 'mithril';
import i18n from '../../../i18n';
import { gameIcon, formatTimeInSecs, formatTournamentDuration, formatTournamentTimeControl } from '../../../utils';
import faq from '../faq';
import playerInfo from '../playerInfo';
import * as helper from '../../helper';
import settings from '../../../settings';
import miniBoard from '../../shared/miniBoard';
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
      <div className="select_input">
        {formWidgets.renderSelect('Variant', 'variant', settings.tournament.availableVariants, settings.tournament.variant, false, null)}
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
    </div>
  );
}

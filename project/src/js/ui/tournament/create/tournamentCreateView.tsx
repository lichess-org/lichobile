import { header as headerWidget, backButton } from '../../shared/common';
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

export default function view(vnode) {
  const ctrl = vnode.state;

  const body = () => tournamentCreateBody(ctrl);

  return layout.free(header.bind(undefined, i18n('createANewTournament')), body);
}

function tournamentCreateBody(ctrl) {

  return (
    null
  );
}

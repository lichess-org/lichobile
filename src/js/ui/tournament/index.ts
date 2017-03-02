import * as stream from 'mithril/stream';
import * as helper from '../helper';
import socket from '../../socket';
import redraw from '../../utils/redraw';
import { handleXhrError, loadLocalJsonFile } from '../../utils';
import * as xhr from './tournamentXhr';
import settings from '../../settings';
import { TournamentListState } from './interfaces';
import { TournamentListItem, TournamentLists } from '../../lichess/interfaces/tournament'
import session from '../../session';
import { header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import newTournamentForm from './newTournamentForm';

import { tournamentListBody, renderFooter } from './tournamentView';

interface Attrs {
  tab: string
}

const TournamentListScreen: Mithril.Component<Attrs, TournamentListState> = {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    helper.analyticsTrackView('Tournament List');

    socket.createDefault();

    this.tournaments = stream<TournamentLists>();
    this.currentTab = stream<string>(attrs.tab || 'started');
    this.startPositions = []

    xhr.currentTournaments()
    .then(data => {
      data.started = data.started.filter(supported);
      data.created = data.created.filter(supported);
      data.finished = data.finished.filter(supported);
      data.started.sort(sortByLichessAndDate);
      data.finished.sort(sortByEndDate);
      this.tournaments(data);
      redraw();
    })
    .catch(handleXhrError);

    loadLocalJsonFile<Array<BoardPositionCategory>>('data/positions.json')
    .then(data => {
      this.startPositions = data
      redraw()
    });
  },

  view(vnode) {
    const ctrl = vnode.state
    const bodyCtrl = () => tournamentListBody(ctrl)
    const footer = session.isConnected() ? () => renderFooter() : undefined
    const overlay = () => newTournamentForm.view(ctrl)

    return layout.free(() => header(i18n('tournaments')), bodyCtrl, footer, overlay)
  }

}

export default TournamentListScreen

function supported(t: TournamentListItem) {
  return settings.game.supportedVariants.indexOf(t.variant.key) !== -1;
}

function sortByLichessAndDate(a: TournamentListItem, b: TournamentListItem) {
  if (a.createdBy === 'lichess' && b.createdBy === 'lichess') {
    return a.startsAt - b.startsAt;
  } else if (a.createdBy === 'lichess') {
    return -1;
  } else {
    return 1;
  }
}

function sortByEndDate(a: TournamentListItem, b: TournamentListItem) {
  return b.finishesAt - a.finishesAt;
}

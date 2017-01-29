import socket from '../../socket';
import redraw from '../../utils/redraw';
import { handleXhrError, loadLocalJsonFile } from '../../utils';
import * as xhr from './tournamentXhr';
import * as helper from '../helper';
import settings from '../../settings';
import { TournamentListAttrs, TournamentListItem, TournamentListsState, TournamentLists } from './interfaces';
import * as stream from 'mithril/stream';

export default function oninit(vnode: Mithril.Vnode<TournamentListAttrs, TournamentListsState>) {
  helper.analyticsTrackView('Tournament List');

  socket.createDefault();

  this.tournaments = stream<TournamentLists>();
  this.currentTab = stream<string>(vnode.attrs.tab || 'started');
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

  loadLocalJsonFile('data/positions.json')
  .then(data => {
    this.startPositions = data
    redraw()
  });
}

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

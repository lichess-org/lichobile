import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import socketHandler from './socketHandler';
import helper from '../helper';
import m from 'mithril';

export default function controller() {

  const tournament = m.prop([]);

  this.tournament = function (tournamentId) {

    helper.analyticsTrackView('Tournament ' + tournamentId);

    xhr.tournament(tournamentId).then(data => {
      console.log(data);
      tournament(data);
      return data;
    }, err => utils.handleXhrError(err));

    socket.createTournament(tournament().socketVersion, tournamentId, socketHandler(this));

    return {
      tournament,
      onunload: () => {
        socket.destroy();
      }
    };
  }.bind(this);

  this.reload = function (data) {
    tournament(data);
    if(data.socketVersion)
      socket.setVersion(data.socketVersion);
    m.redraw(false, true);
  }.bind(this);

  this.tournamentId = function () {
    return tournament().id;
  }.bind(this);

  let id = m.route.param('id');
  return this.tournament(id);
}
